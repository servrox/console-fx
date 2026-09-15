# Native Windows DevTools observations — 2026-09-11

These captures come from actual DevTools windows on Windows 11 25H2 build
26220.9223, using Chrome for Testing 153.0.8010.36 and Microsoft Edge
153.0.4234.32. The official stable feeds were checked on the observation date.
They are separate from page previews, unit tests, package installation and CI.

- [Matrix](matrix.json): 150 selected rows across both browsers, including 100
  static/motion combinations, feasibility fixtures, gallery, individual motions,
  generated literal-percent source, native copying and lifecycle observations.
- [Raw archive](native-observations.tar.gz): 617 byte-preserved source reports,
  PNG captures, exact fixture inputs and quantitative frame reviews. Archive SHA-256:
  `881f9022514127dc88c1c94eb515c14c7eeda367fc132cf344ba2c5c4ae1d107`.
- [Manifest](manifest.json): file hashes, input compiler identity and report paths.
  The current compiler fingerprint is
  `c87f8b4b980ea5801a6cd5022131ff3c7d90bf537b5f2b0f26aaa5e68ddc45a1`.

The raw JSON retains its original local paths. Inside the archive, each report
directory is under `reports/`; fixture archives are under `inputs/`. The derived
matrix uses archive-relative paths and directly links the selected terminal PNGs.
Earlier observations are used only when their exact argument arrays match the
current fixture. Original failed/cached cases remain in their raw reports; later
explicit rows replace them in the selected matrix.

The implementation agent visually inspected all 53 distinct terminal bitmaps.
The 100 combination rows map to them by exact decoded pixel identity. The text,
effects and useful finished frames were visible without content clipping at the
recorded full console width. Each selected motion combination changed visibly
and settled; one-level 8-bit rasterization differences are recorded separately
from motion. This terminal inspection does not claim every intermediate frame
has been manually reviewed.

Native generated-source and copy checks preserve `%c`, `%s`, other specifiers,
combining marks, emoji and mixed text. Each explicit output produced one call
with its exact expected arguments. The copy test uses DevTools' native **Copy
console** command after clearing this dedicated fixture console and emitting one
message. Harness console clearing and the offscreen spacer are never library
behavior.

At a 424 CSS-pixel console width, the fixed 600-pixel SVG produces horizontal
scrolling and can be cropped by the viewport. Its complete caption remains visible
as text below. Logging before opening and reopening may start or resume visible
motion; identical image timing depends on the native image cache. No replay or
wall-clock start guarantee is made for an already printed message. Offscreen
entries returned to a useful settled frame in these samples.

The selected settings, exact engine revisions, frame timestamps and output
identity are recorded per row. These observations do not establish every browser
version, theme, arbitrary scene, screen-reader journey or a public release.
Additional sampled visual and motion-policy checks are recorded below.
Web accessibility and release gates are tracked in the [implementation receipt](../../../specs/console-fx-implementation-evidence.md).

## Additional motion-policy and visual observations

The [motion-policy archive](policy-observations.tar.gz) and its [manifest](policy-manifest.json)
add four generated-source cases in the same browsers: omitted motion policy and
explicit system policy under a confirmed reduced-motion preference. Every case
prints one call with exact static arguments and identical image pixels a second
later. This supplements the frozen main archive without replacing it.

All four standalone motion-family moving frames were visually inspected in both
browsers, as were the moving wave frames for all ten style/plain combinations per
browser. Text and effects remain legible inside the image bounds in those captured
phases. This is sampled visual review, not a claim about every possible scene or frame.
