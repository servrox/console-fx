"use client";
import { useRouter } from "next/navigation";
import {
  memo,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
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
  SceneV1,
  RenderRecipeV1,
} from "@servrox/console-fx";
import {
  compileConsole,
  ConsoleCompileError,
  resolveMotion,
} from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import {
  neon,
  PRESETS,
  createPresetExample,
} from "@servrox/console-fx/presets";
import type { PresetId } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";
import {
  decodeDocument,
  decodeShare,
  encodeShare,
  isRecipe,
  type SavedDocument,
} from "../persistence/documents";
import { DraftStore } from "../persistence/draft";
import type { DraftStatus } from "../persistence/draft";
import {
  documentReducer,
  initialDocument,
  sameDocument,
  savedDocument,
  recipeOf,
} from "./document";
import { ConfirmDialog } from "./confirm-dialog";
import { rendererForLoadedScene } from "./renderer";
import { CardFields } from "./card-fields";
import { FitInspector } from "./fit-inspector";
import { useLocalMeasurements } from "./use-local-measurements";
import { cardDescriptor, editCardParameter } from "./presentation";

const descriptors = getEffectDescriptors();
const initialScene = neon({ text: "Hello, developer." });
const presetScenes = Object.fromEntries(
  PRESETS.map((item) => [item.id, createPresetExample(item.id)]),
) as Record<PresetId, SceneV1>;
const presetGroups = [...new Set(PRESETS.map((item) => item.group))];
const PresetSample = memo(function PresetSample({
  id,
}: {
  readonly id: PresetId;
}) {
  const item = PRESETS.find((item) => item.id === id)!;
  return (
    <ConsolePreview
      scene={presetScenes[id]}
      options={{ target: "chromium", renderer: item.renderer }}
    />
  );
});
type Notice = {
  readonly kind: "success" | "error" | "info";
  readonly message: string;
};
type ExportFormat =
  "javascript" | "typescript" | "react" | "next" | "json" | "recipe";
const formats = {
  javascript: {
    copy: "Copy console.log",
    description: "Self-contained JavaScript. No imports. One console.log.",
  },
  typescript: {
    copy: "Copy TypeScript example",
    description: "A complete example using the core package.",
  },
  react: {
    copy: "Copy React example",
    description: "An explicit button action using the core and React adapter.",
  },
  next: {
    copy: "Copy Next.js example",
    description: "A client component using the core and React adapter.",
  },
  json: {
    copy: "Copy scene JSON",
    description:
      "Content only. Render settings are excluded; use Recipe JSON to retain them.",
  },
  recipe: {
    copy: "Copy recipe JSON",
    description:
      "Scene plus explicit render settings. Local font measurements are excluded.",
  },
} as const;
const sourceString = (value: unknown) =>
  JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");

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

