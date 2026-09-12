import type {
  CardPresetId,
  PresentationDescriptor,
  PresentationSlot,
} from "../model/types.js";
import type { LayoutRequest } from "../model/layout.js";

export type CardFitSlot = Omit<PresentationSlot, "anchor"> & {
  readonly anchor: "start" | "middle" | "end";
  readonly safeTop?: number;
};
export interface CardFitLayout {
  readonly profile: string;
  readonly compact: boolean;
  readonly width: number;
  readonly height: number;
  readonly rows: number;
  readonly slots: readonly CardFitSlot[];
}
type Geometry = readonly [
  x: number,
  y: number,
  fontSize: number,
  safeWidth: number,
  anchor?: "start" | "middle" | "end",
  safeTop?: number,
];
// Original, approved 360 px geometry: docs/mockups/preset-compact-v1.
// Each array follows its immutable descriptor slot order, checked against every reference.
// Runtime owns these versioned algorithms; it never loads a reference file.
const compact: Readonly<
  Record<
    CardPresetId,
    {
      readonly height: number;
      readonly below: number;
      readonly rows: number;
      readonly slots: readonly Geometry[];
    }
  >
> = {
  buildReceipt: {
    height: 304,
    below: 620,
    rows: 7,
    slots: [
      [24, 34, 12, 312], // eyebrow
      [24, 79, 28, 206], // project
      [281, 75, 12, 42, "middle"], // outcome; reserve the status mark
      [24, 131, 12, 106], // revisionLabel
      [24, 165, 12, 106], // durationLabel
      [24, 199, 12, 106], // checksLabel
      [158, 131, 16, 177], // revision
      [158, 165, 16, 177], // duration
      [158, 199, 16, 177], // checks
      [24, 245, 12, 312], // environment
      [24, 279, 12, 312], // footer
    ],
  },
  requestTrace: {
    height: 322,
    below: 640,
    rows: 7,
    slots: [
      [24, 34, 12, 196], // eyebrow
      [24, 77, 16, 44], // method
      [69, 77, 16, 176], // path
      [290, 34, 12, 80, "middle"], // status
      [336, 77, 16, 90, "end"], // total
      [53, 128, 12, 180], // s0
      [53, 172, 12, 180], // s1
      [53, 216, 12, 180], // s2
      [324, 128, 14, 86, "end"], // d0
      [324, 172, 14, 86, "end"], // d1
      [324, 216, 14, 86, "end"], // d2
      [24, 268, 12, 312], // requestId
      [24, 302, 12, 312], // footer
    ],
  },
  serviceReady: {
    height: 344,
    below: 650,
    rows: 7,
    slots: [
      [24, 34, 12, 204], // eyebrow
      [24, 79, 28, 312], // service
      [295, 34, 12, 58, "middle"], // state clear of the status marker
      [24, 115, 16, 312], // endpoint
      [24, 167, 12, 114], // envLabel clear of the column rule
      [24, 207, 12, 114], // runtimeLabel
      [24, 247, 12, 114], // regionLabel
      [160, 167, 14, 176], // environment
      [160, 207, 14, 176], // runtime
      [160, 247, 14, 176], // region
      [24, 299, 12, 312], // footer
    ],
  },
  commandCard: {
    height: 280,
    below: 590,
    rows: 5,
    slots: [
      [24, 34, 12, 231], // eyebrow
      [336, 50, 32, 70, "end"], // step
      [24, 96, 24, 312], // title
      [24, 130, 14, 312], // instruction
      [50, 195, 20, 267], // command
      [24, 253, 12, 312], // safety
    ],
  },
  releaseBulletin: {
    height: 296,
    below: 610,
    rows: 6,
    slots: [
      [24, 34, 12, 212], // eyebrow
      [304, 34, 12, 62, "middle"], // version
      [24, 99, 26, 312], // headline
      [38, 151, 15, 298], // change0
      [38, 186, 15, 298], // change1
      [24, 237, 14, 312, "start", 219], // channel below the accent rule
      [24, 274, 12, 312], // footer
    ],
  },
  blueprint: {
    height: 304,
    below: 610,
    rows: 4,
    slots: [
      [24, 32, 12, 312], // eyebrow
      [24, 191, 28, 312, "start", 150], // title below the diagram
      [24, 228, 14, 312], // subtitle
      [24, 281, 12, 312], // footer
    ],
  },
  contourMap: {
    height: 264,
    below: 580,
    rows: 4,
    slots: [
      [24, 34, 12, 312], // eyebrow
      [24, 121, 27, 312, "start", 99], // title below the contours
      [24, 162, 14, 312], // subtitle
      [24, 239, 12, 312], // footer
    ],
  },
  letterpress: {
    height: 264,
    below: 520,
    rows: 4,
    slots: [
      [24, 34, 12, 312], // eyebrow
      [24, 126, 34, 312], // title
      [24, 168, 14, 312], // subtitle
      [24, 239, 12, 296], // footer; reserve the corner ornament
    ],
  },
  signalHalftone: {
    height: 302,
    below: 560,
    rows: 5,
    slots: [
      [24, 34, 12, 216], // eyebrow clear of the circles
      [24, 132, 36, 312, "start", 104], // title below the circles
      [24, 177, 36, 312], // title2
      [24, 226, 14, 312], // subtitle
      [24, 279, 12, 312], // footer
    ],
  },
  orbital: {
    height: 312,
    below: 620,
    rows: 4,
    slots: [
      [24, 161, 12, 312, "start", 126], // eyebrow below the orbit
      [24, 207, 29, 312], // title
      [24, 244, 14, 312], // subtitle
      [24, 290, 12, 312], // footer
    ],
  },
};
export function cardFitLayout(
  descriptor: PresentationDescriptor,
  request: LayoutRequest,
): CardFitLayout {
  const variant = compact[descriptor.id];
  const useCompact =
    request.variant === "compact" ||
    (request.variant === "auto" && request.width < variant.below);
  return useCompact
    ? {
        profile: `${descriptor.id}/compact/v1`,
        compact: true,
        width: 360,
        height: variant.height,
        rows: variant.rows,
        slots: descriptor.slots.map((slot, index) => {
          const [x, y, fontSize, safeWidth, anchor = "start", safeTop = 0] =
            variant.slots[index]!;
          return {
            ...slot,
            x,
            y,
            safeWidth,
            anchor,
            safeTop,
            style: { ...slot.style, fontSize, letterSpacing: 0 },
          };
        }),
      }
    : {
        profile: descriptor.profile,
        compact: false,
        width: 720,
        height: 240,
        rows: descriptor.rows.length,
        slots: descriptor.slots,
      };
}
