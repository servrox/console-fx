# Cinematic native DevTools observations — 2026-09-12

**Updated candidate:** use the [corrected 64-case qualification](review-fixes/README.md), including actual 424-pixel DevTools consoles. The original 56-case archive and identity statements below describe the earlier candidate.

All four cinematic defaults and their adjusted 480 × 270 variants were observed
in actual Windows Chrome and Edge DevTools. The maintainer reviewed the four
840 × 270 Chrome captures and answered **“Approve all four designs.”**
The [appearance record](appearance-review.json) identifies that review separately
from the implementation agent's inspection of all sixteen default/480-pixel captures.

Windows 11 Pro Insider Preview 25H2 build 26220.9223 was freshly checked in the
[host receipt](windows-build.json). Chrome for Testing 153.0.8010.36 and portable
Microsoft Edge 153.0.4234.32 match the [recorded official stable feeds](current-stable.json)
on the observation date. Both dedicated native consoles used the light theme,
100% zoom and a 1,384 CSS-pixel console width. Exact engine revisions, arguments,
visible captions, image dimensions and screenshots are in the reports.

- [Raw archive](native-observations.tar.gz): 81 original files, including four
  observation reports, their captures and earlier image-identity receipts.
- [Manifest](manifest.json): archive SHA-256 and every archived file's hash.
- [Final output identity](final-output-identity.json): 56 cinematic observations
  reconciled with the final packed candidate: 16 default/480-pixel samples plus 40
  generated-copy, before-open, reopened and repeated-snippet observations.
- [Lifecycle pixels](lifecycle-pixels.json): every lifecycle image compared with
  its visually inspected same-browser default capture. Thirty-nine differed by
  at most one channel level. Edge's second repeated Liquid Chrome image differed
  by two levels at three pixels and was separately visually inspected: the full
  title, reflections, depth and underline remained visible without clipping.
- [Cross-browser pixels](cross-browser-pixels.json): dimensions match, while
  decoded pixels differ. No cross-browser pixel-equality guarantee is claimed.

Every selected observation recorded exactly one emission with the expected
arguments and complete visible caption. Native **Copy console** preserved each
generated example's caption. The generated literal was executed in the actual
DevTools prompt, then tested before opening, after reopening and twice identically.
The final generated code and all lifecycle arguments match byte for byte; all
sixteen static native styles contain the final compiler's exact image URI.
Later source-map/diagnostic changes did not change these observed outputs.

The archive preserves original absolute local paths; each basename resolves under
its original report directory inside the archive. The incidental Edge offscreen
wave case is historical harness output and is excluded from the 56 cinematic
rows. Failed setup/connection probes are not passing qualification evidence.

All four treatments were legible and unclipped in the observed 840 × 270 and
480 × 270 surfaces (the latter uses a 46-pixel title size). This qualifies these
static fixtures in the recorded builds, not arbitrary text, local fonts, themes,
future browsers or motion. The [feature receipt](../../../specs/cinematic-metal-presets-evidence.md)
keeps page accessibility, installed consumers, CI and release status separate.
