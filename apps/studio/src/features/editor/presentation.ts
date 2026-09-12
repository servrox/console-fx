import { getPresentationDescriptors, parseScene } from "@servrox/console-fx";
import type { SceneV1 } from "@servrox/console-fx";

export function cardDescriptor(scene: SceneV1) {
  return getPresentationDescriptors().find(
    (d) => d.profile === scene.presentation?.profile,
  );
}

/** State colors come from the same metadata used by factories and the renderer. */
export function resolveCardStatus(scene: SceneV1): SceneV1 {
  const descriptor = cardDescriptor(scene);
  const status = descriptor?.status;
  const slot = descriptor?.slots.find((s) => s.id === status?.slot);
  if (!status || !slot) return scene;
  const key =
    status.source === "tone" &&
    scene.presentation?.profile === "requestTrace/v1"
      ? scene.presentation.tone!
      : scene.lines[slot.line]?.runs[slot.run]?.text;
  const palette =
    key && Object.hasOwn(status.palettes, key)
      ? status.palettes[key]
      : undefined;
  if (!palette) return scene;
  return {
    ...scene,
    lines: scene.lines.map((line, li) =>
      li !== slot.line
        ? line
        : {
            ...line,
            runs: line.runs.map((run, ri) =>
              ri !== slot.run
                ? run
                : { ...run, style: { ...run.style, color: palette.ink } },
            ),
          },
    ),
  };
}

export function editCardParameter(
  scene: SceneV1,
  name: string,
  value: unknown,
): unknown {
  const candidate = {
    ...scene,
    presentation: { ...scene.presentation, [name]: value },
  };
  const parsed = parseScene(candidate);
  return parsed.ok ? resolveCardStatus(parsed.value) : candidate;
}
