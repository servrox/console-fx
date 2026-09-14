import { deepFreeze } from "../model/limits.js";
import type {
  CardPresetId,
  PresentationDescriptor,
  PresentationSlot,
  PresentationStatus,
  TextStyle,
} from "../model/types.js";

export type RuntimeSlot = PresentationSlot;
export type RuntimePresentation = Omit<
  PresentationDescriptor,
  "slots" | "parameters" | "accentGeometry" | "name" | "renderers"
> & { readonly slots: readonly RuntimeSlot[] };

// Most closed slot IDs have the same human label; keep only the exceptions.
const specialLabels: Readonly<Record<string, string>> = {
  change0: "First highlight",
  change1: "Second highlight",
  title2: "Title, second line",
};
function slotLabel(id: string): string {
  if (/^[sd][0-2]$/.test(id))
    return `Stage ${Number(id[1]) + 1} ${id[0] === "s" ? "label" : "duration"}`;
  return (
    specialLabels[id] ??
    id.replace(/^[a-z]|[A-Z]/g, (letter, offset: number) =>
      offset ? ` ${letter.toLowerCase()}` : letter.toUpperCase(),
    )
  );
}

// Repeated typography defaults are owned here; expanded public descriptors stay unchanged.
function slot(
  id: string,
  line: number,
  run: number,
  color: string,
  fontSize: number,
  x: number,
  y: number,
  safeWidth: number,
  options: Partial<
    Pick<TextStyle, "fontWeight" | "fontFamily" | "letterSpacing">
  > &
    Partial<
      Pick<
        PresentationSlot,
        "anchor" | "maxCodePoints" | "values" | "editableStyleKeys"
      >
    > = {},
): RuntimeSlot {
  const {
    fontWeight = 400,
    fontFamily = "mono",
    letterSpacing = 0,
    anchor = "start",
    maxCodePoints = 80,
    ...extra
  } = options;
  return {
    id,
    line,
    run,
    label: slotLabel(id),
    style: { color, fontSize, fontWeight, fontFamily, letterSpacing },
    x,
    y,
    anchor,
    safeWidth,
    maxCodePoints,
    ...extra,
  };
}

// Owned slot/typography metadata. Decorative geometry stays in the SVG renderer.
const definitions: readonly Omit<
  RuntimePresentation,
  "status" | "profile" | "editableStyleKeys"
