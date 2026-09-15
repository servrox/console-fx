import { defineScene, LIMITS } from "@servrox/console-fx";
import type { SceneV1 } from "@servrox/console-fx";

export const blankScene = () =>
  defineScene({
    schemaVersion: 1,
    label: "Untitled message",
    lines: [{ runs: [{ text: "Hello, developer." }] }],
  });
export const sameScene = (a: SceneV1, b: SceneV1) =>
  JSON.stringify(a) === JSON.stringify(b);
export interface EditorDocument {
  readonly scene: SceneV1;
  readonly past: readonly SceneV1[];
  readonly future: readonly SceneV1[];
  readonly revision: number;
}
export type DocumentAction =
  | { readonly type: "replace"; readonly scene: SceneV1 }
  | { readonly type: "initialize"; readonly scene: SceneV1 }
  | { readonly type: "undo" | "redo" | "reset" };

export const initialDocument = (scene: SceneV1): EditorDocument => ({
  scene,
  past: [],
  future: [],
  revision: 0,
});
export function documentReducer(
  state: EditorDocument,
  action: DocumentAction,
): EditorDocument {
  switch (action.type) {
    case "initialize":
      return initialDocument(action.scene);
    case "reset":
      return { ...initialDocument(blankScene()), revision: state.revision + 1 };
    case "replace":
      if (sameScene(state.scene, action.scene)) return state;
      return {
        scene: action.scene,
        past: [...state.past, state.scene].slice(-LIMITS.history),
        future: [],
        revision: state.revision + 1,
      };
    case "undo": {
      const scene = state.past.at(-1);
      return scene
        ? {
            scene,
            past: state.past.slice(0, -1),
            future: [state.scene, ...state.future],
            revision: state.revision + 1,
          }
        : state;
    }
    case "redo": {
      const scene = state.future[0];
      return scene
        ? {
            scene,
            past: [...state.past, state.scene].slice(-LIMITS.history),
            future: state.future.slice(1),
            revision: state.revision + 1,
          }
        : state;
    }
  }
}
