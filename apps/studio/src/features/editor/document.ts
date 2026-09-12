import { defineScene, LIMITS } from "@servrox/console-fx";
import type { SceneV1, RenderRecipeV1 } from "@servrox/console-fx";
import { isRecipe, type SavedDocument } from "../persistence/documents";
import { rendererForLoadedScene } from "./renderer";

export const blankScene = () =>
  defineScene({
    schemaVersion: 1,
    label: "Untitled message",
    lines: [{ runs: [{ text: "Hello, developer." }] }],
  });
export const sameScene = (a: SceneV1, b: SceneV1) =>
  JSON.stringify(a) === JSON.stringify(b);
const orderedOptions = (options: RenderRecipeV1["options"]) =>
  JSON.stringify(options, (_key, value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
        )
      : value,
  );
const sameOptions = (
  a: RenderRecipeV1["options"],
  b: RenderRecipeV1["options"],
) => orderedOptions(a) === orderedOptions(b);
const sameSnapshot = (a: EditorSnapshot, b: EditorSnapshot) =>
  sameScene(a.scene, b.scene) && sameOptions(a.options, b.options);
export interface EditorSnapshot {
  readonly scene: SceneV1;
  readonly options: RenderRecipeV1["options"];
}
export interface EditorDocument extends EditorSnapshot {
  readonly past: readonly EditorSnapshot[];
  readonly future: readonly EditorSnapshot[];
  readonly revision: number;
  /** Conversion is sticky across undo/raw imports, preserving the legacy storage key. */
  readonly recipe: boolean;
}
export type DocumentAction =
  | { readonly type: "replace"; readonly scene: SceneV1 }
  | { readonly type: "settings"; readonly options: RenderRecipeV1["options"] }
  | { readonly type: "initialize" | "load"; readonly document: SavedDocument }
  | { readonly type: "undo" | "redo" | "reset" };

export const initialDocument = (document: SavedDocument): EditorDocument => ({
  ...snapshotOf(document),
  past: [],
  future: [],
  revision: 0,
  recipe: isRecipe(document),
});
function snapshotOf(document: SavedDocument): EditorSnapshot {
  return isRecipe(document)
    ? { scene: document.scene, options: document.options }
    : {
        scene: document,
        options: {
          target: "chromium",
          renderer: rendererForLoadedScene(document, "css"),
          motion: "reduce",
          unsupported: "error",
        },
      };
}
const currentSnapshot = ({
  scene,
  options,
}: EditorSnapshot): EditorSnapshot => ({ scene, options });
export const recipeOf = ({
  scene,
  options,
}: EditorSnapshot): RenderRecipeV1 => ({
  kind: "consoleFxRenderRecipe",
  recipeVersion: 1,
  scene,
  options,
});
export const savedDocument = (document: EditorDocument): SavedDocument =>
  document.recipe ? recipeOf(document) : document.scene;
export const sameDocument = (a: SavedDocument, b: SavedDocument) =>
  sameSnapshot(snapshotOf(a), snapshotOf(b));
function replace(
  state: EditorDocument,
  next: EditorSnapshot,
  recipe = state.recipe,
): EditorDocument {
  if (sameSnapshot(state, next) && recipe === state.recipe) return state;
  return {
    ...next,
    recipe,
    past: [...state.past, currentSnapshot(state)].slice(-LIMITS.history),
    future: [],
    revision: state.revision + 1,
  };
}
export function documentReducer(
  state: EditorDocument,
  action: DocumentAction,
): EditorDocument {
  switch (action.type) {
    case "initialize":
      return initialDocument(action.document);
    case "reset":
      return {
        ...initialDocument(blankScene()),
        recipe: state.recipe,
        revision: state.revision + 1,
      };
    case "replace":
      return replace(state, { scene: action.scene, options: state.options });
    case "load":
      return replace(
        state,
        snapshotOf(action.document),
        state.recipe || isRecipe(action.document),
      );
    case "settings":
      if (sameOptions(state.options, action.options)) return state;
      return replace(
        state,
        { scene: state.scene, options: action.options },
        true,
      );
    case "undo": {
      const snapshot = state.past.at(-1);
      return snapshot
        ? {
            ...snapshot,
            recipe: state.recipe,
            past: state.past.slice(0, -1),
            future: [currentSnapshot(state), ...state.future],
            revision: state.revision + 1,
          }
        : state;
    }
    case "redo": {
      const snapshot = state.future[0];
      return snapshot
        ? {
            ...snapshot,
            recipe: state.recipe,
            past: [...state.past, currentSnapshot(state)].slice(
              -LIMITS.history,
            ),
            future: state.future.slice(1),
            revision: state.revision + 1,
          }
        : state;
    }
  }
}
