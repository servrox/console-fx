import { array, defineScene, fail, record, text } from "../validation/index.js";
import {
  presentationDescriptor,
  SEPARATOR_STYLE,
} from "../presentations/catalog.js";
import type {
  CardPresetId,
  PresetPresentationInput,
  SceneV1,
  StatusTone,
} from "../model/types.js";

export interface CardOptions {
  readonly accent?: string;
  readonly detail?: "minimal" | "standard";
}
export interface BuildReceiptOptions extends CardOptions {
  readonly project: string;
  readonly outcome: "PASSED" | "FAILED" | "WARNING" | "UNKNOWN";
  readonly revision: string;
  readonly duration: string;
  readonly checks: string;
  readonly environment: string;
}
export interface ArtfulOptions extends CardOptions {
  readonly title?: string;
  readonly subtitle?: string;
  readonly eyebrow?: string;
  readonly footer?: string;
}
export interface RequestStage {
  readonly label: string;
  readonly duration: string;
}
export interface RequestTraceOptions extends CardOptions {
  readonly method: string;
  readonly path: string;
  readonly status: string;
  readonly total: string;
  readonly stages: readonly [RequestStage, RequestStage, RequestStage];
  readonly requestId: string;
  readonly tone: StatusTone;
}
export interface ServiceReadyOptions extends CardOptions {
  readonly service: string;
  readonly state: "READY" | "DEGRADED" | "OFFLINE" | "UNKNOWN";
  readonly endpoint: string;
  readonly environment: string;
  readonly runtime: string;
  readonly region: string;
}
export interface CommandCardOptions extends CardOptions {
  readonly step: string;
  readonly title: string;
  readonly command: string;
  readonly instruction: string;
  readonly safety: string;
}
export interface ReleaseBulletinOptions extends CardOptions {
  readonly product: string;
  readonly version: string;
  readonly headline: string;
  readonly changes: readonly [string, string];
  readonly channel: string;
}
function options(input: unknown, keys: readonly string[]) {
  return record(input, [...keys, "accent", "detail"], ["options"]);
}
function value(input: Record<string, unknown>, key: string) {
  return text(input[key], ["options", key]);
}
function makeCard(
  id: CardPresetId,
  content: readonly string[],
  input: Record<string, unknown>,
): SceneV1 {
  const descriptor = presentationDescriptor(`${id}/v1`)!;
  const lines: {
    align: "left";
    runs: { text: string; style: typeof SEPARATOR_STYLE; effects: [] }[];
  }[] = descriptor.rows.map((count) => ({
    align: "left",
    runs: Array.from({ length: count }, () => ({
      text: "  ",
      style: SEPARATOR_STYLE,
      effects: [],
    })),
  }));
  descriptor.slots.forEach((slot, index) => {
    lines[slot.line]!.runs[slot.run] = {
      text: content[index]!,
      style: slot.style,
      effects: [],
    };
  });
  if (descriptor.status) {
    const slot = descriptor.slots.find(
      (s) => s.id === descriptor.status!.slot,
    )!;
    const run = lines[slot.line]!.runs[slot.run]!;
    const key =
      descriptor.status.source === "tone" ? String(input.tone) : run.text;
    const palette = descriptor.status.palettes[key];
    if (palette) run.style = { ...run.style, color: palette.ink };
  }
  const presentation = {
    kind: "presetCard",
    profile: descriptor.profile,
    accent: input.accent,
    detail: input.detail,
    ...(id === "requestTrace" ? { tone: input.tone } : {}),
  } as PresetPresentationInput;
  return defineScene({
    schemaVersion: 1,
    label: descriptor.name,
    surface: {
      width: 720,
      height: 240,
      background: descriptor.background,
      padding: 0,
      borderRadius: 12,
    },
    lines,
    motion: { durationMs: 5000, finish: "freeze" },
    presentation,
  });
}
export function buildReceipt(input: BuildReceiptOptions): SceneV1 {
  const o = options(input, [
    "project",
    "outcome",
    "revision",
    "duration",
    "checks",
    "environment",
  ]);
  const outcome = value(o, "outcome");
  if (!["PASSED", "FAILED", "WARNING", "UNKNOWN"].includes(outcome))
    fail("invalid-enum", "Choose a documented build outcome.", [
      "options",
      "outcome",
    ]);
  return makeCard(
    "buildReceipt",
    [
      "BUILD / RECEIPT",
      value(o, "project"),
      outcome,
      "REVISION",
      "DURATION",
      "CHECKS",
      value(o, "revision"),
      value(o, "duration"),
      value(o, "checks"),
      `ENVIRONMENT  ${value(o, "environment")}`,
      "COMPLETED SNAPSHOT",
    ],
    o,
  );
}
export function letterpress(input: ArtfulOptions = {}): SceneV1 {
  const o = options(input, ["title", "subtitle", "eyebrow", "footer"]);
  return makeCard(
    "letterpress",
    [
      text(o.eyebrow ?? "STUDIO / CONSOLE EDITION", ["options", "eyebrow"]),
      text(o.title ?? "Make it matter.", ["options", "title"]),
      text(o.subtitle ?? "Thoughtful tools. Everyday work.", [
        "options",
        "subtitle",
      ]),
      text(o.footer ?? "LESS, BUT CONSIDERED.", ["options", "footer"]),
    ],
    o,
  );
}

