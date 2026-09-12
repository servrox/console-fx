# Standard card qualification — 2026-09-12

The ten approved 720 × 240 profiles were compared to their immutable individual
references and observed in actual Windows 11 25H2 build 26220.9223 DevTools.
[Stable-feed observations](current-stable.json) identify Chrome for Testing
153.0.8010.36 and portable Edge 153.0.4234.32. Exact engine revisions, dimensions,
settings, timestamps, text, console arguments and image captures are archived.

- [Archive](observations.tar.gz) and [per-file manifest](manifest.json): six native
  reports and their images, ten reference/actual comparison pairs with font and
  semantic geometry measurements, and the serif regression/5,500-measure corpus.
- [Output identity](output-identity.json): every argument array, caption and
  generated source in all 200 native rows matches the tested compiler candidate.
- [Package candidate](candidate.json), [consumers](consumers.json),
  [bundle sizes](bundles.json) and [validation](validation.json) retain separate
  identities and proof boundaries.
- [Documented candidate](documented-candidate.json) and [README reconciliation](readme-package-reconciliation.json):
  only README.md differs from the installed candidate; runtime bytes are identical.

The six reports contain 120 lifecycle rows, 60 theme/zoom rows and 20 replacement
200% captures. Lifecycle checks cover generated code with native Copy console,
logging before opening DevTools, reopening, two identical executions, and a
424 CSS-pixel console with native copy. Theme checks cover light/dark 100% and
dark 200%. Every row records one console call and the complete native caption.
Native Windows clipboard CRLF is preserved; only CRLF-to-LF is normalized when
comparing semantic text. No general whitespace normalization is applied.

The original twenty 200% screenshots used a Playwright CSS-sized clip that omitted
part of the visible native window. They are retained as capture-method history,
not complete visual proof. The 13:40 Chrome/Edge reports replace them with direct
CDP `Page.captureScreenshot` visible surfaces without a clip; layout metrics record
native zoom 2. All twenty replacements were visually inspected. Fixed images are
wider than the available 692 CSS pixels and can extend above the scrolled viewport;
native horizontal/vertical scrolling and complete captions remain available.
This is an observed fixed-carrier limitation, not responsive-fit qualification.

All ten comparison pairs and all ten 100% native default card images in each
browser were individually inspected. Slot strings and authored anchors agree,
with no text outside the default artboards. Build Receipt's environment and
Request Trace's ID preserve two spaces where reference SVG rendering collapsed
them; the additional local space fits its safe region. Other differences include
corner backing and native curve/halftone antialiasing. Raster statistics are
retained without applying a global percentage as a visual pass criterion.

The output-identity reconciliation supersedes the earlier compiler metadata stamp
inside fixture reports: later estimator/helper changes preserve every observed
default argument and image byte. Archive paths retain their original local
locations; each basename resolves under its report directory within the archive.
Failed connection/setup probes are excluded from passing evidence. Browser page
comparisons, native observations and maintainer design acceptance are distinct.

See the [implementation receipt](../../../specs/useful-artful-presets-evidence.md)
for remaining full-spec, CI and release work. Screen-reader review remains
unperformed and nonblocking under ADR-0013.
