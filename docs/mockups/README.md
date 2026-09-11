# ConsoleFX visual direction

Design mockups for `servrox/console-fx`, using the planned `@servrox/console-fx` and `@servrox/console-fx-react` package names. These assets supplement, but do not replace, the [implementation specification](../specs/console-fx-spec.md).

## Current reference: landing page, examples, and playground

![Combined ConsoleFX landing-page mockup with output-example cards and an integrated visual playground.](landing-playground-combined.avif)

[Open the combined mockup](landing-playground-combined.avif).

This is an optimized raster of the latest chat-generated image, not a new SVG interpretation. It combines the landing-page hero, an example gallery based on the original output concepts, and the playground. It supersedes the earlier purple/lavender interface direction. Earlier SVGs remain available as historical explorations, not as the current interface color system.

## Current design direction

Use a professional, minimal dark interface with harmonious **neumorphic** depth: softly raised panels and buttons, inset editing fields, restrained edge highlights, and consistent spacing and corner radii. Keep labels readable and control boundaries distinguishable; do not rely on shadows alone to communicate an interactive state.

Use **cyan/neon only for small accents**, such as a primary action, selected state, focused control, or a small brand detail. No purple/lavender interface theme, broad neon glow, decorative particle backgrounds, or large multicolor gradients. The requested restraint takes precedence over any exaggerated glow or gradient in the generated reference. Green, amber, and red may remain in the illustrative success, warning, and error outputs.

The console examples may be more expressive than the surrounding UI. The dominant editor action is **Copy console.log**. **Test in console** remains explicit and separate from editing, even when it is not depicted in the raster. Selecting an example should load its configuration into the playground; it must not silently emit a log.

Keep the combined page hierarchy: hero and primary action, output-example gallery, then the integrated playground. The reference groups presets and customization beside preview/export. Preserve distinct content, style, preview, and export concerns when implementing the responsive layout. On mobile, stack the workflow and retain the export action. CSS previews must be marked approximate; SVG motion must be marked experimental and provide finite duration, static output, and reduced-motion handling.

## Assets

| Source | Size | Purpose |
| --- | --- | --- |
| [landing-playground-combined.avif](landing-playground-combined.avif) | 1200 × 900 | Current combined landing page, output gallery, and playground; optimized raster |
| [output-gallery.svg](output-gallery.svg) | 1440 × 1420 | Earlier twelve illustrative console-output treatments |
| [animated-output.svg](animated-output.svg) | 1200 × 340 | Finite animated README example |
| [animated-output-static.svg](animated-output-static.svg) | 1200 × 340 | No-motion alternative |
| [landing-desktop.svg](landing-desktop.svg) | 1440 × 1440 | Earlier landing page with integrated playground |
| [playground-desktop.svg](playground-desktop.svg) | 1440 × 1024 | Earlier expanded editing workspace |
| [landing-mobile.svg](landing-mobile.svg) | 390 × 1740 | Earlier stacked mobile landing page and playground |

The AVIF is a lossy, resized preview of the supplied 1448 × 1086 PNG, preserving its composition. The full-resolution PNG is not part of this repository update. Each SVG is its own editable source and can be opened in a browser or an SVG-capable design editor. Relative references in the root README point to these committed assets. Controls in every mockup are drawn, not interactive. The separate [console prototype](../../examples/animated-console.js) remains runnable without the future npm package.

## Concept placeholders and scope boundaries

The latest generated image includes a version label, GitHub star count, npm installation command, test counts/timings, the phrase “Real console output,” and abbreviated export code. These are **illustrative placeholders**, not verified project statistics, proof of npm availability, performance measurements, or evidence of a working application. Do not carry those claims or that abbreviated code into implementation. Package names, public APIs, and release requirements come from the specification, not image text.

All output is illustrative. Success, warning, error, and table-shaped examples do not add a logging transport, console.table API, benchmark claim, or live-progress feature. The terminal frames are presentation elements, not captured DevTools UI. Preview animation cannot establish that a DevTools frontend paints the same animation.

The earlier output-gallery SVG is a redraw of the original concept gallery, not this latest combined image. It removes the original illustration's invented package labels and measurements. Its broader effect colors do not prescribe interface colors.

The animated SVG and its static alternative are unchanged. The animation has no script or remote resources, ends within 4.8 seconds, and disables animation for `prefers-reduced-motion: reduce`. The static file contains no animation rules. No application, build workflow, package release, or CI configuration was added by this update.

## Validation record

For the earlier visual-prototype update, all SVG sources were rendered as images in headless Chromium 144.0.7559.96 and the desktop/mobile layouts were inspected. Sampled animation frames, final frames, and reduced-motion frames were compared; the prototype script's console-event count and motion policy were checked.

For this update, the combined raster was decoded and visually inspected after conversion, and the GitHub blob SHA matched the locally prepared AVIF. This validates the uploaded preview bytes, not any depicted UI behavior. Actual Chrome/Edge DevTools rendering, GitHub's image presentation in every client, and browser-version compatibility remain separate validation requirements.