export function requestTrace(input: RequestTraceOptions): SceneV1 {
  const o = options(input, [
    "method",
    "path",
    "status",
    "total",
    "stages",
    "requestId",
    "tone",
  ]);
  const stages = array(o.stages, 3, ["options", "stages"]);
  if (stages.length !== 3)
    fail("invalid-stages", "Supply exactly three request stages.", [
      "options",
      "stages",
    ]);
  const resolved = stages.map((stage, index) => {
    const path = ["options", "stages", index];
    const s = record(stage, ["label", "duration"], path);
    return {
      label: text(s.label, [...path, "label"]),
      duration: text(s.duration, [...path, "duration"]),
    };
  });
  if (!["success", "warning", "error", "neutral"].includes(value(o, "tone")))
    fail("invalid-enum", "Supply an explicit request tone.", [
      "options",
      "tone",
    ]);
  return makeCard(
    "requestTrace",
    [
      "REQUEST / SNAPSHOT",
      value(o, "method"),
      value(o, "path"),
      value(o, "status"),
      value(o, "total"),
      ...resolved.map((s) => s.label),
      ...resolved.map((s) => s.duration),
      `ID  ${value(o, "requestId")}`,
      "ONE REQUEST / NO LIVE CONNECTION",
    ],
    o,
  );
}
export function serviceReady(input: ServiceReadyOptions): SceneV1 {
  const o = options(input, [
    "service",
    "state",
    "endpoint",
    "environment",
    "runtime",
    "region",
  ]);
  const state = value(o, "state");
  if (!["READY", "DEGRADED", "OFFLINE", "UNKNOWN"].includes(state))
    fail("invalid-enum", "Choose a documented service state.", [
      "options",
      "state",
    ]);
  return makeCard(
    "serviceReady",
    [
      "SERVICE / PASSPORT",
      value(o, "service"),
      state,
      value(o, "endpoint"),
      "ENVIRONMENT",
      "RUNTIME",
      "REGION",
      value(o, "environment"),
      value(o, "runtime"),
      value(o, "region"),
      "STARTUP SNAPSHOT / VALUES PROVIDED BY YOUR APP",
    ],
    o,
  );
}
export function commandCard(input: CommandCardOptions): SceneV1 {
  const o = options(input, [
    "step",
    "title",
    "command",
    "instruction",
    "safety",
  ]);
  return makeCard(
    "commandCard",
    [
      "NEXT / ACTION",
      value(o, "step"),
      value(o, "title"),
      value(o, "instruction"),
      value(o, "command"),
      value(o, "safety"),
    ],
    o,
  );
}
export function releaseBulletin(input: ReleaseBulletinOptions): SceneV1 {
  const o = options(input, [
    "product",
    "version",
    "headline",
    "changes",
    "channel",
  ]);
  const changes = array(o.changes, 2, ["options", "changes"]);
  if (changes.length !== 2)
    fail("invalid-highlights", "Supply exactly two release highlights.", [
      "options",
      "changes",
    ]);
  return makeCard(
    "releaseBulletin",
    [
      `${value(o, "product")} / RELEASE NOTES`,
      value(o, "version"),
      value(o, "headline"),
      ...changes.map((c, i) => text(c, ["options", "changes", i])),
      value(o, "channel"),
      "TWO CHANGES. ONE CLEAR MESSAGE.",
    ],
    o,
  );
}

