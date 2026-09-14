# Workbench verification — 14 September 2026

**Local implementation and native Console qualification passed.** CI, npm and
public deployment checkpoints are recorded separately in the
[implementation receipt](../../../specs/workbench-implementation-evidence.md).

## What is retained here

- [Candidate identities and file hashes](candidate.json): both 0.2.0 tarballs,
  the prepared studio, the lockfile and local result counts.
- Native [Chrome](chrome-native.json) and [Edge](edge-native.json): 43 cases each,
  exact one-call arguments, complete captions and recorded browser/Windows builds.
- Native [Chrome resizing](chrome-resizing.json) and [Edge resizing](edge-resizing.json):
  86 observations each. Every example is emitted once, then its existing entry is
  resized at requested window widths 560 and 1,000 px. Actual Console/carrier widths
  are recorded; no resize emits again or exceeds the carrier cap.
- [Before/after byte parity](native-byte-parity.json) and
  [old-reader v2 rejection](old-reader-v2-rejection.json).
- [Vitest](vitest-final.log), [types](typecheck-final.log), [lint](lint-final.log),
  [formatting](format-check-final.log), [build](build-final.log),
  [package allowlists](packages.log), [bundle budgets](bundles.log),
  [installed consumers](consumers-final.log) and [studio result](studio-result.txt).
- [Video recording details](recording.json) and [caption source](usage.vtt).
  The shipped MP4/WebM/poster live under `apps/studio/public/media/`.

The full native images, exact arguments, fixtures and browser reports remain in
this worktree's `.artifacts/devtools/` and `.artifacts/workbench/` directories.
Copied logs normalize terminal whitespace; original local logs stay unchanged.
Public native summaries identify those local raw files and their SHA-256 hashes;
they are deliberately condensed records, not an archive of every raw file.

## Visual references

| Page / output | Capture |
| --- | --- |
| Cinematic comparison | [Desktop hero](hero-1440.png) |
| Persistent editor | [Desktop workbench](workbench-1440.png) |
| Narrow editing and discovery | [Editor](workbench-390.png), [sidebar](discovery-390.png) |
| Actual Chrome output | [Lightning Metal](chrome-workbench-preset-lightningMetal-native.png), [Build Receipt](chrome-workbench-preset-buildReceipt-native.png) |
| Actual Edge output | [Lightning Metal](edge-workbench-preset-lightningMetal-native.png), [Build Receipt](edge-workbench-preset-buildReceipt-native.png) |

Native wide contact sheets for all 43 examples were inspected separately from
page captures. The standard card artwork, full fields, ornament clearances and
cinematic shapes remain intact. Unknown container-width image readability is
still reported; complete native captions remain the accessible text alternative.

## Environment and reproducibility

- NixOS in WSL2; Node 24.20.0, pnpm 12.3.4, TypeScript 6.0.3.
- Vitest 4.1.11; Playwright 1.63.0; local page Chromium 153.0.8010.12.
- Windows 11 25H2 build 26220.9223.
- Native Chrome **for Testing Stable 153.0.8010.36**, from Google's
  [Stable feed](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json).
- Native Edge **Stable 152.0.4191.77**, from Microsoft's
  [enterprise update feed](https://edgeupdates.microsoft.com/api/products?view=enterprise).
  These are dated build observations, not an evergreen latest-version assertion.
- Browser binaries ran in dedicated temporary qualification profiles. Captures
  show owned ConsoleFX fixture scenes; selected page captures contain sample data.
  No credentials, unrelated tabs, contact details or auth links are included.

To repeat the native observation, build the packages, run
`scripts/workbench-fixtures.mjs`, and pass its `native-cases.json` through
`CONSOLE_FX_FIXTURE_SET` to `pnpm run fixtures:devtools`. Serve that fixture and
attach `scripts/qualify-devtools.mjs` followed by
`scripts/qualify-workbench-sizing.mjs` to a dedicated Windows browser/DevTools
session. Set `CONSOLE_FX_FIXTURE_PORT` and `CONSOLE_FX_WINDOWS_BUILD` explicitly.
The browser must be open to the fixture, not an unrelated tab.

## Limits

- Local checks are not CI or publication evidence.
- Headless page captures are not native Console evidence; emulated widths are not
  physical-phone performance checks.
- Native v2 defaults are static/reduced. Existing effect/motion qualification
  remains separately dated in its owning receipts.
- Participant, laptop/phone and real Safari sessions remain open.
- Screen-reader follow-up is nonblocking under ADR-0013.

Source review closed the separate Standards and Spec findings; the small package
budget correction also passed an independent scoped review. No raw renderer,
private compiler import or custom registration API was added to Studio.