export function Studio({
  focused = false,
  integrated = false,
  transfer = null,
  onTransferDone,
  onSharedDecisionChange,
}: {
  readonly focused?: boolean;
  readonly integrated?: boolean;
  readonly transfer?: SavedDocument | null;
  readonly onTransferDone?: (restoreFocus?: boolean) => void;
  readonly onSharedDecisionChange?: (pending: boolean) => void;
}) {
  const [document, dispatch] = useReducer(
    documentReducer,
    initialScene,
    initialDocument,
  );
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState({ line: 0, run: 0 });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus | null>(null);
  const [pendingShared, setPendingShared] = useState<SavedDocument | null>(
    null,
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const Heading = focused ? "h1" : "h2";
  const PanelHeading = focused ? "h2" : "h3";
  const [previewTheme, setPreviewTheme] = useState("dark");
  const [playing, setPlaying] = useState(false);
  const [previewInstance, setPreviewInstance] = useState(0);
  const [format, setFormat] = useState<ExportFormat>("javascript");
  const [store] = useState(
    () => new DraftStore(() => window.localStorage, setDraftStatus),
  );
  const initialized = useRef(false);
  const importSequence = useRef(0);
  const releaseShared = useRef<(() => void) | null>(null);
  const scene = document.scene;
  const settings = document.options;
  const measurement = useLocalMeasurements(scene, settings);
  const options = useMemo(
    () => ({
      ...settings,
      ...(measurement.snapshot
        ? {
            measurements: measurement.snapshot,
            measurementEnvironment: measurement.snapshot.environment,
          }
        : {}),
    }),
    [settings, measurement.snapshot],
  );
  const renderer = settings.renderer ?? "css";
  const systemMotion = options.motion === "system";
  const persisted = useMemo(() => savedDocument(document), [document]);
  const pendingExample =
    ready && !pendingShared && transfer && !sameDocument(persisted, transfer)
      ? transfer
      : null;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const draft = store.read();
    let baseline = draft.kind === "valid" ? draft.document : initialScene;
    let shared: SavedDocument | null = null;
    let startupNotice: Notice | null =
      draft.kind === "valid"
        ? { kind: "success", message: "Your local draft was resumed." }
        : draft.kind === "error"
          ? { kind: "error", message: draft.message }
          : null;
    if (window.location.hash.startsWith("#scene=")) {
      const result = decodeShare(window.location.hash);
      if (!result.ok)
        startupNotice = {
          kind: "error",
          message: result.diagnostics[0]!.message,
        };
      else if (
        draft.kind === "valid" &&
        !sameDocument(baseline, result.value)
      ) {
        shared = result.value;
        releaseShared.current = store.hold();
      } else if (draft.kind !== "valid") {
        baseline = result.value;
        startupNotice = {
          kind: "success",
          message: "Shared scene loaded. It has not been printed.",
        };
      }
    }
    dispatch({ type: "initialize", document: baseline });
    // Storage and fragments are intentionally read after hydration. The initial
    // server/client render is identical, and no default draft is ever persisted.
    setPendingShared(shared);
    setNotice(startupNotice);
    setReady(true);
  }, [store]);
  useEffect(() => {
    if (!ready) return;
    const receiveShare = () => {
      if (!window.location.hash.startsWith("#scene=")) return;
      const result = decodeShare(window.location.hash);
      if (!result.ok) {
        setNotice({ kind: "error", message: result.diagnostics[0]!.message });
      } else if (!sameDocument(persisted, result.value)) {
        if (!releaseShared.current) {
          store.flush();
          releaseShared.current = store.hold();
        }
        setPendingShared(result.value);
        setPlaying(false);
      }
    };
    window.addEventListener("hashchange", receiveShare);
    return () => window.removeEventListener("hashchange", receiveShare);
  }, [ready, persisted, store]);
  useEffect(() => {
    if (ready) store.queue(persisted, document.revision);
  }, [persisted, document.revision, ready, store]);
  useEffect(() => {
    const flush = () => store.flush();
    const hidden = () => {
      if (window.document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.document.removeEventListener("visibilitychange", hidden);
      flush();
    };
  }, [store]);
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

  useEffect(() => {
    onSharedDecisionChange?.(!!pendingShared);
    return () => onSharedDecisionChange?.(false);
  }, [pendingShared, onSharedDecisionChange]);
  useEffect(() => {
    if (!transfer || !ready) return;
    if (pendingShared) {
      onTransferDone?.();
      return;
    }
    if (sameDocument(persisted, transfer)) onTransferDone?.();
  }, [transfer, ready, pendingShared, persisted, onTransferDone]);

  const { log } = useConsoleScene(scene, options);
  const compilation = useMemo(() => {
    try {
      return {
        ok: true as const,
        output: compileConsole(scene, {
          ...options,
          motion: "reduce",
        }),
        exported: exportConsoleLog(scene, options),
      };
    } catch (error) {
      if (error instanceof ConsoleCompileError)
        return { ok: false as const, diagnostics: error.diagnostics };
      throw error;
    }
  }, [scene, options]);
  const diagnostics = compilation.ok
    ? [
        ...compilation.output.diagnostics,
        ...compilation.exported.diagnostics,
      ].filter(
        (entry, index, all) =>
          all.findIndex((other) => other.code === entry.code) === index,
      )
    : compilation.diagnostics;
  const source = useMemo(() => {
    if (format === "json") return JSON.stringify(scene, null, 2);
    if (format === "recipe")
      return JSON.stringify(recipeOf({ scene, options: settings }), null, 2);
    if (format === "javascript")
      return compilation.ok ? compilation.exported.code : "";
    const measurementNote = measurement.snapshot
      ? "// Fixed local-font metrics are included as data, not measured at runtime.\n// Recipient fonts can differ; remeasure explicitly or omit metrics after edits.\n"
      : "";
    const sceneCode = sourceString(scene);
    const optionsCode = sourceString(options);
    if (format === "typescript")
      return `${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { emitConsole } from "@servrox/console-fx/browser";\n\nconst scene = defineScene(${sceneCode});\nemitConsole(scene, ${optionsCode});`;
    if (format === "next")
      return `"use client";\n\n${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { ConsoleBanner } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport default function StartupBanner() {\n  return <ConsoleBanner scene={scene} enabled options={${optionsCode}} />;\n}`;
    return `${measurementNote}import { defineScene } from "@servrox/console-fx";\nimport { useConsoleScene } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport function PrintMessage() {\n  const { log } = useConsoleScene(scene, ${optionsCode});\n  return <button onClick={log}>Print message</button>;\n}`;
  }, [scene, format, options, settings, measurement.snapshot, compilation]);
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
  const slot = presentation?.slots.find(
    (s) => s.line === lineIndex && s.run === runIndex,
  );
  const styleEditable = (key: keyof NonNullable<typeof run>["style"]) =>
    !presentation ||
    (!!slot &&
      (slot.editableStyleKeys ?? presentation.editableStyleKeys).includes(key));
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
  const hasMotion = scene.lines.some((line) =>
    line.runs.some((run) =>
      run.effects.some(
        (effect) =>
          descriptors.find((item) => item.kind === effect.kind)?.motion ===
          "decorative",
      ),
    ),
  );

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
    setPlaying(false);
    setNotice({
      kind: "info",
      message:
        "Render settings will be saved with this recipe. Your earlier scene draft is retained.",
    });
  }
  const setRenderer = (renderer: Renderer) =>
    updateSettings({ ...settings, renderer });
  const setSystemMotion = (enabled: boolean) =>
    updateSettings({ ...settings, motion: enabled ? "system" : "reduce" });

  function commit(candidate: unknown) {
    const result = parseScene(candidate);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.diagnostics[0]!.message });
      return;
    }
    dispatch({ type: "replace", scene: result.value });
    setPlaying(false);
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
  function selectPreset(id: PresetId) {
    dispatch({ type: "load", document: createPresetExample(id) });
    setSelection({ line: 0, run: 0 });
    setPlaying(false);
    setNotice(null);
  }
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ kind: "success", message: `${label} copied.` });
    } catch {
      setNotice({
        kind: "error",
        message:
          "Clipboard access failed. Select and copy the generated code below, or export JSON.",
      });
    }
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const sequence = ++importSequence.current;
    if (file.size > LIMITS.inputBytes) {
      setNotice({
        kind: "error",
        message: "That file exceeds 64 KiB. Your current work is unchanged.",
      });
      return;
    }
    try {
      const result = decodeDocument(await file.text());
      if (sequence !== importSequence.current) return;
      if (!result.ok) {
        setNotice({
          kind: "error",
          message: `${result.diagnostics[0]!.message} Your current work is unchanged.`,
        });
        return;
      }
      dispatch({ type: "load", document: result.value });
      setSelection({ line: 0, run: 0 });
      setPlaying(false);
      setNotice({
        kind: "success",
        message:
          "Document imported. Undo restores your previous scene and render settings.",
      });
    } catch {
      setNotice({
        kind: "error",
        message: "The file could not be read. Your current work is unchanged.",
      });
    }
  }
  function retryStorage() {
    const result = store.read();
    if (result.kind === "error")
      setNotice({ kind: "error", message: result.message });
    else {
      store.queue(persisted, document.revision, true);
      setNotice({
        kind: "info",
        message: "Storage is available. Your current scene has been preserved.",
      });
    }
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
    setPlaying(true);
    setPreviewInstance((value) => value + 1);
  }
  function addLine() {
    if (scene.lines.length >= LIMITS.lines || runCount >= LIMITS.runs) return;
    commit({
      ...scene,
      lines: [...scene.lines, { runs: [{ text: "Another line" }] }],
    });
    setSelection({ line: scene.lines.length, run: 0 });
  }
  function addRun() {
    if (!line) {
      addLine();
      return;
    }
    commit({
      ...scene,
      lines: scene.lines.map((item, index) =>
        index === lineIndex
          ? { ...item, runs: [...item.runs, { text: " New text" }] }
          : item,
      ),
    });
    setSelection({ line: lineIndex, run: line.runs.length });
  }

  return (
    <div className={integrated ? "integrated-editor" : "page-shell"}>
      <details
        className="full-preset-gallery"
        onToggle={(event) => setGalleryOpen(event.currentTarget.open)}
      >
        <summary>Browse all 23 presets</summary>
        {galleryOpen && (
          <div className="gallery-section" aria-label="All preset collections">
            <h2>All presets</h2>
            {presetGroups.map((group) => (
              <div className="preset-group" key={group}>
                <h3>{group}</h3>
                <div
                  className={`preset-grid ${group === "Cinematic Metal" ? "cinematic-grid" : ""}`}
                >
                  {PRESETS.filter((item) => item.group === group).map(
                    (item) => (
                      <button
                        type="button"
                        className={`preset-card ${group === "Cinematic Metal" ? "cinematic-card" : ""}`}
                        key={item.id}
                        disabled={!ready || !!pendingShared}
                        onClick={() => selectPreset(item.id)}
                        aria-label={`Load ${item.name} preset`}
                      >
                        <div className="preset-sample">
                          <PresetSample id={item.id} />
                        </div>
                        <span className="preset-card-label">
                          {item.name}
                          <span aria-hidden="true">↗</span>
                        </span>
                        {group !== "Classic" && (
                          <span className="preset-description">
                            {item.description}
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </details>

      <section
        className="studio-shell"
        id={integrated ? "editor-workspace" : "playground"}
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
              onClick={() => {
                dispatch({ type: "undo" });
                setPlaying(false);
              }}
            >
              Undo
            </button>
            <button
              type="button"
              disabled={!ready || !!pendingShared || !document.future.length}
              onClick={() => {
                dispatch({ type: "redo" });
                setPlaying(false);
              }}
            >
              Redo
            </button>
            <button
              type="button"
              disabled={!ready || !!pendingShared}
              onClick={() => setConfirmReset(true)}
            >
              Reset
            </button>
          </div>
        </div>
        {!ready && (
          <p role="status" className="loading-note">
            Checking this browser for your saved draft…
          </p>
        )}
        <fieldset
          className="studio-fields"
          disabled={!ready || !!pendingShared}
        >
          <legend className="sr-only">Scene editor</legend>
          <div className="editor-grid">
            <aside className="content-panel panel">
              <PanelHeading>
                01 <span>Content</span>
              </PanelHeading>
              <label>
                Start from a preset
                <select
                  value=""
                  onChange={(event) =>
                    selectPreset(event.target.value as PresetId)
                  }
                >
                  <option value="" disabled>
                    Choose a preset
                  </option>
                  {presetGroups.map((group) => (
                    <optgroup label={group} key={group}>
                      {PRESETS.filter((item) => item.group === group).map(
                        (item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ),
                      )}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label>
                Scene label
                <input
                  value={scene.label}
                  onChange={(event) =>
                    commit({ ...scene, label: event.target.value })
                  }
                />
              </label>
              {presentation ? (
                <CardFields
                  scene={scene}
                  descriptor={presentation}
                  onChange={commit}
                  onSelect={setSelection}
                />
              ) : (
                <>
                  <div className="line-list" aria-label="Lines and text runs">
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
                            aria-pressed={li === lineIndex && ri === runIndex}
                            key={ri}
                            onClick={() => setSelection({ line: li, run: ri })}
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
                        scene.lines.length >= LIMITS.lines ||
                        runCount >= LIMITS.runs
                      }
                      onClick={addLine}
                    >
                      + Line
                    </button>
                    <button
                      type="button"
                      disabled={runCount >= LIMITS.runs}
                      onClick={addRun}
                    >
                      + Text run
                    </button>
                  </div>
                  {run && (
                    <>
                      <label>
                        Message text
                        <textarea
                          rows={4}
                          value={run.text}
                          onChange={(event) =>
                            patchRun({ text: event.target.value })
                          }
                        />
                      </label>
                      <div className="button-row compact">
                        <button
                          type="button"
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
                        <button
                          type="button"
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
                    </>
                  )}
                </>
              )}
              <p className="fine-print">
                {scene.lines.length}/{LIMITS.lines} lines · {runCount}/
                {LIMITS.runs} runs. Editing never prints to your console.
              </p>
            </aside>

            <div className="preview-panel panel">
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
                  {compilation.ok ? (
                    <ConsolePreview
                      key={previewInstance}
                      scene={scene}
                      options={{
                        ...options,
                        motion:
                          playing && renderer === "svg" ? "allow" : "reduce",
                      }}
                    />
                  ) : (
                    <p className="preview-error">
                      {compilation.diagnostics[0]?.message ??
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
                    disabled={
                      !hasMotion || renderer !== "svg" || !compilation.ok
                    }
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
                  Preview controls do not change printed entries.
                </span>
              </div>
              <label>
                Output renderer
                <select
                  value={renderer}
                  onChange={(event) => {
                    setRenderer(event.target.value as Renderer);
                    setPlaying(false);
                  }}
                >
                  <option value="css">CSS text · Chromium</option>
                  <option value="svg">SVG image · Chromium</option>
                  <option value="text">Plain text · any console</option>
                </select>
              </label>
              {recommendedRenderer !== renderer && (
                <button
                  type="button"
                  onClick={() => {
                    setRenderer(recommendedRenderer);
                    setPlaying(false);
                  }}
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
                    key={diagnostic.code}
                    className={
                      diagnostic.severity === "error" ? "error-text" : ""
                    }
                  >
                    {diagnostic.message}
                  </p>
                ))}
              </div>
              <p className="fine-print">
                Rich output is being qualified in Windows 11 Chrome and Edge.
                Page previews do not prove DevTools compatibility. Motion is
                decorative and lasts at most five seconds.
              </p>
            </div>

            <aside className="style-panel panel">
              <PanelHeading>
                03 <span>Customize</span>
              </PanelHeading>
              {presentation && (
                <fieldset className="effect-control">
                  <legend>{presentation.name}</legend>
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
              {run ? (
                <>
                  <div className="field-pair">
                    <label>
                      Font
                      <select
                        value={run.style.fontFamily}
                        disabled={!!cinematic || !styleEditable("fontFamily")}
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
                        disabled={!!cinematic || !styleEditable("color")}
                        onChange={(event) =>
                          patchRun({
                            style: { ...run.style, color: event.target.value },
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
                    disabled={angular || !styleEditable("fontWeight")}
                    value={run.style.fontWeight}
                    min={100}
                    max={900}
                    step={100}
                    onChange={(value) =>
                      patchRun({ style: { ...run.style, fontWeight: value } })
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
                      The reflection palette is fixed. Use Accent color for the
                      edges. Cinematic Metal is static-only.
                    </p>
                  )}
                  <label>
                    Alignment
                    <select
                      value={line!.align}
                      disabled={!!presentation}
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
                      return (
                        <fieldset className="effect-control" key={effect.kind}>
                          <legend>{descriptor.displayName}</legend>
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
                                    effect as unknown as Record<string, unknown>
                                  )[name]
                                }
                                onChange={(value) =>
                                  patchRun({
                                    effects: run.effects.map((item, index) =>
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
                  <label>
                    Add an effect
                    <select
                      value=""
                      disabled={
                        !!presentation ||
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
                              (renderer !== "svg" || !!cinematic) &&
                              descriptor.motion === "decorative"
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
                    80,
                    Math.floor(
                      (Math.min(scene.surface.width, scene.surface.height) -
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
                  max={80}
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
              </details>
            </aside>
          </div>

          <details className="fit-section">
            <summary>Fit and sizing</summary>
            <FitInspector
              key={JSON.stringify(settings)}
              scene={scene}
              options={settings}
              onApply={updateSettings}
              measurement={measurement}
              onMeasure={measurement.measure}
              onClearMeasurements={measurement.clear}
            />
          </details>

          <section className="export-panel" aria-labelledby="export-title">
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
            {hasMotion && renderer === "svg" && (
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={systemMotion}
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
                  {formats[format].copy} <span aria-hidden="true">↗</span>
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
                  onChange={(event) => void importFile(event)}
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
                        "Download failed. Choose Editable JSON above and copy it.",
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
              {!focused && (
                <button
                  type="button"
                  onClick={() => {
                    const result = encodeShare(recipeOf(document));
                    if (!result.ok)
                      setNotice({
                        kind: "error",
                        message: `${result.diagnostics[0]!.message} Export Recipe JSON and import it in the full studio instead.`,
                      });
                    else router.push(`/studio/${result.value}`);
                  }}
                >
                  Open full studio
                </button>
              )}
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => store.clear(document.revision)}
            >
              Clear local draft
            </button>
          </div>
        </fieldset>
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
        {(draftStatus?.kind === "error" || notice?.kind === "error") && (
          <button
            type="button"
            disabled={!!pendingShared}
            onClick={retryStorage}
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
            releaseShared.current?.();
            releaseShared.current = null;
            setPendingShared(null);
            setNotice({ kind: "info", message: "Kept your current scene." });
          }}
          onConfirm={() => {
            releaseShared.current?.();
            releaseShared.current = null;
            dispatch({ type: "load", document: pendingShared });
            setPendingShared(null);
            setPlaying(false);
            setNotice({
              kind: "success",
              message:
                "Shared scene loaded. Undo restores your previous scene.",
            });
          }}
        />
      )}
      {pendingExample && !pendingShared && (
        <ConfirmDialog
          title="Edit this example in the playground?"
          description="This replaces your current scene and render settings as one undoable change. Your previous work remains in Undo."
          confirmLabel="Load example"
          onCancel={() => {
            onTransferDone?.(true);
            setNotice({ kind: "info", message: "Kept your current scene." });
          }}
          onConfirm={() => {
            dispatch({ type: "load", document: pendingExample });
            setSelection({ line: 0, run: 0 });
            setPlaying(false);
            onTransferDone?.();
            setNotice({
              kind: "success",
              message:
                "Example loaded with its render settings. Undo restores your previous work.",
            });
          }}
        />
      )}
      {confirmReset && (
        <ConfirmDialog
          title="Start a fresh message?"
          description="This discards the current scene and its undo history. The existing local draft stays stored; use Clear local draft to remove it. Autosave resumes only after your next edit."
          confirmLabel="Reset scene"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            store.protectThrough(document.revision + 1);
            dispatch({ type: "reset" });
            setSelection({ line: 0, run: 0 });
            setConfirmReset(false);
            setPlaying(false);
            setNotice({
              kind: "info",
              message:
                "Started a fresh message. The stored draft has not been deleted.",
            });
          }}
        />
      )}
    </div>
  );
}
