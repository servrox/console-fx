"use client";
import { CatalogueSidebar } from "../examples/catalogue-sidebar";
import {
  DEFAULT_EXAMPLE_ID,
  listCatalogue,
  resolveExample,
  withAutomaticSizing,
} from "../examples/catalogue";
import { resolveCapabilities } from "../examples/capabilities";
import { useExampleNavigation } from "../examples/use-example-navigation";
import { TabList } from "../experience/tab-list";
import { CopyMark } from "../experience/action-feedback";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  getEffectDescriptors,
  LIMITS,
  parseScene,
  parseRenderRecipe,
  utf8ByteLength,
} from "@servrox/console-fx";
import type {
  EffectKind,
  ParameterDescriptor,
  Renderer,
  RenderRecipeV1,
} from "@servrox/console-fx";
import { resolveMotion } from "@servrox/console-fx/browser";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";
import {
  encodeShare,
  isRecipe,
  type SavedDocument,
} from "../persistence/documents";
import { sameDocument, recipeOf } from "./document";
import { ConfirmDialog } from "./confirm-dialog";
import { useDocumentSession } from "./use-document-session";
import { rendererForLoadedScene } from "./renderer";
import { CardFields } from "./card-fields";
import { FitInspector } from "./fit-inspector";
import { useLocalMeasurements } from "./use-local-measurements";
import { cardDescriptor, editCardParameter } from "./presentation";
import { useClipboardCopy } from "../export/use-clipboard-copy";
import {
  prepareExport,
  formats,
  type ExportFormat,
} from "../export/prepare-export";

const descriptors = getEffectDescriptors();
const initialExample = resolveExample({ exampleId: DEFAULT_EXAMPLE_ID });
if (!initialExample.ok) throw new Error(initialExample.message);
const workbenchInitial = initialExample.recipe;
function download(scene: SavedDocument) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = isRecipe(scene)
    ? "console-fx-recipe.json"
    : "console-fx-scene.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  disabled = false,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly unit?: string;
  readonly disabled?: boolean;
  readonly onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="range-field">
      <div>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        disabled={disabled}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
