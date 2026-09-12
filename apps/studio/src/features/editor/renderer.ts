import { getEffectDescriptors } from "@servrox/console-fx";
import type { Renderer, SceneV1 } from "@servrox/console-fx";

const descriptors = getEffectDescriptors();

/** Apply on document loads/history navigation, never on ordinary text edits. */
export function rendererForLoadedScene(
  scene: SceneV1,
  current: Renderer,
): Renderer {
  return scene.lines.some((line) =>
    line.runs.some((run) =>
      run.effects.some((effect) => {
        const descriptor = descriptors.find(
          (item) => item.kind === effect.kind,
        )!;
        return (
          descriptor.renderers.length === 1 && descriptor.renderers[0] === "svg"
        );
      }),
    ),
  )
    ? "svg"
    : current;
}
