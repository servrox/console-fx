# Reference examples evidence

September 13, 2026. Scope: the fourteen editable examples mapped in the
[integration receipt](../../../specs/reference-examples-integration.md), plus
the experimental container-caption regression. This records local observations;
CI, deployed behavior and publication remain separate stages.

## Native Windows Console observations

Windows 11 Pro Insider Preview 10.0.26220; native 100% DevTools zoom, device pixel
ratio 1. Browser versions were checked against the official
[Chrome for Testing Stable feed](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json)
and [Edge Stable feed](https://edgeupdates.microsoft.com/api/products?view=enterprise)
on the observation date. These are dated results, not a claim about future builds.

| Browser | Static light/dark | Finite motion, dark | Container caption, light/dark |
| --- | --- | --- | --- |
| Chrome 153.0.8010.36 | 28 pass | 2 pass | 2 pass |
| Edge 153.0.4234.32 | 28 pass | 2 pass | 2 pass |

[native-evidence.tar.gz](native-evidence.tar.gz) retains the original fixtures,
observations, image crops and full Console captures from all six successful
runs. [manifest.json](manifest.json) records each archived file's size/hash and
the archive hash. [review.json](review.json) records the later visual review and
current fixture parity; the original observation statuses remain unchanged.
The [review sheets](review/) arrange unaltered native crops and finite-motion
frames with labels outside the images.

Every recorded emission made exactly one call with the complete compiled
arguments and caption. All fourteen static examples were visually inspected in
both themes and browsers: text remains readable within each image, tables and
ASCII use aligned monospace text, and authored backgrounds retain contrast.
The boxed example intentionally uses separate editable text rules. Fixed SVG
output retains the existing inline caption layout: its first caption line may
appear beside the image, with remaining lines below. The corrected experimental
container layout puts the complete caption below the carrier without overlap;
DOM Range measurements and full Console captures verify this separately.

Both 4.8-second motion examples change early frame pixels and have identical
settled frames after 5.2 and 6 seconds. All sixteen motion frames were inspected
for clipping/readability. Motion stays static initially and remains labelled
experimental; these two sample observations do not qualify arbitrary animation
profiles, long sessions, other OS builds or physical-device performance.

The harness used only owned blank localhost fixtures and their native DevTools,
restored themes and closed owned targets. Edge required a fresh temporary
profile with `--enable-automation --no-startup-window --disable-sync` to avoid
first-run startup UI. No existing signed-in profile was used. Earlier connection
failures and Edge 152 observations are excluded from the successful Stable set.
The archive contains only public sample scenes, generated code, this owned
Console surface and environment metadata; no credentials, sharing secrets,
unrelated tabs or private application data are included.

## Local integration checks

- 312 unit tests, 29 release/artifact checks, build, formatting, lint and types.
- Tarball inspection and unchanged gzip budgets: CSS 9,754 / 10,240 bytes;
  complete compiler 25,596 / 25,600 bytes.
- Packed JS, TS, React and Next consumers, including three Chrome journeys.
- 24 Chrome website journeys and a later 32-case Edge desktop/mobile run.
  The latter includes existing card/editor/cinematic flows and all new examples,
  motion controls, exact preview/export, copy, Undo and draft recovery.
- Desktop/mobile gallery captures inspected; no horizontal overflow.
- Independent Spec and Standards reviews: zero remaining actionable findings.

`review.json` binds these observations to the catalog/lockfile hashes and records
the later current-compiler comparison. Source and harness revisions in the raw
observations identify their individual capture checkpoints. Recompilation of all
34 captured fixtures matches every output object and exported code exactly.

The first PR CI run exposed a shared gallery CSS-class identity that made old
gallery selectors open the new collection. Separate identities fix the collision;
the existing tests are preserved. No new npm package has been published: the core fixes
have a pending patch changeset, while published 0.1.0 bytes remain unchanged.

## CI and protected preview

[CI run 34771557998](https://github.com/servrox/console-fx/actions/runs/34771557998)
passed on `4d4457386f0e56a73e4e2dd132c791a8e9da5adc`: source/package gates,
312 unit tests, 29 release checks, all 86 studio browser journeys, and packed
consumers including three Next browser journeys. This later checkpoint supersedes
the failed initial gallery run. Subsequent changes in this receipt are documentation
only; final merge checks and production identity are recorded on
[PR #21](https://github.com/servrox/console-fx/pull/21).

The [hosted preview receipt](hosted-preview.json) records the same Git revision in
`servroxs-projects/console-fx`, deployment `dpl_C7ghnv2Ef2AfWjWH6FXSrRwqnZtx`.
Sixteen journey groups passed on native Edge, including all fourteen gallery
previews and exact recipe exports/Undo at 1440 and 390 px, both motion controls,
the existing Useful examples, import recovery, reset cancellation, saved drafts,
font measurements, documentation and the 44.5-second captioned usage video.
Forty served assets/HTML documents were fingerprinted and checked against the
prepared security headers. No page errors, failed requests or CSP violations
were observed. This is a Git rebuild, with served-byte evidence separate from
the local/CI artifacts; it is not a claim of identical build output across hosts.

[Temporary access was revoked](preview-protection.json) after the checks.
Anonymous preview access redirects to Vercel Authentication. Production promotion
and post-merge main CI remain later observations at this checkpoint; the existing
GitHub connection deploys authorized merges on `main`.

The [full-spec audit](../../../specs/mvp-completion-audit.md) still has three
unobserved external checks: developer sessions, physical laptop/phone performance
and real Safari journeys. Screen-reader review is nonblocking under ADR-0013.
