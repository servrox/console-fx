# console-fx

**Ordinary logs. Extraordinary output.**

A planned TypeScript framework and visual playground for designing expressive browser-console messages and exporting a single, self-contained `console.log(...)`.

> **Status: specification and visual prototypes.** The framework and Next.js app are not implemented in this repository yet. Mockups illustrate the intended experience; they are not screenshots of a released product or evidence of DevTools compatibility.

[Implementation specification](docs/specs/console-fx-spec.md) · [Implementation handover](docs/specs/console-fx-handover.md) · [Mockup collection](docs/mockups/README.md)

## Animated output example

![Animated ConsoleFX prototype: softly waving gradient lettering and a moving dashed border.](docs/mockups/animated-output.svg)

The SVG preview animates for at most 4.8 seconds, then stops. It respects reduced-motion preferences. [Open the animation](docs/mockups/animated-output.svg) to replay it, or view the [static alternative](docs/mockups/animated-output-static.svg).

This is an animated image preview, **not a recording of Chrome DevTools**. Image rendering and console rendering must be validated separately.

### Try a dependency-free console prototype

Copy the complete [animated-console.js example](examples/animated-console.js) into your browser console. It emits one message containing a generated SVG background and a readable text caption. It does not install anything, fetch resources, alter the page, clear logs, or start JavaScript animation timers. Reduced-motion or an unknown motion preference selects static output.

Chrome documents `%c` styling and `data:` image URLs in its [console formatting guide](https://developer.chrome.com/docs/devtools/console/format-style). Animated SVG inside a particular DevTools version remains experimental. The example is exploratory source, not the future npm API.

## Output concepts

![Twelve ConsoleFX output concepts: neon, ASCII-inspired, gradient, boxed, success, warning, error, animated SVG, multiline, tabular, badges, and custom branding.](docs/mockups/output-gallery.svg)

An editable SVG reinterpretation of the initial concept gallery. Placeholder version numbers, performance metrics, and unplanned package claims from the original illustration have been removed. Tabular and status messages are decorative examples, not a proposed `console.table` or observability feature.

## Landing page and playground

### Desktop landing page

The playground is part of the landing page: choose a preset, edit the content and styling, inspect the preview, and copy one `console.log`.

![Desktop ConsoleFX landing page with an integrated three-column visual playground.](docs/mockups/landing-desktop.svg)

### Expanded playground

A focused workspace with preset library, output preview, export code, renderer settings, bounded motion, and explicit compatibility diagnostics.

![Expanded ConsoleFX playground with an Aurora-wave SVG scene and experimental-animation warning.](docs/mockups/playground-desktop.svg)

### Mobile landing page

<img src="docs/mockups/landing-mobile.svg" width="390" alt="Mobile ConsoleFX landing page with a stacked playground, preset chips, styling controls, and Copy console.log action." />

These are editable design mockups. Their buttons, fields, sliders, and exports are illustrations, not implemented controls. Code previews inside the SVG-mode and mobile mockups are explicitly shortened for presentation; real generated exports must be complete.

## Planned packages

| Deliverable | Name / location | Status |
| --- | --- | --- |
| TypeScript core | `@servrox/console-fx` | Planned |
| React adapter | `@servrox/console-fx-react` | Planned |
| Next.js configurator | `apps/studio` | Planned |
| Next.js integration | Recipes and example application | Planned; no separate runtime package initially |

Compilation should print nothing. An explicit emission should make exactly one console call. The core should not depend on React or Next.js. See the [specification](docs/specs/console-fx-spec.md) for the authoritative scope and release gates.

## Design validation

The SVG assets were rendered as images in headless Chromium 144.0.7559.96. Sampled frames confirmed visible animation, a still result after its duration, and a still result with reduced motion. The prototype console script was checked for a single emission and static fallback. This is **not** end-to-end DevTools UI validation, cross-browser certification, or a package release test.

All committed illustrations are self-contained SVG source. There are no remote fonts, embedded scripts, external image dependencies, or application/CI changes in this visual-prototype update.
