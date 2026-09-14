import {
  LIMITS,
  parseScene,
  parseRenderRecipe,
  utf8ByteLength,
} from "@servrox/console-fx";
import type {
  SceneV1,
  RenderRecipeV1,
  ValidationResult,
} from "@servrox/console-fx";

export type SavedDocument = SceneV1 | RenderRecipeV1;
export const isRecipe = (document: SavedDocument): document is RenderRecipeV1 =>
  "kind" in document;

const failure = <T>(code: string, message: string): ValidationResult<T> => ({
  ok: false,
  diagnostics: [{ code, message, severity: "error", path: [] }],
});
export function decodeDocument(
  source: string,
): ValidationResult<SavedDocument> {
  if (utf8ByteLength(source) > LIMITS.inputBytes)
    return failure(
      "input-too-large",
      "This document exceeds 64 KiB. Your current work is unchanged.",
    );
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return failure(
      "invalid-json",
      "This file is not valid JSON. Your current work is unchanged.",
    );
  }
  return value !== null && typeof value === "object" && "kind" in value
    ? parseRenderRecipe(value)
    : parseScene(value);
}
export function encodeShare(document: SavedDocument): ValidationResult<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(document));
  const encoded = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const fragment = `#scene=${encoded}`;
  return utf8ByteLength(fragment) > LIMITS.shareBytes
    ? failure(
        "share-too-large",
        isRecipe(document)
          ? "This recipe is too large for a share link. Export recipe JSON instead."
          : "This scene is too large for a share link. Export JSON instead.",
      )
    : { ok: true, value: fragment, diagnostics: [] };
}
export function decodeShare(fragment: string): ValidationResult<SavedDocument> {
  if (utf8ByteLength(fragment) > LIMITS.shareBytes)
    return failure(
      "share-too-large",
      "This shared link exceeds 8 KiB. Ask for the JSON file instead.",
    );
  const encoded = fragment.startsWith("#scene=") ? fragment.slice(7) : "";
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1)
    return failure(
      "invalid-share",
      "This shared scene is invalid. Your current work is unchanged.",
    );
  let source: string;
  try {
    const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    if (bytes.byteLength > LIMITS.inputBytes)
      return failure("input-too-large", "The decoded scene exceeds 64 KiB.");
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return failure(
      "invalid-share",
      "This shared scene could not be decoded. Your current work is unchanged.",
    );
  }
  return decodeDocument(source);
}
