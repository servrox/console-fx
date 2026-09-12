import type { CompileOptions, ExportOptions } from "../model/types.js";
import { fail, record } from "./index.js";

function normalize(input: unknown, motion: readonly string[]) {
  const supported = {
    target: ["chromium", "firefox", "safari", "node", "bun", "unknown"],
    renderer: ["css", "svg", "text"],
    motion,
    unsupported: ["error", "fallback"],
  };
  const data = record(input, Object.keys(supported), []);
  for (const [key, value] of Object.entries(data)) {
    if (
      value !== undefined &&
      (typeof value !== "string" ||
        !supported[key as keyof typeof supported].includes(value))
    )
      fail("invalid-options", "Choose documented compilation options.", [key]);
  }
  return {
    target: data.target ?? "unknown",
    renderer: data.renderer ?? "text",
    motion: data.motion ?? "reduce",
    unsupported: data.unsupported ?? "error",
  };
}
export function normalizeCompileOptions(
  input: unknown,
): NormalizedCompileOptions {
  return normalize(input, ["allow", "reduce"]) as NormalizedCompileOptions;
}
export function normalizeExportOptions(
  input: unknown,
): NormalizedExportOptions {
  return normalize(input, ["system", "reduce"]) as NormalizedExportOptions;
}
export type NormalizedCompileOptions = CompileOptions &
  Required<
    Pick<CompileOptions, "target" | "renderer" | "motion" | "unsupported">
  >;
export type NormalizedExportOptions = ExportOptions &
  Required<
    Pick<ExportOptions, "target" | "renderer" | "motion" | "unsupported">
  >;
