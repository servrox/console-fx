# Fitting and compact qualification — 2026-09-12

The approved fitting, sizing, measurement and recipe implementation was reviewed
under ADR-0015. All ten compact designs have separate maintainer approval. This
receipt records actual Windows 11 25H2 build 26220.9223 DevTools and local checks;
it does not claim publication, deployment or arbitrary recipient-font support.

The [archive](observations.tar.gz) and [per-file manifest](manifest.json) contain
seven native reports, original captures, the exact forty-case fixture set, four
font/geometry matrices and local validation logs. The [Stable-feed receipt](current-stable.json)
identifies Chrome 153.0.8010.36 and Edge 153.0.4234.32. The latter used the
[Microsoft-signed portable executable](edge-signature.json). Native browser/engine
versions and original absolute capture paths remain in each report; basenames
resolve under that report's archive directory.

There are **240 applicable native rows** after the manifest's explicit exclusions.
Each browser contributes 34 main fixtures and 86 lifecycle/context rows: ten compact
cards, eighteen standard/font samples, four fitted motions and two container
examples; generated snippets/native copy, existing-entry resize, before-open,
reopen/repeat, light/dark/200% DevTools zoom, source anchors, sidebar, timestamps,
nested groups, 125% browser and DevTools zoom, docking/drawer and offscreen return.
Each explicit call emitted once with matching arguments and a complete caption.
The separate harness adds group/spacer calls only for its own context experiments.

All ten compact native crops in both browsers were inspected. Slot strings,
fragments, anchors, fonts and sizes match the approved reference geometry. Fitted
cinematic and Unicode samples were inspected; Windows renders the regional flag
sample as `DE`, while its caption retains the original flag code points. All four
motion families visibly change; early/moving pixel comparisons exceed raster noise
and terminal/after frames are identical. This qualifies the sampled finite motion
behavior, not every possible scene or browser build.

The resize observations measured console widths of 292/372/492/732/972 CSS px.
Fixed 720/360 px images can clip in narrow consoles. Container examples preserve
their ratio and width cap across the observed contexts without another library
call. Actual image-text readability remains unknown. `container-experimental`
stays explicitly experimental; native captions and fixed/text paths remain available.

Each browser's owned-page font matrix contains 105 standard cases (72 compiled,
33 explicit size/readability failures) and fifty compact cases (forty compiled,
ten 280 px floor failures). Successful text remains within its artboard; no font
request occurs, and a supplied web-font set is declined. These page measurements
are separate from native DevTools and cannot prove a recipient's exact font.
The Chrome standard/compact reports predate final ornament-only safe-region
corrections; the fixture [output identity](output-identity.json) reconciles the
observed sample output with the final compiler. Final Edge reports use current source.

The [validation receipt](validation.json), [candidate](candidate.json),
[consumer receipt](consumers.json), [Bun check](bun.json), [bundle sizes](bundles.json)
and [legacy comparison](legacy-compatibility.json) retain distinct proof boundaries.
All 257 units pass; the final fifty-case page suite passes using installed Edge
152 Beta. JS/TS/React/Next/Bun consumers use exact packed artifacts. Complete compiler
size is 25,583 gzip bytes against the unchanged 25,600-byte budget. Fifty legacy
outputs are identical and 69 new option/recipe cases are rejected by the old reader.

## Excluded and superseded observations

- The Chrome 17:52 context report's two offscreen rows are invalid: its message
  never properly left/returned to the clipping area. Those rows and images remain
  in the archive. The 18:20 report replaces them with asserted hidden and fully
  visible returned geometry. Edge's 18:26 context report uses the corrected method.
- Twelve old website rows in the two main reports are superseded by the final
  [website qualification](../../website/2026-09-12/README.md). Pale CSS examples
  failed light-theme visual review and were corrected with opaque SVG output.
- New installed Edge 152.0.4191.51 Beta runs are not Stable qualification and are
  excluded from this archive. Earlier merged standard-card evidence already used
  actual 153 Stable and keeps its original scope.
- Blank first-run targets, guest-context failures, missing default Linux Playwright
  binaries and focus/setup failures are retained in local task logs, never counted
  as application passes. The final explicit profile and CDP runs succeeded.

Both independent product reviews and both final harness findings are closed.
Screen-reader review remains unobserved and nonblocking under ADR-0013. Current
CI/release stages belong to the [implementation receipt](../../../specs/responsive-fitting-implementation-evidence.md)
and [release ledger](../../../releasing.md).
