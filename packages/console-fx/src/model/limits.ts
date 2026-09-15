export const LIMITS = Object.freeze({
  inputBytes: 64 * 1024,
  textCodePoints: 2000,
  lines: 8,
  runs: 32,
  effectsPerRun: 4,
  animatedGraphemes: 80,
  svgWidth: 1200,
  svgHeight: 400,
  svgElements: 1000,
  motionMs: 5000,
  snippetWarningBytes: 32 * 1024,
  snippetBytes: 128 * 1024,
  shareBytes: 8 * 1024,
  history: 100,
});

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
