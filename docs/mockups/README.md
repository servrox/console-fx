# ConsoleFX visual direction

Design mockups for `servrox/console-fx`, using the planned `@servrox/console-fx` and `@servrox/console-fx-react` package names. These assets supplement, but do not replace, the [implementation specification](../specs/console-fx-spec.md).

## Assets

| Source | Size | Purpose |
| --- | --- | --- |
| [output-gallery.svg](output-gallery.svg) | 1440 × 1420 | Twelve illustrative console-output treatments |
| [animated-output.svg](animated-output.svg) | 1200 × 340 | Finite animated README example |
| [animated-output-static.svg](animated-output-static.svg) | 1200 × 340 | No-motion alternative |
| [landing-desktop.svg](landing-desktop.svg) | 1440 × 1440 | Landing page with integrated playground |
| [playground-desktop.svg](playground-desktop.svg) | 1440 × 1024 | Expanded editing workspace |
| [landing-mobile.svg](landing-mobile.svg) | 390 × 1740 | Stacked mobile landing page and playground |

Each SVG is its own editable source; open it in a browser or an SVG-capable design editor. Relative references in the root README render the same committed files. The controls are drawn, not interactive. The separate [console prototype](../../examples/animated-console.js) is runnable without the future npm package.

## Design decisions

Use a near-black canvas, restrained lavender controls, cyan-to-pink accent gradients, and readable neutral labels. Keep the decorative output expressive while the surrounding interface stays quiet. The dominant editor action is **Copy console.log**; **Test in console** is explicit and separate from editing.

On desktop, keep presets, preview/export, and properties in three clear regions. On mobile, stack the same workflow and retain the export action. CSS previews are marked approximate. SVG motion is marked experimental, with finite duration, a static alternative, and reduced-motion handling.

The output gallery is a newly drawn SVG reinterpretation, not a byte-for-byte copy of the earlier chat-generated raster. It removes invented version numbers, benchmarks, and `@servrox/core`, `@servrox/react`, and `@servrox/next` package labels. The original raster is not committed in this change.

## Boundaries

All output is illustrative. Success, warning, error, and table-shaped examples do not add a logging transport, console.table API, benchmark claim, or live-progress feature to the specification. The terminal frames are drawn presentation elements, not captured DevTools UI. Preview animation cannot establish that a DevTools frontend paints the same animation.

The animated SVG has no script or remote resources. Motion ends within 4.8 seconds, and its CSS disables animation for `prefers-reduced-motion: reduce`. The static file contains no animation rules. No build workflow or runtime application has been added.

## Validation performed

Rendered all SVG sources as images in headless Chromium 144.0.7559.96 and inspected the desktop/mobile layouts. Compared sampled animation frames, frames after the motion duration, and reduced-motion frames. Checked the prototype script's console-event count and motion policy. Actual Chrome/Edge DevTools rendering, GitHub's image presentation in every client, and browser-version compatibility remain unverified.