function artful(
  id: CardPresetId,
  defaults: readonly [string, string, string, string],
  input: ArtfulOptions,
): SceneV1 {
  const o = options(input, ["title", "subtitle", "eyebrow", "footer"]);
  const content = ["eyebrow", "title", "subtitle", "footer"].map((key, i) =>
    text(o[key] ?? defaults[i], ["options", key]),
  );
  if (id === "signalHalftone") {
    const title = content[1]!.split("\n");
    if (title.length !== 2)
      fail(
        "invalid-title",
        "Signal Halftone uses an explicit two-line title.",
        ["options", "title"],
      );
    content.splice(1, 1, ...title);
  }
  return makeCard(id, content, o);
}
export function blueprint(input: ArtfulOptions = {}): SceneV1 {
  return artful(
    "blueprint",
    [
      "ENGINEERING / EDITION 01",
      "BUILT TO LAST",
      "An interface worth understanding.",
      "PRECISION OVER NOISE",
    ],
    input,
  );
}
export function contourMap(input: ArtfulOptions = {}): SceneV1 {
  return artful(
    "contourMap",
    [
      "FIELD NOTES / 007",
      "FIND YOUR SIGNAL",
      "Less noise. More direction.",
      "CONTOUR STUDY",
    ],
    input,
  );
}
export function signalHalftone(input: ArtfulOptions = {}): SceneV1 {
  return artful(
    "signalHalftone",
    [
      "TWO INKS / ONE IDEA",
      "MAKE SOME\nSIGNAL",
      "Small tools. Clear intent.",
      "PRINT STUDY 04",
    ],
    input,
  );
}
export function orbital(input: ArtfulOptions = {}): SceneV1 {
  return artful(
    "orbital",
    [
      "MISSION / CONSOLE 01",
      "STAY CURIOUS",
      "Build something worth discovering.",
      "IDEAS IN ORBIT",
    ],
    input,
  );
}

/** Authored synthetic data for catalog demonstrations; never current system facts. */
export function cardExample(id: CardPresetId): SceneV1 {
  switch (id) {
    case "buildReceipt":
      return buildReceipt({
        project: "atlas-web",
        outcome: "PASSED",
        revision: "a1b2c3d",
        duration: "2.34 s",
        checks: "48 / 48",
        environment: "preview",
      });
    case "requestTrace":
      return requestTrace({
        method: "GET",
        path: "/api/orders",
        status: "200 OK",
        total: "148 ms",
        stages: [
          { label: "AUTH", duration: "12 ms" },
          { label: "QUERY", duration: "106 ms" },
          { label: "SERIALIZE", duration: "30 ms" },
        ],
        requestId: "req_demo_0042",
        tone: "success",
      });
    case "serviceReady":
      return serviceReady({
        service: "Atlas API",
        state: "READY",
        endpoint: "http://localhost:3000",
        environment: "development",
        runtime: "Node 24",
        region: "local",
      });
    case "commandCard":
      return commandCard({
        step: "01",
        title: "Run the test suite",
        command: "pnpm test",
        safety: "Command shown, never executed.",
        instruction: "Run from the project root.",
      });
    case "releaseBulletin":
      return releaseBulletin({
        product: "ATLAS",
        version: "v2.4.0",
        headline: "A quieter kind of fast.",
        changes: ["Smaller payloads.", "Clearer diagnostics."],
        channel: "Preview channel",
      });
    default:
      return { blueprint, contourMap, letterpress, signalHalftone, orbital }[
        id
      ]();
  }
}
