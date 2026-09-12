import type { TextRun } from "../model/types.js";
import { estimatedTextWidth } from "../renderers/presentations/layout.js";

/** fit/v1 uses complete grapheme clusters, ASCII-space boundaries and CJK letter boundaries.
 * Other unspaced scripts/identifiers are kept intact; shrinking or failure stays explicit.
 * A candidate's fragments are chosen before measurement. Missing sizes on a second
 * pass remain explicitly estimated; no hidden measurement retry is performed.
 */
export function wrapRun(run: TextRun, width: number): readonly string[] {
  const graphemes = [
    ...new Intl.Segmenter("und", { granularity: "grapheme" }).segment(run.text),
  ].map((s) => s.segment);
  const cjk = (s: string) =>
    /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(s);
  const parts: string[] = [];
  let token = "";
  for (let i = 0; i < graphemes.length; i++) {
    const g = graphemes[i]!;
    token += g;
    if (g === " " || (cjk(g) && cjk(graphemes[i + 1] ?? ""))) {
      parts.push(token);
      token = "";
    }
  }
  if (token || !parts.length) parts.push(token);
  const lines: string[] = [];
  let current = "";
  for (const part of parts) {
    if (current && estimatedTextWidth(current + part, run.style) > width) {
      lines.push(current);
      current = part;
    } else current += part;
  }
  lines.push(current);
  return lines;
}
