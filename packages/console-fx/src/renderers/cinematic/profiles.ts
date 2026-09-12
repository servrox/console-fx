import { deepFreeze } from "../../model/limits.js";
import type { CinematicProfile, Effect } from "../../model/types.js";

export type CinematicEffect = Extract<Effect, { kind: "cinematicMetal" }>;
export const PROFILES = deepFreeze({
  "lightning-metal-v1": {
    angular: true,
    xScale: 1,
    yScale: 1,
    italic: false,
    stops: [
      [0, "#eff"],
      [0.27, "#8bd"],
      [0.48, "#fff"],
      [0.5, "#246"],
      [0.73, "#48b"],
      [1, "#def"],
    ],
    shadow: "#123",
    edge: "#011",
    ornament: "bolts",
    ornamentPath:
      "M-3 22L15 34H6L30 55L-1 47H2ZM103 20L85 36H95L73 60L102 45H99Z",
  },
  "ice-cathedral-v1": {
    angular: false,
    xScale: 0.82,
    yScale: 1.3,
    italic: false,
    stops: [
      [0, "#fff"],
      [0.38, "#cef"],
      [0.5, "#7ac"],
      [0.52, "#eff"],
      [0.79, "#8ce"],
      [1, "#eff"],
    ],
    shadow: "#146",
    edge: "#023",
    ornament: "spires",
    ornamentPath:
      "M-7 112L-5 -12L-3 112L-5 80ZM103 112L105 -12L107 112L105 80Z",
  },
  "liquid-chrome-v1": {
    angular: false,
    xScale: 1,
    yScale: 1,
    italic: true,
    stops: [
      [0, "#fff"],
      [0.38, "#9ab"],
      [0.48, "#eff"],
      [0.49, "#123"],
      [0.55, "#345"],
      [0.86, "#bcd"],
      [1, "#eff"],
    ],
    shadow: "#245",
    edge: "#011",
    ornament: "sweep",
    ornamentPath: "M-3 120Q46 109 103 103L85 116Q38 118 -3 124Z",
  },
  "molten-gold-v1": {
    angular: true,
    xScale: 1,
    yScale: 1,
    italic: false,
    stops: [
      [0, "#ffc"],
      [0.32, "#fd8"],
      [0.48, "#fb3"],
      [0.5, "#921"],
      [0.69, "#e51"],
      [0.86, "#fb4"],
      [1, "#fea"],
    ],
    shadow: "#610",
    edge: "#200",
    ornament: "flames",
    ornamentPath:
      "M-3 112L14 40L10 80L28 60L19 116ZM103 112L86 40L90 80L72 60L81 116Z",
  },
} as const satisfies Record<CinematicProfile, unknown>);