function ParameterField({
  name,
  parameter,
  value,
  onChange,
}: {
  readonly name: string;
  readonly parameter: ParameterDescriptor;
  readonly value: unknown;
  readonly onChange: (value: string | number | boolean) => void;
}) {
  const label = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
  if (parameter.type === "number")
    return (
      <RangeField
        label={label}
        value={Number(value ?? parameter.default)}
        min={parameter.min}
        max={parameter.max}
        step={parameter.step}
        onChange={onChange}
      />
    );
  if (parameter.type === "color")
    return (
      <label className="color-field">
        {label}
        <input
          type="color"
          value={String(value ?? parameter.default).slice(0, 7)}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  if (parameter.type === "enum")
    return (
      <label>
        {label}
        <select
          value={String(value ?? parameter.default)}
          onChange={(event) => onChange(event.target.value)}
        >
          {parameter.values.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    );
  return (
    <label className="check-field">
      <input
        type="checkbox"
        checked={Boolean(value ?? parameter.default)}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export function Studio() {
  const [selection, setSelection] = useState({ line: 0, run: 0 });
  const [playing, setPlaying] = useState(false);
  const onTransition = useCallback((resetSelection: boolean) => {
    setPlaying(false);
    if (resetSelection) setSelection({ line: 0, run: 0 });
  }, []);
  const session = useDocumentSession(workbenchInitial, { onTransition });
  const {
    document,
    persisted,
    ready,
    dispatch,
    notice,
    setNotice,
    draftStatus,
    storageIssue,
    pendingShared,
    confirmReset,
  } = session;
  const navigation = useExampleNavigation(session, true);
  const [panel, setPanel] = useState<"edit" | "output" | "code">("edit");
  const [rendererChange, setRendererChange] = useState<Renderer | null>(null);
  const [copiedSource, setCopiedSource] = useState<string | null>(null);
  const { copy, copying, failedCopy } = useClipboardCopy(
    ({ kind, label, text }) => {
      setCopiedSource(kind === "copied" ? text : null);
      setNotice(
        kind === "copying"
          ? { kind: "info", message: `Copying ${label}…` }
          : kind === "copied"
            ? { kind: "success", message: `${label} copied.` }
            : {
                kind: "error",
                message:
                  "Clipboard access failed. Select the captured text below and copy it manually, or retry.",
              },
      );
    },
  );
  const Heading = "h1";
  const PanelHeading = "h2";
  const [previewTheme, setPreviewTheme] = useState("dark");
  const [previewInstance, setPreviewInstance] = useState(0);
  const [format, setFormat] = useState<ExportFormat>("javascript");
  const scene = document.scene;
  const settings = document.options;
  const capabilities = useMemo(
    () => resolveCapabilities(recipeOf(document)),
    [document],
  );
  const measurement = useLocalMeasurements(scene, settings);
  const prepared = useMemo(
    () => prepareExport({ scene, options: settings }, measurement.snapshot),
    [scene, settings, measurement.snapshot],
  );
  const { options, compilation, diagnostics } = prepared;
  const preview = prepared.preview(playing);
  const renderer = settings.renderer ?? "css";
  const systemMotion = options.motion === "system";
  useEffect(() => {
    if (!playing) return;
    let query: MediaQueryList;
    try {
      query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    } catch {
      return;
    }
    const changed = () => {
      if (!query.matches) setPlaying(false);
    };
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, [playing]);

  const { log } = useConsoleScene(scene, options);
  const source = useMemo(() => prepared.source(format), [prepared, format]);
  const lineIndex = Math.max(
    0,
    Math.min(selection.line, scene.lines.length - 1),
  );
  const line = scene.lines[lineIndex];
  const runIndex = Math.max(
    0,
    Math.min(selection.run, (line?.runs.length ?? 0) - 1),
  );
  const run = line?.runs[runIndex];
  const presentation = cardDescriptor(scene);
  const styleEditable = (key: keyof NonNullable<typeof run>["style"]) =>
    capabilities.editableStyleKeys[lineIndex]?.[runIndex]?.includes(key) ??
    false;
  const cinematic = run?.effects.find(
    (effect) => effect.kind === "cinematicMetal",
  );
  const angular =
    cinematic?.profile === "lightning-metal-v1" ||
    cinematic?.profile === "molten-gold-v1";
  const recommendedRenderer = rendererForLoadedScene(scene, renderer);
  const runCount = scene.lines.reduce(
    (count, line) => count + line.runs.length,
    0,
  );
  const hasMotion = capabilities.hasMotion;
  const motionAvailable = capabilities.controls.motion.status !== "unavailable";
  const runMotionAvailable =
    capabilities.motionRuns[lineIndex]?.[runIndex] ?? false;
  const contentEditable =
    capabilities.controls.content.status !== "unavailable";
  const svgCapabilities = resolveCapabilities({
    ...recipeOf(document),
    options: { ...settings, target: "chromium", renderer: "svg" },
  });

  function updateSettings(candidate: RenderRecipeV1["options"]) {
    const result = parseRenderRecipe({
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene,
      options: candidate,
    });
    if (!result.ok) {
      setNotice({ kind: "error", message: result.diagnostics[0]!.message });
      return;
    }
    if (sameDocument(recipeOf(document), result.value)) return;
    dispatch({ type: "settings", options: result.value.options });
    setNotice({
      kind: "info",
      message:
        "Render settings will be saved with this recipe. Your earlier scene draft is retained.",
    });
  }
  const applyRenderer = (renderer: Renderer) =>
    updateSettings({
      ...settings,
      renderer,
      ...(renderer === "text" ? {} : { target: "chromium" }),
    });
  function setRenderer(renderer: Renderer) {
    if (renderer !== "svg" && (settings.layout || settings.sizing)) {
      session.beginReplacement();
      setRendererChange(renderer);
    } else applyRenderer(renderer);
  }
  function confirmRenderer() {
    if (!rendererChange) return;
    const compatible = { ...settings };
    delete compatible.layout;
    delete compatible.sizing;
    updateSettings({
      ...compatible,
      renderer: rendererChange,
      ...(rendererChange === "text" ? {} : { target: "chromium" }),
    });
    setRendererChange(null);
  }
  const setSystemMotion = (enabled: boolean) =>
    updateSettings({ ...settings, motion: enabled ? "system" : "reduce" });

  function commit(candidate: unknown, nextSelection?: typeof selection) {
    const result = parseScene(candidate);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.diagnostics[0]!.message });
      return;
    }
    dispatch({ type: "replace", scene: result.value });
    if (nextSelection) setSelection(nextSelection);
    setNotice(null);
  }
  function patchRun(patch: Record<string, unknown>) {
    commit({
      ...scene,
      lines: scene.lines.map((line, li) =>
        li === lineIndex
          ? {
              ...line,
              runs: line.runs.map((run, ri) =>
                ri === runIndex ? { ...run, ...patch } : run,
              ),
            }
          : line,
      ),
    });
  }
  function playPreview() {
    if (resolveMotion() !== "allow") {
      setPlaying(false);
      setNotice({
        kind: "info",
        message:
          "This browser requests reduced motion. The preview stays static.",
      });
      return;
    }
    const requested = prepared.preview(true);
    if (!requested.ok) {
      setPlaying(false);
      setNotice({
        kind: "error",
        message:
          requested.diagnostics[0]?.message ?? "This preview cannot play.",
      });
      return;
    }
    setPlaying(true);
    setPreviewInstance((value) => value + 1);
  }
  function addLine() {
    if (scene.lines.length >= LIMITS.lines || runCount >= LIMITS.runs) return;
    commit(
      {
        ...scene,
        lines: [...scene.lines, { runs: [{ text: "Another line" }] }],
      },
      { line: scene.lines.length, run: 0 },
    );
  }
  function addRun() {
    if (!line) {
      addLine();
      return;
    }
    commit(
      {
        ...scene,
        lines: scene.lines.map((item, index) =>
          index === lineIndex
            ? { ...item, runs: [...item.runs, { text: " New text" }] }
            : item,
        ),
      },
      { line: lineIndex, run: line.runs.length },
    );
  }

  return (
    <div className="workbench-layout">
      <CatalogueSidebar
        category={navigation.category}
        onCategory={navigation.setCategory}
        selected={navigation.selected}
        onSelect={navigation.request}
        disabled={!ready || !!pendingShared || !!navigation.pending}
      />
      <div className="workbench-main" id="editor-workspace">
        {navigation.error && (
          <div className="discovery-error" role="alert">
            <p>{navigation.error}</p>
            <button
              type="button"
              onClick={() => {
                navigation.setCategory(undefined);
                navigation.clearError();
              }}
            >
              Browse All examples
            </button>
          </div>
        )}
        <section
          className="studio-shell workbench-workspace"
          data-panel={panel}
          id="playground"
          aria-labelledby="playground-title"
        >
          <div className="studio-heading">
            <div>
              <p className="eyebrow">Make it yours</p>
              <Heading id="playground-title">
                Choose. Change. Copy
                <span className="small-dot" aria-hidden="true">
                  .
                </span>
              </Heading>
            </div>
            <div className="button-row">
              <button
                type="button"
                disabled={!ready || !!pendingShared || !document.past.length}
                onClick={() => dispatch({ type: "undo" })}
              >
                Undo
              </button>
              <button
                type="button"
                disabled={!ready || !!pendingShared || !document.future.length}
                onClick={() => dispatch({ type: "redo" })}
              >
                Redo
              </button>
              <button
                type="button"
                disabled={!ready || !!pendingShared}
                onClick={session.requestReset}
              >
                Reset
              </button>
            </div>
          </div>
          <>
            <p className="workbench-description">
              {listCatalogue().examples.find(
                (item) => item.id === navigation.selected,
              )?.purpose ??
                "Your current document. Browse without losing your work."}
            </p>
            <div
              className="capability-summary"
              aria-label="Current document capabilities"
            >
              <span>
                {capabilities.mode === "card"
                  ? "Named fields"
                  : capabilities.mode === "cinematic"
                    ? "Cinematic lettering"
                    : "Lines & text runs"}
              </span>
              <span>
                {capabilities.controls.motion.status === "unavailable"
                  ? "Static profile"
                  : "Finite motion available · experimental"}
              </span>
              <span>
                {settings.sizing?.mode === "container-experimental"
                  ? "Automatic width · experimental in DevTools"
                  : "Saved sizing settings"}
              </span>
            </div>
            <TabList
              id="workbench"
              label="Workbench panels"
              className="workbench-panel-tabs"
              items={[
                { id: "edit", name: "Edit" },
                { id: "output", name: "Output" },
                { id: "code", name: "Code" },
              ]}
              value={panel}
              onChange={setPanel}
            />
          </>
          {!ready && (
            <p role="status" className="loading-note">
              Checking this browser for your saved draft…
            </p>
          )}
          <fieldset
            className="studio-fields"
            disabled={
              !ready ||
              !!pendingShared ||
              !!navigation.pending ||
              !!rendererChange
            }
          >
            <legend className="sr-only">Scene editor</legend>
            <div className="editor-grid">
              <div
                className="editor-inputs"
                id="workbench-panel-edit"
                role="tabpanel"
                aria-labelledby="workbench-tab-edit"
              >
                <aside className="content-panel panel">
                  <PanelHeading>
                    01 <span>Content</span>
                  </PanelHeading>
                  <label>
                    Start from a preset
                    <select
                      value=""
                      onChange={(event) =>
                        navigation.request(event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Choose an example
                      </option>
                      {listCatalogue().categories.map((category) => (
                        <optgroup key={category.id} label={category.name}>
                          {listCatalogue()
                            .examples.filter(
                              (entry) => entry.category === category.id,
                            )
                            .map((entry) => (
                              <option key={entry.id} value={entry.id}>
                                {entry.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label>
                    Scene label
                    <input
                      disabled={!contentEditable}
                      value={scene.label}
                      onChange={(event) =>
                        commit({ ...scene, label: event.target.value })
                      }
                    />
                  </label>
                  {!contentEditable && (
                    <p className="fine-print">
                      {capabilities.controls.content.reason}
                    </p>
                  )}
                  {presentation ? (
                    <fieldset
                      className="capability-fields"
                      disabled={
                        !contentEditable ||
                        capabilities.controls.namedFields.status ===
                          "unavailable"
                      }
                    >
                      <legend className="sr-only">Named fields</legend>
                      {capabilities.controls.namedFields.status ===
                        "unavailable" && (
                        <p className="fine-print">
                          {capabilities.controls.namedFields.reason}
                        </p>
                      )}
                      <CardFields
                        scene={scene}
                        descriptor={presentation}
                        onChange={commit}
                        onSelect={setSelection}
                      />
                    </fieldset>
                  ) : (
                    <>
                      <div
                        className="line-list"
                        aria-label="Lines and text runs"
                      >
                        {scene.lines.map((item, li) => (
                          <div key={li}>
                            <button
                              type="button"
                              className="line-label"
                              aria-pressed={li === lineIndex}
                              onClick={() => setSelection({ line: li, run: 0 })}
                            >
                              Line {li + 1}
                            </button>
                            {item.runs.map((item, ri) => (
                              <button
                                type="button"
                                className="run-choice"
                                aria-pressed={
                                  li === lineIndex && ri === runIndex
                                }
                                key={ri}
                                onClick={() =>
                                  setSelection({ line: li, run: ri })
                                }
                              >
                                <span className="run-mark" aria-hidden="true">
                                  T
                                </span>
                                <span>{item.text || "Empty text"}</span>
                                <span className="sr-only">, run {ri + 1}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="button-row compact">
                        <button
                          type="button"
                          disabled={
                            !contentEditable ||
                            scene.lines.length >= LIMITS.lines ||
                            runCount >= LIMITS.runs
                          }
                          onClick={addLine}
                        >
                          + Line
                        </button>
                        <button
                          type="button"
                          disabled={!contentEditable || runCount >= LIMITS.runs}
                          onClick={addRun}
                        >
                          + Text run
                        </button>
                      </div>
                      {run && (
                        <label>
                          Message text
                          <textarea
                            rows={4}
                            disabled={!contentEditable}
                            value={run.text}
                            onChange={(event) =>
                              patchRun({ text: event.target.value })
                            }
                          />
                        </label>
                      )}
                      {line && (
                        <div className="button-row compact">
                          {run && (
                            <button
                              type="button"
                              disabled={!contentEditable}
                              onClick={() =>
                                commit({
                                  ...scene,
                                  lines: scene.lines.map((item, index) =>
                                    index === lineIndex
                                      ? {
                                          ...item,
                                          runs: item.runs.filter(
                                            (_, index) => index !== runIndex,
                                          ),
                                        }
                                      : item,
                                  ),
                                })
                              }
                            >
                              Remove run
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!contentEditable}
                            onClick={() =>
                              commit({
                                ...scene,
                                lines: scene.lines.filter(
                                  (_, index) => index !== lineIndex,
                                ),
                              })
                            }
                          >
                            Remove line
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <p className="fine-print">
                    {scene.lines.length}/{LIMITS.lines} lines · {runCount}/
                    {LIMITS.runs} runs. Editing never prints to your console.
                  </p>
                </aside>
                <aside className="style-panel panel">
                  <PanelHeading>
                    03 <span>Customize</span>
                  </PanelHeading>
                  {presentation && (
                    <fieldset
                      className="effect-control"
                      disabled={
                        capabilities.presentationParameters.status ===
                        "unavailable"
                      }
                    >
                      <legend>{presentation.name}</legend>
                      {capabilities.presentationParameters.status ===
                        "unavailable" && (
                        <p className="fine-print">
                          {capabilities.presentationParameters.reason}
                        </p>
                      )}
                      {Object.entries(presentation.parameters).map(
                        ([name, parameter]) => (
                          <ParameterField
                            key={name}
                            name={name}
                            parameter={parameter}
                            value={
                              (
                                scene.presentation as unknown as Record<
                                  string,
                                  unknown
                                >
                              )[name]
                            }
                            onChange={(value) =>
                              commit(editCardParameter(scene, name, value))
                            }
                          />
                        ),
                      )}
                      <p className="fine-print">
                        Accent affects{" "}
                        {presentation.accentGeometry.join(", ").toLowerCase()}.
                        Status uses its own palette.
                      </p>
                    </fieldset>
                  )}
                  {capabilities.controls.typography.status ===
                    "unavailable" && (
                    <p className="fine-print">
                      {capabilities.controls.typography.reason}
                    </p>
                  )}
                  {run ? (
                    <>
                      <div className="field-pair">
                        <label>
                          Font
                          <select
                            value={run.style.fontFamily}
                            disabled={!styleEditable("fontFamily")}
                            onChange={(event) =>
                              patchRun({
                                style: {
                                  ...run.style,
                                  fontFamily: event.target.value,
                                },
                              })
                            }
                          >
                            <option value="mono">Monospace</option>
                            <option value="sans">Sans serif</option>
                            <option value="serif">Serif</option>
                          </select>
                        </label>
                        <label className="color-field">
                          Text color
                          <input
                            type="color"
                            value={run.style.color.slice(0, 7)}
                            disabled={!styleEditable("color")}
                            onChange={(event) =>
                              patchRun({
                                style: {
                                  ...run.style,
                                  color: event.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      </div>
                      <RangeField
                        label="Font size"
                        disabled={!styleEditable("fontSize")}
                        unit=" px"
                        value={run.style.fontSize}
                        min={8}
                        max={96}
                        onChange={(value) =>
                          patchRun({ style: { ...run.style, fontSize: value } })
                        }
                      />
                      <RangeField
                        label="Weight"
                        disabled={!styleEditable("fontWeight")}
                        value={run.style.fontWeight}
                        min={100}
                        max={900}
                        step={100}
                        onChange={(value) =>
                          patchRun({
                            style: { ...run.style, fontWeight: value },
                          })
                        }
                      />
                      <RangeField
                        label="Letter spacing"
                        disabled={!styleEditable("letterSpacing")}
                        unit=" px"
                        value={run.style.letterSpacing}
                        min={-2}
                        max={10}
                        step={0.5}
                        onChange={(value) =>
                          patchRun({
                            style: { ...run.style, letterSpacing: value },
                          })
                        }
                      />
                      {cinematic && (
                        <p className="fine-print">
                          {angular
                            ? "Original angular paths define the letter shapes; font family and weight do not apply. ASCII lowercase appears as capitals; the caption keeps your text."
                            : "This profile uses local serif lettering; the font family is fixed and rendering can vary by platform."}{" "}
                          The reflection palette is fixed. Use Accent color for
                          the edges. Cinematic Metal is static-only.
                        </p>
                      )}
                      <label>
                        Alignment
                        <select
                          value={line!.align}
                          disabled={
                            !!presentation ||
                            capabilities.controls.typography.status ===
                              "unavailable"
                          }
                          onChange={(event) =>
                            commit({
                              ...scene,
                              lines: scene.lines.map((item, index) =>
                                index === lineIndex
                                  ? { ...item, align: event.target.value }
                                  : item,
                              ),
                            })
                          }
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                      <div className="effects-controls">
                        {run.effects.map((effect, effectIndex) => {
                          const descriptor = descriptors.find(
                            (item) => item.kind === effect.kind,
                          )!;
                          const editing =
                            capabilities.effectEditing[effect.kind];
                          return (
                            <fieldset
                              className="effect-control"
                              key={effect.kind}
                              disabled={editing.status === "unavailable"}
                            >
                              <legend>{descriptor.displayName}</legend>
                              {editing.status === "unavailable" && (
                                <p className="fine-print">{editing.reason}</p>
                              )}
                              {Object.entries(descriptor.parameters).map(
                                ([name, parameter]) => (
                                  <ParameterField
                                    key={name}
                                    name={
                                      effect.kind === "cinematicMetal" &&
                                      name === "color"
                                        ? "Accent color"
                                        : name
                                    }
                                    parameter={parameter}
                                    value={
                                      (
                                        effect as unknown as Record<
                                          string,
                                          unknown
                                        >
                                      )[name]
                                    }
                                    onChange={(value) =>
                                      patchRun({
                                        effects: run.effects.map(
                                          (item, index) =>
                                            index === effectIndex
                                              ? { ...item, [name]: value }
                                              : item,
                                        ),
                                      })
                                    }
                                  />
                                ),
                              )}
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  patchRun({
                                    effects: run.effects.filter(
                                      (_, index) => index !== effectIndex,
                                    ),
                                  })
                                }
                              >
                                Remove {descriptor.displayName}
                              </button>
                            </fieldset>
                          );
                        })}
                      </div>
                      {capabilities.controls.effects.status ===
                        "unavailable" && (
                        <p className="fine-print">
                          {capabilities.controls.effects.reason}
                        </p>
                      )}
                      <label>
                        Add an effect
                        <select
                          value=""
                          disabled={
                            capabilities.controls.effects.status ===
                              "unavailable" ||
                            run.effects.length >= LIMITS.effectsPerRun
                          }
                          onChange={(event) =>
                            patchRun({
                              effects: [
                                ...run.effects,
                                { kind: event.target.value as EffectKind },
                              ],
                            })
                          }
                        >
                          <option value="">Choose an effect</option>
                          {descriptors
                            .filter(
                              (descriptor) =>
                                !run.effects.some(
                                  (effect) =>
                                    descriptors.find(
                                      (item) => item.kind === effect.kind,
                                    )?.motion === descriptor.motion,
                                ),
                            )
                            .map((descriptor) => (
                              <option
                                value={descriptor.kind}
                                key={descriptor.kind}
                                disabled={
                                  !descriptor.renderers.includes(renderer) ||
                                  (!runMotionAvailable &&
                                    descriptor.motion === "decorative")
                                }
                              >
                                {descriptor.displayName}
                                {descriptor.motion === "decorative"
                                  ? " · SVG motion"
                                  : ""}
                              </option>
                            ))}
                        </select>
                      </label>
                      <p className="fine-print">
                        {presentation
                          ? "Detach this card to use flow layout, effects or motion."
                          : cinematic
                            ? "This profile supports one static cinematic effect. Remove it to use another style or motion."
                            : "One style effect and one decorative motion per text run. Remove an effect to choose another."}
                      </p>
                    </>
                  ) : (
                    <p>Add a text run to customize its style.</p>
                  )}
                  <details className="surface-controls">
                    <summary>Surface & spacing</summary>
                    <fieldset
                      className="capability-fields"
                      disabled={!contentEditable}
                    >
                      <legend className="sr-only">Surface controls</legend>
                      <RangeField
                        label="Width"
                        unit=" px"
                        value={scene.surface.width}
                        min={120}
                        max={LIMITS.svgWidth}
                        step={10}
                        onChange={(value) =>
                          commit({
                            ...scene,
                            surface: { ...scene.surface, width: value },
                          })
                        }
                      />
                      <RangeField
                        label="Height"
                        unit=" px"
                        value={scene.surface.height}
                        min={60}
                        max={LIMITS.svgHeight}
                        step={10}
                        onChange={(value) =>
                          commit({
                            ...scene,
                            surface: { ...scene.surface, height: value },
                          })
                        }
                      />
                      <RangeField
                        label="Padding"
                        unit=" px"
                        value={scene.surface.padding}
                        min={0}
                        max={Math.min(
                          64,
                          Math.floor(
                            (Math.min(
                              scene.surface.width,
                              scene.surface.height,
                            ) -
                              1) /
                              2,
                          ),
                        )}
                        onChange={(value) =>
                          commit({
                            ...scene,
                            surface: { ...scene.surface, padding: value },
                          })
                        }
                      />
                      <RangeField
                        label="Corners"
                        unit=" px"
                        value={scene.surface.borderRadius}
                        min={0}
                        max={64}
                        onChange={(value) =>
                          commit({
                            ...scene,
                            surface: { ...scene.surface, borderRadius: value },
                          })
                        }
                      />
                      <label className="color-field">
                        Background
                        <input
                          type="color"
                          value={scene.surface.background.slice(0, 7)}
                          onChange={(event) =>
                            commit({
                              ...scene,
                              surface: {
                                ...scene.surface,
                                background: event.target.value,
                              },
                            })
                          }
                        />
                      </label>
                      <p className="fine-print">
                        Surface dimensions apply to SVG output. CSS layout is
                        approximate.
                      </p>
                    </fieldset>
                  </details>
                </aside>
              </div>

              <div
                className="preview-panel panel"
                id="workbench-panel-output"
                role="tabpanel"
                aria-labelledby="workbench-tab-output"
              >
                <div className="preview-heading">
                  <PanelHeading>
                    02 <span>Preview</span>
                  </PanelHeading>
                  <label className="inline-label">
                    Canvas
                    <select
                      value={previewTheme}
                      onChange={(event) => setPreviewTheme(event.target.value)}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </label>
                </div>
                <div className={`preview-stage ${previewTheme}`}>
                  <div className="console-chrome">
                    <span className="console-dots" aria-hidden="true">
                      ● ● ●
                    </span>
                    <span>Console</span>
                    <span className="preview-renderer">
                      {renderer.toUpperCase()}
                    </span>
                  </div>
                  <div className="preview-content">
                    {preview.ok ? (
                      <ConsolePreview
                        key={previewInstance}
                        scene={scene}
                        options={preview.options}
                      />
                    ) : (
                      <p className="preview-error">
                        {preview.diagnostics[0]?.message ??
                          "Choose a supported renderer."}
                      </p>
                    )}
                  </div>
                  <span className="entry-prompt" aria-hidden="true">
                    ›
                  </span>
                </div>
                <div className="preview-actions">
                  <div className="button-row compact">
                    <button
                      type="button"
                      disabled={!hasMotion || !motionAvailable || !preview.ok}
                      onClick={playPreview}
                    >
                      {playing ? "Replay" : "Play"}
                    </button>
                    <button
                      type="button"
                      disabled={!playing}
                      onClick={() => setPlaying(false)}
                    >
                      Show static
                    </button>
                  </div>
                  <span className="fine-print">
                    {capabilities.controls.motion.status === "available"
                      ? "Preview controls do not change printed entries."
                      : capabilities.controls.motion.reason}
                  </span>
                </div>
                <label>
                  Output renderer
                  <select
                    value={renderer}
                    onChange={(event) =>
                      setRenderer(event.target.value as Renderer)
                    }
                  >
                    <option value="css">CSS text · Chromium</option>
                    <option value="svg">SVG image · Chromium</option>
                    <option value="text">Plain text · any console</option>
                  </select>
                </label>
                {recommendedRenderer !== renderer && (
                  <button
                    type="button"
                    onClick={() => setRenderer(recommendedRenderer)}
                  >
                    Use SVG renderer
                  </button>
                )}
                <div
                  className="diagnostics"
                  role="group"
                  aria-label="Renderer diagnostics"
                >
                  {diagnostics.map((diagnostic) => (
                    <p
                      key={JSON.stringify(diagnostic)}
                      className={
                        diagnostic.severity === "error" ? "error-text" : ""
                      }
                    >
                      {diagnostic.message}
                    </p>
                  ))}
                </div>
                <p className="fine-print">
                  Rich output has recorded Windows 11 Chrome and Edge DevTools
                  checks.{" "}
                  <a href="/docs/#compatibility">See the tested scope</a>. Page
                  previews can differ. Motion is decorative and lasts at most
                  five seconds.
                </p>
              </div>
            </div>

            <details className="fit-section">
              <summary>Fit and sizing · Advanced</summary>
              <button
                type="button"
                disabled={
                  svgCapabilities.controls.fitting.status === "unavailable" ||
                  svgCapabilities.controls.outputSizing.status === "unavailable"
                }
                onClick={() => {
                  const converted = parseRenderRecipe(
                    withAutomaticSizing(recipeOf(document)),
                  );
                  if (converted.ok)
                    dispatch({ type: "load", document: converted.value });
                  else
                    setNotice({
                      kind: "error",
                      message: converted.diagnostics[0]!.message,
                    });
                }}
              >
                Enable automatic sizing
              </button>
              <p className="fine-print">
                An explicit conversion keeps your scene and can be undone.
                Automatic SVG width is experimental in DevTools; its full
                native-text caption is retained.
              </p>
              <FitInspector
                scene={scene}
                options={settings}
                fitting={svgCapabilities.controls.fitting}
                sizing={svgCapabilities.controls.outputSizing}
                onApply={updateSettings}
                measurement={measurement}
                onMeasure={measurement.measure}
                onClearMeasurements={measurement.clear}
              />
            </details>

            <section
              className="export-panel"
              id="workbench-panel-code"
              role="tabpanel"
              aria-labelledby="workbench-tab-code"
            >
              <div className="export-heading">
                <div>
                  <PanelHeading id="export-title">
                    Your message, ready to go.
                  </PanelHeading>
                  <p>{formats[format].description}</p>
                </div>
                <label className="inline-label">
                  Format
                  <select
                    value={format}
                    onChange={(event) =>
                      setFormat(event.target.value as ExportFormat)
                    }
                  >
                    <option value="javascript">Standalone JavaScript</option>
                    <option value="typescript">TypeScript package</option>
                    <option value="react">React hook</option>
                    <option value="next">Next.js client banner</option>
                    <option value="json">Scene JSON (content only)</option>
                    <option value="recipe">
                      Recipe JSON (scene and settings)
                    </option>
                  </select>
                </label>
              </div>
              {hasMotion && (
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={systemMotion}
                    disabled={!motionAvailable}
                    onChange={(event) => setSystemMotion(event.target.checked)}
                  />
                  Enable finite motion when the system allows it. Includes a
                  static fallback.
                </label>
              )}
              <textarea
                className="code-output"
                aria-label="Generated code"
                readOnly
                value={source}
                rows={5}
                spellCheck={false}
              />
              <div className="export-actions">
                <p className="byte-count">
                  <strong>
                    {utf8ByteLength(source).toLocaleString("en-US")}
                  </strong>{" "}
                  UTF-8 bytes
                  <span>
                    {format === "javascript" &&
                    systemMotion &&
                    renderer === "svg" &&
                    hasMotion
                      ? " · Both motion branches included"
                      : ` · ${renderer.toUpperCase()} output`}
                  </span>
                </p>
                <div className="button-row">
                  <button
                    type="button"
                    disabled={!compilation.ok}
                    onClick={() => {
                      try {
                        log();
                        setNotice({
                          kind: "success",
                          message:
                            "One entry sent to your console. Open DevTools to inspect it.",
                        });
                      } catch {
                        setNotice({
                          kind: "error",
                          message:
                            "The scene could not be printed. Review the renderer diagnostics.",
                        });
                      }
                    }}
                  >
                    Test in console
                  </button>
                  <button
                    type="button"
                    className="primary"
                    disabled={
                      copying ||
                      !source ||
                      (format !== "json" &&
                        format !== "recipe" &&
                        !compilation.ok)
                    }
                    onClick={() => {
                      if (
                        source &&
                        (compilation.ok ||
                          format === "json" ||
                          format === "recipe")
                      )
                        void copy(
                          source,
                          formats[format].copy.replace(/^Copy /, ""),
                        );
                    }}
                  >
                    <CopyMark copied={copiedSource === source} />
                    {formats[format].copy}
                  </button>
                </div>
              </div>
            </section>

            <div className="document-actions">
              <div className="button-row">
                <label className="button import-button">
                  Import JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      void session.importFile(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      download(scene);
                      setNotice({
                        kind: "success",
                        message: "JSON export prepared.",
                      });
                    } catch {
                      setNotice({
                        kind: "error",
                        message:
                          "Download failed. Choose Scene JSON (content only) above and copy it.",
                      });
                    }
                  }}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      download(recipeOf(document));
                      setNotice({
                        kind: "success",
                        message:
                          "Recipe JSON export prepared with scene and render settings.",
                      });
                    } catch {
                      setNotice({
                        kind: "error",
                        message:
                          "Download failed. Choose Recipe JSON above and copy it.",
                      });
                    }
                  }}
                >
                  Export recipe JSON
                </button>
                <button
                  type="button"
                  disabled={copying}
                  onClick={() => {
                    const result = encodeShare(persisted);
                    if (!result.ok)
                      setNotice({
                        kind: "error",
                        message: result.diagnostics[0]!.message,
                      });
                    else
                      void copy(
                        `${window.location.origin}${window.location.pathname}${result.value}`,
                        "Share link",
                      );
                  }}
                >
                  Copy share link
                </button>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={session.clearDraft}
              >
                Clear local draft
              </button>
            </div>
          </fieldset>
          {failedCopy && (
            <label className="copy-recovery">
              {failedCopy.label} from the blocked copy attempt
              <textarea
                readOnly
                rows={5}
                value={failedCopy.text}
                onFocus={(event) => event.target.select()}
              />
            </label>
          )}
          <div className="editor-status" aria-live="polite" aria-atomic="true">
            {notice && (
              <p className={notice.kind === "error" ? "error-text" : ""}>
                {notice.message}
              </p>
            )}
            {draftStatus && (
              <p className={draftStatus.kind === "error" ? "error-text" : ""}>
                {draftStatus.message}
              </p>
            )}
          </div>
          {storageIssue && (
            <button
              type="button"
              disabled={!!pendingShared}
              onClick={session.retryStorage}
            >
              Retry local storage
            </button>
          )}
          <p className="privacy-note">
            Drafts stay in this browser until you clear them or the browser
            removes them. No account, server backup, or sync. Shared links and
            downloaded files are independent copies.
          </p>
        </section>
        {pendingShared && (
          <ConfirmDialog
            title="Load the shared scene?"
            description="Loading this shared scene replaces your current document as one undoable change. Keep your current scene to continue where you left off."
            confirmLabel="Load shared scene"
            onCancel={() => {
              navigation.settleSharedUrl(false);
              session.settleShared(false);
            }}
            onConfirm={() => {
              navigation.settleSharedUrl(true);
              session.settleShared(true);
            }}
          />
        )}
        {navigation.pending && !pendingShared && (
          <ConfirmDialog
            title="Load this example?"
            description={`Replace “${scene.label}” with “${navigation.pending.recipe.scene.label}”? Loading creates one undoable change. Cancel keeps your current work.`}
            confirmLabel="Load example"
            onCancel={() => navigation.settle(false)}
            onConfirm={() => navigation.settle(true)}
          />
        )}
        {rendererChange && (
          <ConfirmDialog
            title="Change output renderer?"
            description="This renderer requires removing SVG content fitting and output sizing. Your scene stays intact; Undo restores the complete previous recipe."
            confirmLabel="Change renderer"
            onCancel={() => setRendererChange(null)}
            onConfirm={confirmRenderer}
          />
        )}
        {confirmReset && (
          <ConfirmDialog
            title="Start a fresh message?"
            description="This discards the current scene and its undo history. The existing local draft stays stored; use Clear local draft to remove it. Autosave resumes only after your next edit."
            confirmLabel="Reset scene"
            onCancel={() => session.settleReset(false)}
            onConfirm={() => session.settleReset(true)}
          />
        )}
      </div>
    </div>
  );
}
