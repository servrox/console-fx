import { deepFreeze } from "../model/limits.js";
import { fail, record } from "./index.js";
import { normalizeCompileOptions, normalizeExportOptions } from "./options.js";
import {
  normalizeLayout,
  normalizeSizing,
  normalizeMeasurements,
  measurementEnvironment,
} from "./layout.js";
const baseKeys = ["target", "renderer", "motion", "unsupported"];
function split(input: unknown) {
  const d = record(
    input,
    [...baseKeys, "layout", "sizing", "measurements", "measurementEnvironment"],
    [],
  );
  if (
    (d.measurements !== undefined || d.measurementEnvironment !== undefined) &&
    d.layout === undefined
  )
    fail(
      "invalid-options",
      "Font measurements require an explicit layout request.",
      ["layout"],
    );
  const fitting = {
    ...(d.layout === undefined ? {} : { layout: normalizeLayout(d.layout) }),
    ...(d.sizing === undefined ? {} : { sizing: normalizeSizing(d.sizing) }),
    ...(d.measurements === undefined
      ? {}
      : { measurements: normalizeMeasurements(d.measurements) }),
    ...(d.measurementEnvironment === undefined
      ? {}
      : {
          measurementEnvironment: measurementEnvironment(
            d.measurementEnvironment,
          ),
        }),
  };
  return {
    base: Object.fromEntries(
      baseKeys.filter((k) => Object.hasOwn(d, k)).map((k) => [k, d[k]]),
    ),
    fitting,
  };
}
export function normalizeRenderOptions(input: unknown) {
  const { base, fitting } = split(input);
  return deepFreeze({ ...normalizeCompileOptions(base), ...fitting });
}
export function normalizeRenderExportOptions(input: unknown) {
  const { base, fitting } = split(input);
  return deepFreeze({ ...normalizeExportOptions(base), ...fitting });
}
