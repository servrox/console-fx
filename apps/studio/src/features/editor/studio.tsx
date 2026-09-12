"use client";
import { useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  getEffectDescriptors,
  LIMITS,
  parseScene,
  utf8ByteLength,
} from "@servrox/console-fx";
import type {
  EffectKind,
  ParameterDescriptor,
  Renderer,
  SceneV1,
} from "@servrox/console-fx";
import {
  compileConsole,
  ConsoleCompileError,
  resolveMotion,
} from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { neon, PRESETS, preset } from "@servrox/console-fx/presets";
import type { PresetId } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";
import {
  decodeDocument,
  decodeShare,
  encodeShare,
} from "../persistence/documents";
import { DraftStore } from "../persistence/draft";
import type { DraftStatus } from "../persistence/draft";
import { documentReducer, initialDocument, sameScene } from "./document";
import { ConfirmDialog } from "./confirm-dialog";

const descriptors = getEffectDescriptors();
const initialScene = neon({ text: "Hello, developer." });
const heroScene = neon({ text: "console-fx" });
type Notice = {
  readonly kind: "success" | "error" | "info";
  readonly message: string;
};
type ExportFormat = "javascript" | "typescript" | "react" | "next" | "json";
const sourceString = (value: unknown) =>
  JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");

function download(scene: SceneV1) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(scene, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "console-fx-scene.json";
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
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly unit?: string;
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

export function Studio({ focused = false }: { readonly focused?: boolean }) {
  const [document, dispatch] = useReducer(
    documentReducer,
    initialScene,
    initialDocument,
  );
  const [ready, setReady] = useState(false);
  const [renderer, setRenderer] = useState<Renderer>("css");
  const [selection, setSelection] = useState({ line: 0, run: 0 });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus | null>(null);
  const [pendingShared, setPendingShared] = useState<SceneV1 | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [previewTheme, setPreviewTheme] = useState("dark");
  const [playing, setPlaying] = useState(false);
  const [previewInstance, setPreviewInstance] = useState(0);
  const [systemMotion, setSystemMotion] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("javascript");
  const [store] = useState(
    () => new DraftStore(() => window.localStorage, setDraftStatus),
  );
  const initialized = useRef(false);
  const importSequence = useRef(0);
  const scene = document.scene;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const draft = store.read();
    let baseline = draft.kind === "valid" ? draft.scene : initialScene;
    let shared: SceneV1 | null = null;
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
      else if (draft.kind === "valid" && !sameScene(baseline, result.value)) {
        shared = result.value;
        store.hold();
      } else if (draft.kind !== "valid") {
        baseline = result.value;
        startupNotice = {
          kind: "success",
          message: "Shared scene loaded. It has not been printed.",
        };
      }
    }
    dispatch({ type: "initialize", scene: baseline });
    // Storage and fragments are intentionally read after hydration. The initial
    // server/client render is identical, and no default draft is ever persisted.
    setPendingShared(shared);
    setNotice(startupNotice);
    setReady(true);
  }, [store]);
  useEffect(() => {
    if (ready) store.queue(scene, document.revision);
  }, [scene, document.revision, ready, store]);
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

  const options = useMemo(
    () => ({
      target: "chromium" as const,
      renderer,
      motion:
        systemMotion && renderer === "svg"
          ? ("system" as const)
          : ("reduce" as const),
    }),
    [renderer, systemMotion],
  );
  const { log } = useConsoleScene(scene, options);
  const compilation = useMemo(() => {
    try {
      return {
        ok: true as const,
        output: compileConsole(scene, {
          target: "chromium",
          renderer,
          motion: "reduce",
        }),
        exported: exportConsoleLog(scene, options),
      };
    } catch (error) {
      if (error instanceof ConsoleCompileError)
        return { ok: false as const, diagnostics: error.diagnostics };
      throw error;
    }
  }, [scene, renderer, options]);
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
    if (format === "javascript")
      return compilation.ok ? compilation.exported.code : "";
    const sceneCode = sourceString(scene);
    const optionsCode = sourceString(options);
    if (format === "typescript")
      return `import { defineScene } from "@servrox/console-fx";\nimport { emitConsole } from "@servrox/console-fx/browser";\n\nconst scene = defineScene(${sceneCode});\nemitConsole(scene, ${optionsCode});`;
    if (format === "next")
      return `"use client";\n\nimport { defineScene } from "@servrox/console-fx";\nimport { ConsoleBanner } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport default function StartupBanner() {\n  return <ConsoleBanner scene={scene} enabled options={${optionsCode}} />;\n}`;
    return `import { defineScene } from "@servrox/console-fx";\nimport { useConsoleScene } from "@servrox/console-fx-react";\n\nconst scene = defineScene(${sceneCode});\n\nexport function PrintMessage() {\n  const { log } = useConsoleScene(scene, ${optionsCode});\n  return <button onClick={log}>Print message</button>;\n}`;
  }, [scene, format, options, compilation]);
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
    commit(preset(id));
    setSelection({ line: 0, run: 0 });
    setRenderer(PRESETS.find((item) => item.id === id)!.renderer);
    setSystemMotion(false);
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
      dispatch({ type: "replace", scene: result.value });
      setSelection({ line: 0, run: 0 });
      setPlaying(false);
      setNotice({
        kind: "success",
        message: "Scene imported. Undo restores your previous scene.",
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
      store.queue(scene, document.revision, true);
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
    <div className="page-shell">
      {!focused && (
        <>
          <section className="hero" aria-labelledby="hero-title">
            <div>
              <p className="eyebrow">
                For developers who appreciate the details
              </p>
              <h1 id="hero-title">
                Beautiful console output,
                <br />
                <span>made simple.</span>
              </h1>
              <p className="hero-description">
                Give your next hello a little character. Compose a message, make
                it yours, and export a single console.log.
              </p>
              <div className="button-row">
                <a className="button primary" href="#playground">
                  Open the playground <span aria-hidden="true">↗</span>
                </a>
                <a className="button" href="#presets">
                  Explore presets
                </a>
              </div>
              <ul className="hero-notes">
                <li>One console entry</li>
                <li>No snippet dependencies</li>
                <li>Your data stays local</li>
              </ul>
            </div>
            <div className="hero-demo">
              <div className="console-chrome">
                <span className="console-dots" aria-hidden="true">
                  ● ● ●
                </span>
                <span>Console</span>
                <span className="console-prompt" aria-hidden="true">
                  ›_
                </span>
              </div>
              <div className="hero-output">
                <ConsolePreview
                  scene={heroScene}
                  options={{ target: "chromium", renderer: "css" }}
                />
              </div>
              <div className="demo-footnote">
                <code>console.log(your.signature)</code>
                <span>One expressive entry.</span>
              </div>
            </div>
          </section>
          <section
            className="gallery-section"
            id="presets"
            aria-labelledby="presets-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Start with a little inspiration</p>
                <h2 id="presets-title">Pick your personality.</h2>
              </div>
              <p>Every example is an editable scene.</p>
            </div>
            <div className="preset-grid">
              {PRESETS.map((item) => (
                <button
                  type="button"
                  className="preset-card"
                  key={item.id}
                  disabled={!ready || !!pendingShared}
                  onClick={() => selectPreset(item.id)}
                  aria-label={`Load ${item.name} preset`}
                >
                  <div className="preset-sample">
                    <ConsolePreview
                      scene={preset(item.id)}
                      options={{ target: "chromium", renderer: item.renderer }}
                    />
                  </div>
                  <span className="preset-card-label">
                    {item.name}
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="fine-print">
              Compiler-generated previews. Select a preset to edit the same
              scene below.
            </p>
          </section>
        </>
      )}

      <section
        className="studio-shell"
        id="playground"
        aria-labelledby="playground-title"
      >
        <div className="studio-heading">
          <div>
            <p className="eyebrow">Make it yours</p>
            <h2 id="playground-title">
              The playground
              <span className="small-dot" aria-hidden="true">
                .
              </span>
            </h2>
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
              <h3>
                01 <span>Content</span>
              </h3>
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
                  {PRESETS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
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
              <p className="fine-print">
                {scene.lines.length}/{LIMITS.lines} lines · {runCount}/
                {LIMITS.runs} runs. Editing never prints to your console.
              </p>
            </aside>

            <div className="preview-panel panel">
              <div className="preview-heading">
                <h3>
                  02 <span>Preview</span>
                </h3>
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
                        target: "chromium",
                        renderer,
                        motion:
                          playing && renderer === "svg" ? "allow" : "reduce",
                      }}
                    />
                  ) : (
                    <p className="preview-error">
                      This renderer cannot display the selected effects. Choose
                      SVG or plain text.
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
              <h3>
                03 <span>Customize</span>
              </h3>
              {run ? (
                <>
                  <div className="field-pair">
                    <label>
                      Font
                      <select
                        value={run.style.fontFamily}
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
                    value={run.style.fontWeight}
                    min={100}
                    max={900}
                    step={100}
                    onChange={(value) =>
                      patchRun({ style: { ...run.style, fontWeight: value } })
                    }
                  />
                  <label>
                    Alignment
                    <select
                      value={line!.align}
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
                                name={name}
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
                      disabled={run.effects.length >= LIMITS.effectsPerRun}
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
                              renderer !== "svg" &&
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
                    One style effect and one decorative motion per text run.
                    Remove an effect to choose another.
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

          <section className="export-panel" aria-labelledby="export-title">
            <div className="export-heading">
              <div>
                <h3 id="export-title">Your message, ready to go.</h3>
                <p>Self-contained JavaScript. No imports. One console.log.</p>
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
                  <option value="json">Editable JSON</option>
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
                  disabled={!compilation.ok}
                  onClick={() => {
                    if (compilation.ok)
                      void copy(compilation.exported.code, "console.log");
                  }}
                >
                  Copy console.log <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
            {format !== "javascript" && (
              <button
                type="button"
                disabled={!source || !compilation.ok}
                onClick={() => void copy(source, "Selected format")}
              >
                Copy selected format
              </button>
            )}
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
                  const result = encodeShare(scene);
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
          description="You have a valid local draft. Loading this shared scene replaces the current document as one undoable change. Keep your current scene to continue where you left off."
          confirmLabel="Load shared scene"
          onCancel={() => {
            store.release();
            setPendingShared(null);
            setNotice({ kind: "info", message: "Kept your current scene." });
          }}
          onConfirm={() => {
            store.release();
            dispatch({ type: "replace", scene: pendingShared });
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
