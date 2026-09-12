import { deepFreeze, LIMITS, utf8ByteLength } from "../model/limits.js";
import type { RenderRecipeV1 } from "../model/layout.js";
import type { ValidationResult } from "../model/types.js";
import { defineScene, fail, record, SceneValidationError } from "./index.js";
import { normalizeRenderExportOptions } from "./render-options.js";

/** Parses recipe data only. parseScene intentionally never guesses this envelope. */
export function parseRenderRecipe(
  input: unknown,
): ValidationResult<RenderRecipeV1> {
  try {
    const d = record(input, ["kind", "recipeVersion", "scene", "options"], []);
    if (d.kind !== "consoleFxRenderRecipe" || d.recipeVersion !== 1)
      fail("unsupported-recipe", "Use a supported ConsoleFX render recipe.", [
        "recipeVersion",
      ]);
    // Snapshot/environment are transient inputs and cannot enter saved recipes.
    const options = record(
      d.options,
      ["target", "renderer", "motion", "unsupported", "layout", "sizing"],
      ["options"],
    );
    const value: RenderRecipeV1 = {
      kind: "consoleFxRenderRecipe",
      recipeVersion: 1,
      scene: defineScene(d.scene as RenderRecipeV1["scene"]),
      options: normalizeRenderExportOptions(options),
    };
    if (utf8ByteLength(JSON.stringify(value)) > LIMITS.inputBytes)
      fail("resource-limit", "Render recipes must fit within 64 KiB.", []);
    return { ok: true, value: deepFreeze(value), diagnostics: [] };
  } catch (error) {
    if (error instanceof SceneValidationError)
      return { ok: false, diagnostics: error.diagnostics };
    throw error;
  }
}
