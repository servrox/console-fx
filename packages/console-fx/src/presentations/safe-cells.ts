import type { CardPresetId } from "../model/types.js";
// Null means no extra restriction beyond the original cell.
type Cell = readonly [
  left?: number | null,
  right?: number | null,
  top?: number | null,
  bottom?: number | null,
];
/** V2 intersections with existing standard artwork in its 720 × 240 coordinates.
 * Rows follow immutable descriptor slot order, as with the compact geometry.
 * Every bound reserves existing divider/status/ornament paint. Compact is unchanged.
 */
const standard: Readonly<Record<CardPresetId, readonly Cell[]>> = {
  buildReceipt: [
    [], // eyebrow
    [null, null, null, 107], // project
    [566, 662, 35, 73], // outcome
    [null, null, 109], // revisionLabel
    [null, null, 109], // durationLabel
    [null, null, 109], // checksLabel
    [null, null, null, 186], // revision
    [null, null, null, 186], // duration
    [null, null, null, 186], // checks
    [null, null, 188], // environment
    [null, null, 188], // footer
  ],
  requestTrace: [
    [], // eyebrow
    [null, null, null, 97], // method
    [null, null, null, 97], // path
    [], // status
    [null, null, 43, 97], // total
    [null, null, 134], // s0
    [null, null, 134], // s1
    [null, null, 134], // s2
    [null, null, null, 201], // d0
    [null, null, null, 201], // d1
    [null, null, null, 201], // d2
    [null, null, 203], // requestId
    [null, null, 203], // footer
  ],
  serviceReady: [
    [106], // eyebrow
    [106], // service
    [570, 662, 25, 57], // state
    [106, null, null, 141], // endpoint
    [null, null, 143], // envLabel
    [null, null, 143], // runtimeLabel
    [null, null, 143], // regionLabel
    [null, null, null, 204], // environment
    [null, null, null, 204], // runtime
    [null, null, null, 204], // region
    [null, null, 206], // footer
  ],
  commandCard: [
    [], // eyebrow
    [null, 108], // step
    [110, null, null, 125], // title
    [110, null, null, 125], // instruction
    [55, 629, 127, 189], // command
    [null, null, 191], // safety
  ],
  releaseBulletin: [
    [], // eyebrow
    [], // version
    [null, null, 59], // headline
    [40, null, null, 179], // change0
    [340, null, null, 179], // change1
    [null, null, 185], // channel
    [null, null, 185], // footer
  ],
  blueprint: [
    [], // eyebrow
    [230, null, null, 165], // title
    [230, null, null, 165], // subtitle
    [null, null, 185], // footer
  ],
  contourMap: [
    [null, 459], // eyebrow
    [null, 459, null, 180], // title
    [null, 459, null, 180], // subtitle
    [null, 459, 184], // footer
  ],
  letterpress: [
    [], // eyebrow
    [null, null, 54, 181], // title
    [null, null, 54, 181], // subtitle
    [null, 672, 186], // footer
  ],
  signalHalftone: [
    [245], // eyebrow
    [245], // title
    [245, null, null, 194], // title2
    [245, null, null, 194], // subtitle
    [245, null, 196], // footer
  ],
  orbital: [
    [244], // eyebrow
    [244, null, null, 173], // title
    [244, null, null, 173], // subtitle
    [null, null, 175], // footer
  ],
};
export function standardCellEdges(id: CardPresetId, index: number): Cell {
  return standard[id][index]!;
}