>[] = [
  {
    id: "buildReceipt",
    group: "Useful",
    accent: "#32816b",
    background: "#111c19",
    rows: [1, 3, 5, 5, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#65716d", 11, 36, 36, 475, {
        letterSpacing: 2,
        fontWeight: 700,
      }),
      slot("project", 1, 0, "#1c2a26", 32, 36, 81, 480, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("outcome", 1, 2, "#156751", 12, 568, 61, 88, {
        values: ["PASSED", "FAILED", "WARNING", "UNKNOWN"],
        fontWeight: 700,
      }),
      slot("revisionLabel", 2, 0, "#63736c", 11, 36, 132, 170),
      slot("durationLabel", 2, 2, "#63736c", 11, 237, 132, 170),
      slot("checksLabel", 2, 4, "#63736c", 11, 438, 132, 200),
      slot("revision", 3, 0, "#263831", 21, 36, 161, 170, {
        fontWeight: 700,
      }),
      slot("duration", 3, 2, "#263831", 21, 237, 161, 170, {
        fontWeight: 700,
      }),
      slot("checks", 3, 4, "#263831", 21, 438, 161, 200, { fontWeight: 700 }),
      slot("environment", 4, 0, "#50675e", 11, 36, 214, 320),
      slot("footer", 5, 0, "#50675e", 10, 654, 214, 255, { anchor: "end" }),
    ],
  },
  {
    id: "requestTrace",
    group: "Useful",
    accent: "#66c6c7",
    background: "#141e26",
    rows: [1, 7, 5, 5, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#8a9ca7", 10, 32, 31, 480, { letterSpacing: 2 }),
      slot("method", 1, 0, "#58d4d5", 25, 32, 72, 54, { fontWeight: 700 }),
      slot("path", 1, 2, "#edf3f6", 25, 98, 72, 370, { fontWeight: 700 }),
      slot("status", 1, 4, "#b8e1cd", 11, 648, 32, 92, {
        anchor: "end",
        fontWeight: 700,
      }),
      slot("total", 1, 6, "#edf3f6", 27, 656, 79, 170, {
        anchor: "end",
        fontWeight: 700,
      }),
      slot("s0", 2, 0, "#aebfc7", 10, 58, 161, 185, { fontWeight: 700 }),
      slot("s1", 2, 2, "#aebfc7", 10, 281, 161, 205, { fontWeight: 700 }),
      slot("s2", 2, 4, "#aebfc7", 10, 528, 161, 155, { fontWeight: 700 }),
      slot("d0", 3, 0, "#dce8ee", 20, 58, 187, 185),
      slot("d1", 3, 2, "#dce8ee", 20, 281, 187, 205),
      slot("d2", 3, 4, "#dce8ee", 20, 528, 187, 155),
      slot("requestId", 4, 0, "#90a2af", 10, 32, 221, 340),
      slot("footer", 5, 0, "#90a2af", 9, 686, 221, 300, { anchor: "end" }),
    ],
  },
  {
    id: "serviceReady",
    group: "Useful",
    accent: "#72cbd0",
    background: "#1a222a",
    rows: [1, 3, 1, 5, 5, 1],
    slots: [
      slot("eyebrow", 0, 0, "#8a9eaa", 10, 126, 37, 380, {
        letterSpacing: 2,
      }),
      slot("service", 1, 0, "#f0f5f5", 33, 126, 80, 400, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("state", 1, 2, "#9de9c8", 11, 635, 47, 60, {
        values: ["READY", "DEGRADED", "OFFLINE", "UNKNOWN"],
        anchor: "end",
        fontWeight: 700,
      }),
      slot("endpoint", 2, 0, "#5fced1", 16, 126, 114, 550),
      slot("envLabel", 3, 0, "#8a9eaa", 10, 32, 168, 210),
      slot("runtimeLabel", 3, 2, "#8a9eaa", 10, 292, 168, 180),
      slot("regionLabel", 3, 4, "#8a9eaa", 10, 532, 168, 154),
      slot("environment", 4, 0, "#e2eaed", 17, 32, 192, 220),
      slot("runtime", 4, 2, "#e2eaed", 17, 292, 192, 180),
      slot("region", 4, 4, "#e2eaed", 17, 532, 192, 154),
      slot("footer", 5, 0, "#8a9eaa", 9, 32, 223, 650, { letterSpacing: 1 }),
    ],
  },
  {
    id: "commandCard",
    group: "Useful",
    accent: "#67c3c8",
    background: "#1c242a",
    rows: [1, 3, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#8fa1a8", 10, 32, 33, 656, { letterSpacing: 2 }),
      slot("step", 1, 0, "#657780", 38, 44, 91, 56, { fontWeight: 700 }),
      slot("title", 1, 2, "#eff3f4", 29, 128, 76, 548, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("instruction", 2, 0, "#aab9c1", 14, 128, 103, 548, {
        fontFamily: "sans",
      }),
      slot("command", 3, 0, "#dce7e9", 27, 73, 167, 530, {
        maxCodePoints: 120,
        fontWeight: 700,
      }),
      slot("safety", 4, 0, "#95a8b1", 11, 32, 218, 656),
    ],
  },
  {
    id: "releaseBulletin",
    group: "Useful",
    accent: "#3c8574",
    background: "#eeeee4",
    rows: [3, 1, 1, 1, 3],
    slots: [
      slot("eyebrow", 0, 0, "#64665b", 10, 32, 33, 500, { letterSpacing: 2 }),
      slot("version", 0, 2, "#3b665d", 12, 667, 35, 72, {
        anchor: "end",
        fontWeight: 700,
      }),
      slot("headline", 1, 0, "#26302b", 36, 32, 103, 656, {
        fontFamily: "serif",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("change0", 2, 0, "#34443b", 17, 49, 157, 270, {
        fontFamily: "sans",
      }),
      slot("change1", 3, 0, "#34443b", 17, 349, 157, 325, {
        fontFamily: "sans",
      }),
      slot("channel", 4, 0, "#587068", 12, 32, 214, 300),
      slot("footer", 4, 2, "#65736b", 10, 688, 214, 340, { anchor: "end" }),
    ],
  },
  {
    id: "blueprint",
    group: "Artful",
    accent: "#82c6cc",
    background: "#132b35",
    rows: [1, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#a5c1cc", 10, 31, 30, 656, {
        letterSpacing: 1.5,
      }),
      slot("title", 1, 0, "#e0eff2", 37, 247, 107, 430, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("subtitle", 2, 0, "#9bbac6", 14, 249, 139, 430, {
        fontFamily: "sans",
      }),
      slot("footer", 3, 0, "#87abb9", 10, 249, 207, 430, {
        letterSpacing: 2,
      }),
    ],
  },
  {
    id: "contourMap",
    group: "Artful",
    accent: "#69b7a3",
    background: "#162923",
    rows: [1, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#96aca8", 10, 32, 32, 420, { letterSpacing: 2 }),
      slot("title", 1, 0, "#edf1ea", 32, 32, 115, 430, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("subtitle", 2, 0, "#a6bcb6", 16, 33, 148, 430, {
        fontFamily: "sans",
      }),
      slot("footer", 3, 0, "#86aaa2", 10, 32, 215, 430, { letterSpacing: 2 }),
    ],
  },
  {
    id: "letterpress",
    group: "Artful",
    accent: "#43877b",
    background: "#e8e7dc",
    rows: [1, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#78786f", 10, 36, 34, 640, { letterSpacing: 2 }),
      slot("title", 1, 0, "#464842", 58, 35, 126, 650, {
        fontFamily: "serif",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("subtitle", 2, 0, "#74776c", 16, 37, 163, 640, {
        fontFamily: "sans",
      }),
      slot("footer", 3, 0, "#70776e", 10, 37, 216, 640, { letterSpacing: 2 }),
    ],
  },
  {
    id: "signalHalftone",
    group: "Artful",
    accent: "#ae563b",
    background: "#ede8d8",
    rows: [1, 1, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#777566", 10, 273, 34, 410, {
        letterSpacing: 1.5,
      }),
      slot("title", 1, 0, "#293931", 41, 271, 106, 410, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("title2", 2, 0, "#293931", 41, 271, 151, 410, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("subtitle", 3, 0, "#626b5d", 14, 274, 183, 410, {
        fontFamily: "sans",
      }),
      slot("footer", 4, 0, "#737566", 9, 274, 218, 410, { letterSpacing: 2 }),
    ],
  },
  {
    id: "orbital",
    group: "Artful",
    accent: "#68c9c7",
    background: "#141e28",
    rows: [1, 1, 1, 1],
    slots: [
      slot("eyebrow", 0, 0, "#92a1aa", 10, 264, 34, 420, {
        letterSpacing: 1.7,
      }),
      slot("title", 1, 0, "#edf3f3", 36, 262, 111, 426, {
        fontFamily: "sans",
        maxCodePoints: 48,
        fontWeight: 700,
      }),
      slot("subtitle", 2, 0, "#a5b7c1", 14, 264, 146, 420, {
        fontFamily: "sans",
      }),
      slot("footer", 3, 0, "#90aab3", 10, 264, 215, 420, {
        letterSpacing: 2,
      }),
    ],
  },
];
// Status markers and text normally share ink; preserve explicit exceptions.
function palette(
  background: string,
  stroke: string,
  marker: string,
  ink = marker,
) {
  return { background, stroke, marker, ink };
}
const statuses: Partial<Record<CardPresetId, PresentationStatus>> = {
  buildReceipt: {
    slot: "outcome",
    source: "text",
    palettes: {
      PASSED: palette("#d9e9db", "#a9c7b2", "#27775c", "#156751"),
      FAILED: palette("#f6dedd", "#d8aaa8", "#913d38"),
      WARNING: palette("#f1e7c5", "#cfbc82", "#806018"),
      UNKNOWN: palette("#dfe4e3", "#aab7b3", "#4b605a"),
    },
  },
  serviceReady: {
    slot: "state",
    source: "text",
    palettes: {
      READY: palette("#213a34", "none", "#83cca7", "#9de9c8"),
      DEGRADED: palette("#463e28", "none", "#edcd84"),
      OFFLINE: palette("#462d30", "none", "#f1acaa"),
      UNKNOWN: palette("#30404a", "none", "#cad6de"),
    },
  },
  requestTrace: {
    slot: "status",
    source: "tone",
    palettes: {
      success: palette("#233c34", "none", "#b8e1cd"),
      warning: palette("#463e28", "none", "#edcd84"),
      error: palette("#462d30", "none", "#f1acaa"),
      neutral: palette("#30404a", "none", "#cad6de"),
    },
  },
};
const runtime: readonly RuntimePresentation[] = deepFreeze(
  definitions.map((d) => {
    const status = statuses[d.id];
    return {
      ...d,
      profile: `${d.id}/v1` as const,
      editableStyleKeys: ["color"],
      slots: d.slots.map((s) =>
        status?.slot === s.id ? { ...s, editableStyleKeys: [] } : s,
      ),
      ...(status ? { status } : {}),
    };
  }),
);
const accents: Record<CardPresetId, readonly string[]> = {
  buildReceipt: ["Receipt spine"],
  requestTrace: ["Ordered stage nodes"],
  serviceReady: ["Passport glyph"],
  commandCard: ["Command chevron"],
  releaseBulletin: ["Editorial underline"],
  blueprint: ["Cube edges"],
  contourMap: ["Highlighted contour"],
  letterpress: ["Paper underline"],
  signalHalftone: ["Halftone ink"],
  orbital: ["Orbit highlight"],
};
const names: Readonly<Record<CardPresetId, string>> = {
  buildReceipt: "Build Receipt",
  requestTrace: "Request Trace",
  serviceReady: "Service Passport",
  commandCard: "Command Card",
  releaseBulletin: "Release Bulletin",
  blueprint: "Blueprint",
  contourMap: "Contour Map",
  letterpress: "Letterpress",
  signalHalftone: "Signal Halftone",
  orbital: "Orbital",
};
let descriptors: readonly PresentationDescriptor[] | undefined;
export function getPresentationDescriptors(): readonly PresentationDescriptor[] {
  return (descriptors ??= deepFreeze(
    runtime.map((d) => {
      const status = d.status;
      return {
        ...d,
        name: names[d.id],
        renderers: ["svg", "text"],
        accentGeometry: accents[d.id],
        slots: d.slots,
        ...(status ? { status } : {}),
        parameters: {
          accent: { type: "color" as const, default: d.accent },
          detail: {
            type: "enum" as const,
            default: "standard",
            values: ["minimal", "standard"],
          },
          ...(d.id === "requestTrace"
            ? {
                tone: {
                  type: "enum" as const,
                  default: "neutral",
                  values: ["success", "warning", "error", "neutral"],
                },
              }
            : {}),
        },
      };
    }),
  ));
}
export const SEPARATOR_STYLE: TextStyle = deepFreeze({
  color: "#000000",
  fontSize: 8,
  fontWeight: 400,
  fontFamily: "mono",
  letterSpacing: 0,
});
export function presentationDescriptor(
  profile: string,
): RuntimePresentation | undefined {
  return runtime.find((d) => d.profile === profile);
}
