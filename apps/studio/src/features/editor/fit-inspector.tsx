"use client";
import { useMemo, useRef, useState } from "react";
import {
  compileConsole,
  ConsoleCompileError,
} from "@servrox/console-fx/browser";
import type {
  SceneV1,
  RenderRecipeV1,
  LayoutRequest,
  MeasurementSnapshot,
  CompiledConsole,
} from "@servrox/console-fx";
import { usePreviewWidth } from "./use-preview-width";

function image(output: CompiledConsole, overlay: boolean) {
  if (output.preview.kind !== "svg") return <pre>{output.text}</pre>;
  const report = output.layout;
  return (
    <div className="fit-image">
      {/* The exact compiler URI is shared with export; the overlay is diagnostic geometry only. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={output.preview.imageUri}
        width={output.preview.width}
        height={output.preview.height}
        alt={output.text}
      />
      {overlay && report && (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${report.artboard.width} ${report.artboard.height}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {report.fragments.map((fragment, i) => (
            <rect
              key={i}
              {...fragment.paint}
              fill="none"
              stroke="#f6c760"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}
    </div>
  );
}

function NumberControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [previousValue, setPreviousValue] = useState(value);
  if (previousValue !== value) {
    setPreviousValue(value);
    if (Number(draft) !== value) setDraft(String(value));
  }
  const parsed = Number(draft);
  const valid =
    draft.trim() !== "" &&
    Number.isFinite(parsed) &&
    parsed >= min &&
    parsed <= max;
  return (
    <label>
      {label}
      <input
        type="number"
        step="any"
        aria-label={label}
        min={min}
        max={max}
        value={draft}
        aria-invalid={!valid}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          const next = Number(text);
          if (
            text.trim() &&
            Number.isFinite(next) &&
            next >= min &&
            next <= max
          )
            onChange(next);
        }}
        onBlur={() => {
          if (!valid) setDraft(String(value));
        }}
      />
      {!valid && (
        <small>
          Enter a number from {min} to {max}.
        </small>
      )}
    </label>
  );
}

export function FitInspector({
  scene,
  options,
  onApply,
  measurement,
  onMeasure,
  onClearMeasurements,
}: {
  readonly scene: SceneV1;
  readonly options: RenderRecipeV1["options"];
  readonly onApply: (options: RenderRecipeV1["options"]) => void;
  readonly measurement: {
    readonly snapshot?: MeasurementSnapshot | undefined;
    readonly pending: boolean;
    readonly message?: string | undefined;
  };
  readonly onMeasure: () => void;
  readonly onClearMeasurements: () => void;
}) {
  const [requestedWidth, setRequestedWidth] = useState(
    options.layout?.width ?? 360,
  );
  const [policy, setPolicy] = useState<Omit<LayoutRequest, "width">>(() => ({
    algorithm: "fit/v1",
    maxHeight: options.layout?.maxHeight ?? 400,
    variant: options.layout?.variant ?? "standard",
    overflow: options.layout?.overflow ?? "wrap-then-shrink",
    minFontSize: options.layout?.minFontSize ?? 12,
  }));
  const [mode, setMode] = useState(options.sizing?.mode ?? "fixed");
  const [outputWidth, setOutputWidth] = useState(
    options.sizing?.mode === "fixed"
      ? options.sizing.width
      : options.sizing?.mode === "container-experimental"
        ? options.sizing.maxWidth
        : (options.layout?.width ?? 360),
  );
  const [fillFraction, setFillFraction] = useState(
    options.sizing?.mode === "container-experimental"
      ? (options.sizing.fillFraction ?? 0.96)
      : 0.96,
  );
  const [overlay, setOverlay] = useState(false);
  const fittingKey = JSON.stringify({
    layout: options.layout,
    sizing: options.sizing,
  });
  const [previousFitting, setPreviousFitting] = useState(fittingKey);
  // Synchronize saved fitting without discarding drafts on unrelated setting edits.
  if (previousFitting !== fittingKey) {
    setPreviousFitting(fittingKey);
    setRequestedWidth(options.layout?.width ?? 360);
    setPolicy({
      algorithm: "fit/v1",
      maxHeight: options.layout?.maxHeight ?? 400,
      variant: options.layout?.variant ?? "standard",
      overflow: options.layout?.overflow ?? "wrap-then-shrink",
      minFontSize: options.layout?.minFontSize ?? 12,
    });
    setMode(options.sizing?.mode ?? "fixed");
    setOutputWidth(
      options.sizing?.mode === "fixed"
        ? options.sizing.width
        : options.sizing?.mode === "container-experimental"
          ? options.sizing.maxWidth
          : (options.layout?.width ?? 360),
    );
    setFillFraction(
      options.sizing?.mode === "container-experimental"
        ? (options.sizing.fillFraction ?? 0.96)
        : 0.96,
    );
  }
  const boundary = useRef<HTMLDivElement>(null);
  const { width, unavailable } = usePreviewWidth(boundary);
  const simulation = useMemo(() => {
    if (width === null) return null;
    try {
      return {
        ok: true as const,
        output: compileConsole(scene, {
          target: "chromium",
          renderer: "svg",
          motion: "reduce",
          layout: { ...policy, width },
          sizing: { mode: "fixed", width },
          ...(measurement.snapshot
            ? {
                measurements: measurement.snapshot,
                measurementEnvironment: measurement.snapshot.environment,
              }
            : {}),
        }),
      };
    } catch (error) {
      if (error instanceof ConsoleCompileError)
        return { ok: false as const, diagnostics: error.diagnostics };
      throw error;
    }
  }, [scene, policy, width, measurement.snapshot]);
  const motionFit = useMemo(() => {
    if (width === null || options.motion !== "system") return null;
    try {
      compileConsole(scene, {
        target: "chromium",
        renderer: "svg",
        motion: "allow",
        layout: { ...policy, width },
        sizing:
          mode === "fixed"
            ? { mode, width: outputWidth }
            : { mode, maxWidth: outputWidth, fillFraction },
        ...(measurement.snapshot
          ? {
              measurements: measurement.snapshot,
              measurementEnvironment: measurement.snapshot.environment,
            }
          : {}),
      });
      return { ok: true as const };
    } catch (error) {
      if (error instanceof ConsoleCompileError)
        return { ok: false as const, diagnostics: error.diagnostics };
      throw error;
    }
  }, [
    scene,
    policy,
    width,
    options.motion,
    mode,
    outputWidth,
    fillFraction,
    measurement.snapshot,
  ]);
  const reference = useMemo(
    () =>
      width === null
        ? null
        : compileConsole(scene, {
            target: "chromium",
            renderer: "svg",
            motion: "reduce",
            unsupported: "fallback",
          }),
    [scene, width],
  );
  const report = simulation?.ok ? simulation.output.layout : undefined;
  return (
    <div className="fit-inspector">
      <p>
        Compare content at a chosen width. Resizing this preview changes the
        simulation only. It does not detect your console width or print
        anything.
      </p>
      <div className="button-row fit-widths" aria-label="Simulation widths">
        {[280, 360, 480, 720, 960].map((size) => (
          <button
            type="button"
            key={size}
            aria-pressed={width === size}
            onClick={() => {
              setRequestedWidth(size);
              if (boundary.current) boundary.current.style.width = `${size}px`;
            }}
          >
            {size}px
          </button>
        ))}
      </div>
      <div className="fit-controls">
        <label>
          Layout variant
          <select
            value={policy.variant}
            onChange={(event) =>
              setPolicy({
                ...policy,
                variant: event.target.value as LayoutRequest["variant"],
              })
            }
          >
            <option value="standard">Standard</option>
            <option value="auto">Auto (reviewed variants only)</option>
            <option value="compact">Compact (reviewed cards)</option>
          </select>
        </label>
        <label>
          Overflow policy
          <select
            value={policy.overflow}
            onChange={(event) =>
              setPolicy({
                ...policy,
                overflow: event.target.value as LayoutRequest["overflow"],
              })
            }
          >
            <option value="error">Report overflow</option>
            <option value="wrap">Wrap at legal breaks</option>
            <option value="shrink">Shrink uniformly</option>
            <option value="wrap-then-shrink">Wrap, then shrink</option>
          </select>
        </label>
        <NumberControl
          label="Minimum type size (CSS px)"
          value={policy.minFontSize}
          min={8}
          max={160}
          onChange={(minFontSize) => setPolicy({ ...policy, minFontSize })}
        />
        <NumberControl
          label="Maximum content height (px)"
          value={policy.maxHeight}
          min={1}
          max={400}
          onChange={(maxHeight) => setPolicy({ ...policy, maxHeight })}
        />
      </div>
      <p className="fine-print">
        Simulation:{" "}
        {width === null
          ? "waiting for a visible preview"
          : `${width}px content box`}
        . Drag its right edge or choose a width above. All ten card presets have
        reviewed compact layouts; arbitrary text must still pass fitting.
      </p>
      <label className="check-field">
        <input
          type="checkbox"
          checked={overlay}
          onChange={(event) => setOverlay(event.target.checked)}
        />
        Show paint-bound overlay
      </label>
      <div
        className="fit-scroll"
        tabIndex={0}
        role="region"
        aria-label="Fitting preview; scroll to inspect larger widths"
      >
        <div
          className="fit-boundary"
          ref={boundary}
          style={{ width: requestedWidth }}
        >
          {simulation?.ok ? (
            image(simulation.output, overlay)
          ) : (
            <p className="preview-error">
              {unavailable
                ? "Preview width observation is unavailable. Editing and your existing exports still work."
                : (simulation?.diagnostics[0]?.message ??
                  "Fitting is deferred while this preview is hidden.")}
            </p>
          )}
        </div>
      </div>
      <p className="fine-print">
        The outline shows each fragment’s static paint bounds. Content and
        captions are never shortened to make them fit.
      </p>
      {motionFit && (
        <p
          role="status"
          className={
            motionFit.ok
              ? "fine-print fit-motion-status"
              : "error-text fit-motion-status"
          }
        >
          {motionFit.ok
            ? "Finite motion fits the selected export frame. The preview above stays static."
            : `Motion-enabled SVG export: ${motionFit.diagnostics[0]!.message} Choose a larger frame or disable export motion.`}
        </p>
      )}
      {report && (
        <dl className="fit-report">
          <div>
            <dt>Confidence</dt>
            <dd>{report.measurementQuality}</dd>
          </div>
          <div>
            <dt>Content scale</dt>
            <dd>{Math.round(report.contentScale * 1000) / 10}%</dd>
          </div>
          <div>
            <dt>Visual rows</dt>
            <dd>{report.visualRows}</dd>
          </div>
          <div>
            <dt>Smallest type</dt>
            <dd>
              {report.fragments.some((fragment) => fragment.text)
                ? `${Math.round(Math.min(...report.fragments.filter((fragment) => fragment.text).map((fragment) => fragment.fontSize)) * 100) / 100}px`
                : "No text"}
            </dd>
          </div>
        </dl>
      )}
      {simulation && (
        <ul className="fit-diagnostics">
          {(simulation.ok
            ? simulation.output.diagnostics
            : simulation.diagnostics
          ).map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${index}`}>{diagnostic.message}</li>
          ))}
        </ul>
      )}
      <details>
        <summary>Reference: original SVG without fitting</summary>
        {reference && image(reference, false)}
        <p className="fine-print">
          This uses the unchanged scene surface. Page images do not prove
          DevTools appearance.
        </p>
      </details>
      <div className="fit-controls">
        <label>
          Export carrier
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as typeof mode)}
          >
            <option value="fixed">Fixed display width</option>
            <option value="container-experimental">
              Container relative — experimental
            </option>
          </select>
        </label>
        <NumberControl
          label={
            mode === "fixed"
              ? "Export display width (px)"
              : "Maximum display width (px)"
          }
          value={outputWidth}
          min={1}
          max={1200}
          onChange={setOutputWidth}
        />
        {mode === "container-experimental" && (
          <NumberControl
            label="Container fill fraction"
            value={fillFraction}
            min={0.5}
            max={0.98}
            onChange={setFillFraction}
          />
        )}
      </div>
      <p className="fine-print">
        {mode === "fixed" && width
          ? `Requested display scale: ${Math.round((outputWidth / width) * 100)}%. The compiler checks readable floors at that known size.`
          : "Container output remains experimental. Its resize behavior was observed in recorded Windows Chrome and Edge builds; image-text readability at an unknown display size is not guaranteed. The full native caption is retained."}
      </p>
      <div className="button-row">
        <button
          type="button"
          disabled={width === null}
          onClick={() => {
            if (width !== null)
              onApply({
                ...options,
                target: "chromium",
                renderer: "svg",
                layout: { ...policy, width },
                sizing:
                  mode === "fixed"
                    ? { mode, width: outputWidth }
                    : { mode, maxWidth: outputWidth, fillFraction },
              });
          }}
        >
          Use this width for export
        </button>
        <button
          type="button"
          disabled={!options.layout && !options.sizing}
          onClick={() => {
            const next = { ...options };
            delete next.layout;
            delete next.sizing;
            onApply(next);
          }}
        >
          Remove fitting and sizing
        </button>
        <button
          type="button"
          disabled={
            measurement.pending || !options.layout || options.renderer !== "svg"
          }
          onClick={onMeasure}
        >
          Measure local fonts for export
        </button>
        {measurement.snapshot && (
          <button type="button" onClick={onClearMeasurements}>
            Clear font measurements
          </button>
        )}
      </div>
      <p role="status">
        {measurement.message ??
          "Font measurement is optional and explicit. Your saved recipe contains render intent; local measurements last only for this editing session."}
      </p>
    </div>
  );
}
