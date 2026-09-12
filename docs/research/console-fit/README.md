# Console fit research — experimental, not a support claim

[Proposal](../../specs/responsive-fitting-spec.md) · [ADR-0015](../../adrs/0015-separate-content-fit-from-output-sizing.md) · [Copy-paste probe](responsive-console-probe.js)

This directory preserves the relative-padding experiment from the preceding evaluation so it can be tested and compared later. It is not a ConsoleFX package implementation, a compatibility certification, or a screenshot of actual DevTools.

## Try the probe

Copy the complete `responsive-console-probe.js` into a disposable browser-console session. It creates one static SVG background plus an ordinary readable caption with one log call. Resize the Console pane **after** printing; do not rerun merely to produce a new width. No timers, width detection, console clearing, page mutations or network requests are used by this script.

The probe deliberately does not test card reflow or font measurement. Its 720 × 240 artwork is fixed; the proposed CSS carrier scales it. Tiny image text remains possible even when the caption is readable. Do not infer a usable compact card from a successfully scaled title.

The style under test is `padding:min(120px,16%) min(360px,48%)` with a contained image, zero font size/line height on the image span, and reset styling before a following-line caption. It relies on the frontend accepting these properties and resolving percentages against a suitable containing block. A normal page's CSS.supports result cannot prove that.

## Evidence levels

| Level | What it proves | State for this PR |
| --- | --- | --- |
| Source inspection | API constraints, current compiler behavior, upstream sanitizer/carrier implementation | Inspected; source references in the spec |
| Isolated probe execution | Call count, deterministic args, no accessed page/timer/measurement globals | Three local Node tests passed; details below |
| Arithmetic model | Candidate ratio and cap assuming a definite containing width | Tested; not browser layout |
| Reconstructed frontend page | Behavior of the reconstruction, not the real Console | Prior evaluation reported Chromium 144 results; not rerun or independently qualified in this PR |
| Actual Windows Chrome and Edge DevTools | Appearance/resize behavior of the recorded artifact and exact build/configuration | **Not run in this PR** |
| Package consumers, CI and deployment | Behavior of the implemented package/build | **Not run; no fitting implementation in this PR** |

The preceding evaluation reported reconstruction widths 280, 400, 720 and 1,000 with a responsive carrier cap of 720 × 240. That result remains historical, limited evidence. This PR does not attach an unreproducible result as a new test receipt or mark an empty matrix as passing.

## Dependency-free probe check

```sh
node --test docs/research/console-fit/probe.test.mjs
```

Executed on 2026-09-12 using the available local Node v22.16.0: **3 tests passed, 0 failed**. The repository application requires its pinned Node 24/pnpm toolchain; the local Node run here checks only the standalone documentation probe. No application dependencies were installed and no package suite was claimed to pass.

Tests execute the owned snippet in an isolated recording context, fail on page/measurement/network/timer-global access, assert one deterministic string-only log, inspect the data-URI SVG/carrier shape and caption, and verify sizing arithmetic. This is a small probe regression check, not a generic JavaScript security sandbox certification or a replacement for AST/package tests.

## Sizing model, not measured values

For a simple containing block C, modeled width is `min(720, 0.96*C)` and height is width/3:

| Assumed containing width (CSS px) | Modeled image width | Modeled image height |
| --- | --- | --- |
| 280 | 268.80 | 89.60 |
| 360 | 345.60 | 115.20 |
| 480 | 460.80 | 153.60 |
| 720 | 691.20 | 230.40 |
| 960 | 720.00 | 240.00 |

These are **not measurements of Console space**. Source links, timestamps, inline formatting, grouping, zoom, repeat counters and intrinsic layout can affect the real entry. Four percent spare width is not a proof against every obstruction.

## Qualification procedure

Qualify in current-stable **Windows 11 Chrome and Edge independently** under ADR-0006. Verify channel currency when running; record actual versions and Windows build. A Linux/headless page result is not that gate.

1. Save the exact probe/compiled output and its SHA-256, compiler revision and scene/options. Record theme, OS/build, browser/build, DevTools zoom, docking/drawer state, font environment and the method used to document console dimensions. Do not derive message width from the inspected page's innerWidth.
2. Run both fixed-padding and relative-padding carriers against the same content, separately. Test 280/360/480/720/960 reference widths where available and exact observed widths around those targets. Keep no-source/plain, long source-link, nested-group, timestamps-on and repeated-message cases distinct.
3. Resize an existing entry; test side/bottom docking, detached DevTools, console drawer, sidebar visibility, zoom 100/125/200%, and a browser scale different from DevTools zoom. Scroll offscreen/back, close/reopen, log while DevTools is closed, and repeat the same snippet. Do not assume cached entries relayout correctly.
4. Record clipping, unexpected scrollbars, actual content/border box where observable, aspect ratio, caption readability, line wrapping and whether the original entry changes without a second library emission. Capture full frontend screenshots plus a cropped output artifact; preserve the source anchor/sidebars in context evidence.
5. During later implementation, repeat with every supported profile: short/long titles, wide/narrow glyphs, Unicode, effect extremes and full motion envelopes. Compare compact variants against their own approved reference, not an arbitrarily squeezed wide card.
6. Mark unavailable cases **not run**, failures **fail**, and approximations explicitly. Promotion requires the covered exact profile/environment evidence; static fixed success must not promote motion or container sizing implicitly.

Source width in the probe is not a log-area dimension API. In a dedicated test harness it is acceptable to observe the frontend manually or through authorized tooling, but that test mechanism must not ship inside the npm package or generated console snippet.

### Per-observation record template

```json
{
  "status": "not-run",
  "evidenceKind": "actual-devtools",
  "artifactSha256": null,
  "compilerRevision": null,
  "sceneAndOptionsPath": null,
  "observedAt": null,
  "browser": null,
  "browserVersion": null,
  "stableChannelVerifiedAt": null,
  "windowsBuild": null,
  "theme": null,
  "devtoolsZoom": null,
  "dockingAndDrawer": null,
  "groupDepth": null,
  "timestamps": null,
  "repeatCounter": null,
  "sourceAnchorCase": null,
  "dimensionObservationMethod": null,
  "observedMessageWidthCssPx": null,
  "carrierMode": null,
  "resizedExistingEntry": null,
  "result": null,
  "screenshotPaths": [],
  "limitations": []
}
```

This is an unfilled template, not an observation. Store future actual observations separately with their artifact fingerprints. Do not silently overwrite failed results or relabel reconstructed images as actual DevTools evidence.

## Compact comparison work

Preserve PR #3's original ten 720 × 240 SVGs, synthetic input fixtures and hashes. In authorized follow-up work, add per-profile compact references (360 px wide, height within 400 px), boundary widths, and actual output at the same canonical content. Compare text/reading order first, then slot geometry and paint bounds, then raster appearance in the recorded font environment. Long text may legitimately fail; the error/fallback must preserve information.

No new visual baselines are accepted or modified by this responsiveness PR. A future implementation must not regenerate approved goldens solely to hide clipping or a changed layout. All current fitting APIs and compact profiles remain proposals.

## Integration review — 2026-09-12

The new fitting proposal was renumbered ADR-0015 to preserve accepted ADR-0014 card presentations. The probe caption now includes every meaningful visible instruction in reading order. Its source-only tests were rerun with the repository-owned Node 24.20.0. These checks still do not qualify container sizing in DevTools.
