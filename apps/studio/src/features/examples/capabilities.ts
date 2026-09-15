import {
  getEffectDescriptors,
  getPresentationDescriptors,
  LIMITS,
} from "@servrox/console-fx";
import type {
  RenderRecipeV1,
  TextStyle,
  EffectKind,
} from "@servrox/console-fx";

export type CapabilityState =
  | { readonly status: "available" }
  | {
      readonly status: "experimental" | "unavailable";
      readonly reason: string;
    };
export type CapabilityId =
  | "content"
  | "typography"
  | "effects"
  | "motion"
  | "fitting"
  | "outputSizing"
  | "namedFields";
export type EditorPolicy = Readonly<Partial<Record<CapabilityId, boolean>>>;
export const EDITOR_POLICY: EditorPolicy = Object.freeze({});
const available: CapabilityState = Object.freeze({ status: "available" });
const unavailable = (reason: string): CapabilityState =>
  Object.freeze({ status: "unavailable", reason });
const experimental = (reason: string): CapabilityState =>
  Object.freeze({ status: "experimental", reason });

/** Support follows the current document. Discovery metadata is intentionally absent. */
export function resolveCapabilities(
  recipe: RenderRecipeV1,
  policy: EditorPolicy = EDITOR_POLICY,
) {
  const { scene, options } = recipe;
  const effects = scene.lines.flatMap((line) =>
    line.runs.flatMap((run) => run.effects),
  );
  const descriptors = getEffectDescriptors();
  const presentation = getPresentationDescriptors().find(
    (item) => item.profile === scene.presentation?.profile,
  );
  const cinematic = effects.some((effect) => effect.kind === "cinematicMetal");
  const svg = options.renderer === "svg" && options.target === "chromium";
  const motionRuns = scene.lines.map((line) =>
    line.runs.map(
      (run) =>
        !presentation &&
        !run.effects.some((effect) => effect.kind === "cinematicMetal"),
    ),
  );
  const anyMotionRun = motionRuns.some((line) => line.some(Boolean));
  const motionEffects = descriptors.filter(
    (item) =>
      item.motion === "decorative" &&
      item.renderers.includes(options.renderer ?? "text"),
  );
  const controls: Record<CapabilityId, CapabilityState> = {
    content: available,
    typography: available,
    effects: presentation
      ? unavailable("This card owns its effects. Detach it for free styling.")
      : available,
    motion:
      presentation || !anyMotionRun
        ? unavailable(
            presentation
              ? "Card presentations are static."
              : "Cinematic profiles are static.",
          )
        : svg && motionEffects.length
          ? experimental(
              "Finite SVG motion is experimental in DevTools. Play and export motion are separate choices.",
            )
          : unavailable(
              "Choose Chromium SVG to offer finite decorative motion.",
            ),
    fitting: svg
      ? available
      : unavailable(
          "Content fitting requires Chromium SVG. Existing settings are preserved until explicitly converted.",
        ),
    outputSizing: svg
      ? experimental(
          "Automatic width is experimental in DevTools. Readability at an unknown width is not guaranteed; the full caption is retained.",
        )
      : unavailable("Automatic output sizing requires Chromium SVG."),
    namedFields: presentation
      ? available
      : unavailable("This scene uses editable lines and text runs."),
  };
  for (const id of Object.keys(controls) as CapabilityId[]) {
    if (policy[id] === false && controls[id].status !== "unavailable")
      controls[id] = unavailable(
        "This control is disabled by editor policy. Saved choices are retained.",
      );
  }
  return Object.freeze({
    controls: Object.freeze(controls),
    mode: presentation
      ? ("card" as const)
      : cinematic
        ? ("cinematic" as const)
        : ("flow" as const),
    presentation,
    editableStyleKeys: Object.freeze(
      scene.lines.map((line, lineIndex) =>
        Object.freeze(
          line.runs.map((selected, runIndex) => {
            const keys = (): readonly (keyof TextStyle)[] => {
              if (controls.typography.status === "unavailable") return [];
              if (presentation) {
                const slot = presentation.slots.find(
                  (item) => item.line === lineIndex && item.run === runIndex,
                );
                return slot
                  ? (slot.editableStyleKeys ?? presentation.editableStyleKeys)
                  : [];
              }
              const cinematic = selected.effects.find(
                (effect) => effect.kind === "cinematicMetal",
              );
              if (cinematic)
                return cinematic.profile === "lightning-metal-v1" ||
                  cinematic.profile === "molten-gold-v1"
                  ? ["fontSize", "letterSpacing"]
                  : ["fontSize", "fontWeight", "letterSpacing"];
              return [
                "fontFamily",
                "fontSize",
                "fontWeight",
                "letterSpacing",
                "color",
              ];
            };
            return Object.freeze(keys());
          }),
        ),
      ),
    ),
    motionRuns: Object.freeze(
      motionRuns.map((line) =>
        Object.freeze(
          line.map(
            (supported) =>
              supported && controls.motion.status !== "unavailable",
          ),
        ),
      ),
    ),
    effectOptions: Object.freeze(
      scene.lines.map((line, lineIndex) =>
        Object.freeze(
          line.runs.map((run, runIndex) => {
            const occupied = new Set(
              run.effects.map(
                (effect) =>
                  descriptors.find((item) => item.kind === effect.kind)!.motion,
              ),
            );
            return Object.freeze(
              descriptors
                .filter((descriptor) => !occupied.has(descriptor.motion))
                .map((descriptor) => {
                  const state =
                    controls.effects.status === "unavailable"
                      ? controls.effects
                      : !descriptor.renderers.includes(
                            options.renderer ?? "text",
                          ) || options.target !== "chromium"
                        ? unavailable("Choose a supported Chromium renderer.")
                        : descriptor.kind === "cinematicMetal" &&
                            occupied.has("decorative")
                          ? unavailable(
                              "Remove motion before choosing a static cinematic profile.",
                            )
                          : descriptor.motion === "decorative"
                            ? motionRuns[lineIndex]![runIndex]
                              ? controls.motion
                              : unavailable("Cinematic profiles are static.")
                            : available;
                  return Object.freeze({ descriptor, state });
                }),
            );
          }),
        ),
      ),
    ),
    presentationParameters:
      presentation && policy.effects !== false
        ? available
        : unavailable(
            presentation
              ? "Presentation edits are disabled by editor policy. Saved choices are retained."
              : "This scene has no presentation parameters.",
          ),
    effectEditing: Object.freeze(
      Object.fromEntries(
        descriptors.map((descriptor) => [
          descriptor.kind,
          policy.effects === false ||
          (descriptor.motion === "decorative" && policy.motion === false)
            ? unavailable(
                "These effect edits are disabled by editor policy. Saved choices are retained.",
              )
            : available,
        ]),
      ) as Record<EffectKind, CapabilityState>,
    ),
    effectDescriptors: descriptors,
    limits: LIMITS,
    hasMotion: effects.some((effect) =>
      descriptors.some(
        (item) => item.kind === effect.kind && item.motion === "decorative",
      ),
    ),
  });
}
