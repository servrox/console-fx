"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { SceneInputV1 } from "@servrox/console-fx";
import { compileConsole, emitConsole } from "@servrox/console-fx/browser";
import type {
  BrowserOptions,
  CompileOptions,
  CompiledPreview,
} from "@servrox/console-fx/browser";

/** The callback uses the scene and policy of the current committed render. */
export function useConsoleScene(scene: SceneInputV1, options?: BrowserOptions) {
  const log = useCallback(() => emitConsole(scene, options), [scene, options]);
  return { log };
}

export interface ConsoleBannerProps {
  readonly scene: SceneInputV1;
  readonly enabled?: boolean;
  readonly options?: BrowserOptions;
}

/** One emission at the first enabled effect of this mounted instance. */
export function ConsoleBanner({
  scene,
  enabled = false,
  options,
}: ConsoleBannerProps) {
  const emitted = useRef(false);
  useEffect(() => {
    if (!enabled || emitted.current) return;
    emitConsole(scene, options);
    emitted.current = true;
  }, [enabled, scene, options]);
  return null;
}

export interface ConsolePreviewProps {
  readonly scene: SceneInputV1;
  readonly options?: CompileOptions;
  readonly className?: string;
}

// Keys and values come exclusively from the public compiler's CSS allowlist.
// This converts CSS spelling to React spelling without recreating any effect.
function reactStyle(style: Readonly<Record<string, string>>): CSSProperties {
  return Object.fromEntries(
    Object.entries(style).map(([key, value]) => [
      key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value,
    ]),
  ) as CSSProperties;
}

function PreviewContent({ preview }: { readonly preview: CompiledPreview }) {
  if (preview.kind === "svg") {
    // Exact generated data URI; optimization would transform the promised asset.
    return (
      <img
        src={preview.imageUri}
        alt={preview.alt}
        width={preview.width}
        height={preview.height}
        style={{ display: "block", maxWidth: "100%", height: "auto" }}
      />
    );
  }
  if (preview.kind === "text")
    return (
      <pre
        style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 }}
      >
        {preview.text}
      </pre>
    );
  return (
    <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
      {preview.lines.map((line, lineIndex) => (
        <div key={lineIndex}>
          {line.runs.map((run, runIndex) => (
            <span key={runIndex} style={reactStyle(run.style)}>
              {run.text}
            </span>
          ))}
          {line.runs.every((run) => run.text === "") ? <br /> : null}
        </div>
      ))}
    </div>
  );
}

/** Rendering is silent. Motion defaults to static and requires explicit policy. */
export function ConsolePreview({
  scene,
  options,
  className,
}: ConsolePreviewProps) {
  const output = compileConsole(scene, options);
  const label =
    output.preview.kind === "css"
      ? "Approximate browser preview"
      : output.preview.kind === "svg"
        ? "SVG image preview · DevTools appearance may differ"
        : "Plain-text preview";
  return (
    <figure className={className} style={{ margin: 0 }}>
      <PreviewContent preview={output.preview} />
      <figcaption
        style={{ marginTop: "1rem", fontSize: "0.75rem", lineHeight: 1.5 }}
      >
        {label}
      </figcaption>
    </figure>
  );
}
