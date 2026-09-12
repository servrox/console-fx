// Both adapters require positive no-preference. Helpers additionally recover
// from host errors; standalone source preserves the spec's no-IIFE grammar.
const query = "(prefers-reduced-motion: no-preference)";

export function resolveMotion(): "allow" | "reduce" {
  try {
    return typeof globalThis.matchMedia === "function" &&
      globalThis.matchMedia(query).matches === true
      ? "allow"
      : "reduce";
  } catch {
    return "reduce";
  }
}

/** Read-only, self-contained guard used only when both motion branches exist. */
export function motionGuardSource(): string {
  return `typeof globalThis.matchMedia === "function" && globalThis.matchMedia(${JSON.stringify(query)})?.matches === true`;
}
