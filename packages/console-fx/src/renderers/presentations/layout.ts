import type { Diagnostic, SceneV1, TextStyle } from "../../model/types.js";
import {
  presentationDescriptor,
  SEPARATOR_STYLE,
} from "../../presentations/catalog.js";

/** Conservative local-font estimate; never a claim of portable exact metrics. */
export function estimatedTextWidth(text: string, style: TextStyle): number {
  let units = 0,
    letters = 0;
  for (const c of text) {
    if (/\p{Mark}|\u200d/u.test(c)) continue;
    letters++;
    units += /[\u2e80-\uffff]|\p{Extended_Pictographic}/u.test(c)
      ? 1.2
      : style.fontFamily === "mono"
        ? 0.66
        : /\s/u.test(c)
          ? 0.36
          : /[ilI.,'!|]/u.test(c)
            ? 0.36
            : /[MWmw@%]/u.test(c)
              ? 1.05
              : 0.74;
  }
  return (
    units * style.fontSize +
    Math.max(0, letters - 1) * style.letterSpacing +
    (letters ? style.fontSize * 0.12 : 0)
  );
}

export function presentationDiagnostics(scene: SceneV1): Diagnostic[] {
  if (!scene.presentation) return [];
  const descriptor = presentationDescriptor(scene.presentation.profile)!;
  const diagnostics: Diagnostic[] = [];
  const error = (
    code: string,
    message: string,
    path: readonly (string | number)[],
  ) => diagnostics.push({ code, message, path, severity: "error" });
  if (
    scene.lines.length !== descriptor.rows.length ||
    scene.lines.some(
      (l, i) => l.align !== "left" || l.runs.length !== descriptor.rows[i],
    )
  ) {
    error(
      "unsupported-presentation-structure",
      "Restore the card's named slots or detach it to edit structure.",
      ["lines"],
    );
    return diagnostics;
  }
  for (const [li, line] of scene.lines.entries())
    for (const [ri, run] of line.runs.entries()) {
      const path = ["lines", li, "runs", ri];
      const slot = descriptor.slots.find((s) => s.line === li && s.run === ri);
      if (run.effects.length)
        error(
          "unsupported-combination",
          "Detach the card before adding effects or motion.",
          [...path, "effects"],
        );
      const status = descriptor.status;
      const statusKey =
        status?.source === "tone" &&
        scene.presentation.profile === "requestTrace/v1"
          ? scene.presentation.tone
          : run.text;
      const palette =
        status &&
        slot &&
        status.slot === slot.id &&
        Object.hasOwn(status.palettes, statusKey)
          ? status.palettes[statusKey]
          : undefined;
      const style = palette
        ? { ...slot!.style, color: palette.ink }
        : (slot?.style ?? SEPARATOR_STYLE);
      const editable = slot
        ? (slot.editableStyleKeys ?? descriptor.editableStyleKeys)
        : [];
      if (
        (Object.keys(style) as (keyof TextStyle)[]).some(
          (k) => !editable.includes(k) && run.style[k] !== style[k],
        )
      )
        error(
          "unsupported-presentation-style",
          "This card owns typography. Restore its style or detach it.",
          [...path, "style"],
        );
      if (!slot) {
        if (run.text !== "  ")
          error(
            "unsupported-presentation-structure",
            "Restore the card's two-space separators or detach it.",
            [...path, "text"],
          );
        continue;
      }
      if (slot.values && !slot.values.includes(run.text))
        error(
          "unsupported-presentation-content",
          "Choose a documented status word or use plain text.",
          [...path, "text"],
        );
      if (
        [...run.text].length > slot.maxCodePoints ||
        /[\n\u2028\u2029]/u.test(run.text) ||
        estimatedTextWidth(run.text, run.style) > slot.safeWidth
      )
        error(
          "presentation-overflow",
          `${slot.label} exceeds its rich layout. Shorten it or choose plain text.`,
          [...path, "text"],
        );
    }
  return diagnostics;
}
