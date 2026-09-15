import type { TextRun } from "../model/types.js";
import { cinematicEffect } from "../renderers/cinematic/layout.js";

export type FlowRun = TextRun & { readonly sourceRun: number };
type Token = readonly FlowRun[];
const cjk = (text: string) =>
  /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(text);

function append(
  left: readonly FlowRun[],
  right: readonly FlowRun[],
): FlowRun[] {
  const result = [...left];
  for (const run of right) {
    const last = result.at(-1);
    if (last?.sourceRun === run.sourceRun)
      result[result.length - 1] = { ...last, text: last.text + run.text };
    else result.push(run);
  }
  return result;
}

/** Break at graphemes, ASCII spaces and CJK letter boundaries.
 * Tokens may cross style/run boundaries: styling cannot make an ID breakable.
 */
export function wrapTokens(
  runs: readonly FlowRun[],
  paragraphGraphemes = false,
): readonly Token[] {
  // Without grapheme boundaries, retain the complete styled paragraph.
  if (typeof Intl.Segmenter !== "function") return [runs];
  const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });
  // V2 also protects clusters spanning styled runs. V1 retains its recorded layout.
  const paragraph = paragraphGraphemes
    ? segmenter.segment(runs.map((run) => run.text).join(""))
    : null;
  const pieces = runs.flatMap((run) =>
    (cinematicEffect(run)
      ? [run.text]
      : [...segmenter.segment(run.text)].map((part) => part.segment)
    ).map((text) => ({ ...run, text })),
  );
  const tokens: FlowRun[][] = [];
  let token: FlowRun[] = [];
  let offset = 0;
  for (const [i, piece] of pieces.entries()) {
    token = append(token, [piece]);
    offset += piece.text.length;
    const next = pieces[i + 1]?.text ?? "";
    if (
      (!paragraph || paragraph.containing(offset)?.index === offset) &&
      !/^[\u2060\ufeff]/u.test(next) &&
      (piece.text.endsWith(" ") || (cjk(piece.text) && cjk(next)))
    ) {
      tokens.push(token);
      token = [];
    }
  }
  if (token.length || !tokens.length) tokens.push(token);
  return tokens;
}

export function wrapTokensToRows(
  tokens: readonly Token[],
  width: number,
  occupiedWidth: (runs: readonly FlowRun[]) => number,
): FlowRun[][] {
  const rows: FlowRun[][] = [];
  let row: FlowRun[] = [];
  for (const token of tokens) {
    const candidate = append(row, token);
    if (occupiedWidth(candidate) > width && row.length) {
      rows.push(row);
      row = [...token];
    } else row = candidate;
  }
  rows.push(row);
  return rows;
}

/** Optional preflight lookahead. The caller stops this iterator at its byte/work budget.
 * Actual line fragments are shaped whole, never inferred from summed glyph advances.
 */
export function* wrappingAlternatives(tokens: readonly Token[]) {
  for (let start = 0; start < tokens.length; start++) {
    let row: FlowRun[] = [];
    for (let end = start; end < tokens.length; end++) {
      row = append(row, tokens[end]!);
      yield* row.filter((run) => !cinematicEffect(run));
    }
  }
}
