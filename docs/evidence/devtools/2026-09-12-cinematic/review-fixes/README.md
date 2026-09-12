# Corrected cinematic qualification — 2026-09-12

The independent review found an underestimated angular ink overhang and a bloom filter whose bottom cut into an unadorned title. Both were corrected with owning regressions. Two reviewers independently verified the original reproduction and all 38 geometry-preserving glyph simplifications.

[Identity checks](identity.json) reconcile 64 actual Windows DevTools observations with the corrected compiler and package: sixteen default/480-pixel surfaces, forty generated-copy/before-open/reopen/repeated cases, and eight actual narrow-console cases. [Raw captures/reports](native-observations.tar.gz) are fingerprinted in the [manifest](manifest.json). The earlier archive belongs to the earlier candidate and is retained as history.

Chrome for Testing 153.0.8010.36 and Edge 153.0.4234.32 ran on Windows 11 build 26220.9223, light theme and native 100% zoom. Default console width was 1,384 CSS pixels. The eight new narrow cases use **424 CSS pixels of actual DevTools width**, not a smaller image in a wide window. All captions were complete, readable and preserved by native Copy console. Fixed 840-pixel artwork crops with horizontal scrolling at that width; no auto-fit claim is made. The sixteen full-image captures and all eight narrow contexts were inspected individually.

Every case recorded exactly one call and the expected arguments. Generated code, captions and image URIs match the current compiler byte for byte. A page screenshot or source-only test is not substituted for these native observations. Existing design approval covers the four treatments; the fix preserves their geometry and removes clipping rather than redesigning them.
