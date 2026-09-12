# Compare the implementation with the references

## What is frozen, and what is not

These ten SVGs are **proposed design baselines**. Review and record acceptance per preset before treating them as goldens. A hash records which artwork was reviewed; it is not approval, a benchmark, or proof of console rendering. Keep this `v1` folder immutable after approval except for explicitly reviewed corrections. Do not replace expected artwork with an implementation screenshot to make a test pass.

Each baseline is a 720 × 240 CSS-pixel **output plate**, without fabricated DevTools chrome or a surrounding caption. The future single console emission must also include its full readable caption. Test that caption separately: it is not part of the plate's pixel crop.

`fixtures.json` records the synthetic factory inputs and exact ordered semantic text by `data-slot`. The SVG source supplies coordinates, anchor, font size/family/weight, color, and vector landmarks. The per-preset catalog documents the recognizable design features and behavior. This fixture format is design documentation, not a supported SceneV1 import API.

## Required comparison bundle for each preset

During authorized implementation, create a separate evidence directory for each ID and candidate revision. Do not write results over these references. Record:

1. Reference SHA-256, fixture-file SHA-256, candidate commit, normalized scene, resolved compiler options, final SVG/data-URI fingerprint, and exact readable caption.
2. The baseline SVG and actual compiler SVG rendered in the **same** recorded browser/OS/font environment at 720 × 240, plus a side-by-side image and optional difference image. Keep native-scale and 2× captures separate.
3. Structured semantic/layout findings, an actual DevTools screenshot, and the outcome/limitations. Use explicit `pass`, `fail`, or `not observed`, never “looks supported” based on a page preview.

Local font availability matters. The design references use `DejaVu Sans, Arial, sans-serif`, `DejaVu Sans Mono, monospace`, and `DejaVu Serif, Georgia, serif`. These are local stacks, not bundled assets. Record which font resolved in the comparison environment; never distribute fonts copied from a workstation/container. A target-font mismatch needs a reviewed typography decision rather than a silent replacement or global pixel-diff allowance.

## Review layers

### A. Semantic — exact

Compare each `data-slot` value and order with `fixtures.json`. Every meaningful label, unit, status, endpoint, and command must survive. Compare the full caption independently from decorative glyph duplicates; Letterpress's highlight layer is not another copy of the title in accessible text. Missing or changed content fails regardless of pixel similarity.

Check malicious/literal input through the real core serializer: quotes, percent tokens, angle brackets, non-Latin scripts, emoji, combining marks, and newlines. No implicit upper-casing, truncation, layout-driven substitutions, or command execution. Overflow must produce the specified strict error or explicit full-text fallback.

### B. Layout and visual identity — explicit review

At the baseline dimensions, compare text anchors, safe-region containment, alignment, main type hierarchy, palette roles, and each catalog landmark. Decorative curves may exit the artboard as designed; text may not. Start with a one-CSS-pixel tolerance for declared geometric anchors in the same environment. This is a proposal for review, not a claim that all font stacks can match pixel-for-pixel.

Inspect lettering, surface depth, negative space, rule weights, ornament density, and status clarity at actual viewing size. Do not hide differences behind a 5% whole-image threshold: one missing word can occupy far less of the image. Any raster tolerance must be calibrated after the first implementation baseline, documented, and subordinate to semantic and geometry checks. A difference in glyph antialiasing is not equivalent to clipping or loss of contrast.

### C. Actual console — separately qualified

Follow ADR-0006 in Windows 11 Chrome and Edge on recorded current-stable builds. Capture the generated **single** console entry, not a hand-inserted mockup. Record browser/OS build, theme, zoom, available console width, input/options, and revision. Check background visibility, crop/padding, readable caption, copied text, repeat emissions, and narrow consoles. A scaled or zoomed observation is labeled as such.

Page `<img>` rendering proves that an image rendered in that page environment. Sink spies prove call count and arguments. Neither proves how DevTools paints the entry. Keep the three evidence classes separate. No new motion is part of this collection.

## Read-only reference validation

```sh
python docs/mockups/preset-collection-v1/validate_mockups.py
```

The standard-library script reads the ten SVGs, fixed fixtures, and hash manifest. It validates identity, dimensions/viewBox, semantic text/order, permitted XML elements, unique fragment IDs, internal references, SVG byte/element budgets, and integrity. It does not install anything, rewrite baselines, run the app, or call a network service.

## Evidence for this specification PR

On 2026-09-12 the ten individual SVGs were parsed and checked locally with the reference validator. Every reference matched its SHA-256, dimensions, and ordered semantic slots. The largest individual file was 4,588 SVG bytes; the largest individual XML tree had 41 elements. These are source-file measurements, not compiled-snippet sizes or rendering benchmarks.

All ten images were rasterized locally with **CairoSVG 2.8.2** using installed DejaVu fonts. The rendered overview was visually inspected for hierarchy, contrast, spacing, and clipping. A per-slot font-bound check was also used as a local aid; it does not replace target-browser observation. The SVGs are original editable geometry/text, not captured application output.

**Not performed:** implementation, application tests, package-consumer checks, production browser compatibility qualification, actual Windows Chrome/Edge DevTools captures, or maintainer baseline acceptance. Those remain the later feature's validation gates.
