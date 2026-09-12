# Launch improvements — implementation receipt

All eleven items in the [improvement list](../../../specs/launch-improvements.md)
are implemented. This receipt records local evidence for branch
`feat/console-fx-launch-polish`, based on merged commit
`3316574868716ac673e1e3ba73e9da272aaa9c30`. It does not claim npm publication,
registry installation, a Vercel upload or remote CI success.

The [archive](observations.tar.gz) and [per-file manifest](manifest.json) preserve
the validation logs, native captures and fixtures, exact consumer environment,
candidate identities, changed-source hashes and review closure. Every archived
file was read back and hash-verified. Absolute native capture paths in the original
reports resolve by basename within `native/chrome/` or `native/edge/`.

## Local validation

| Check | Result and scope |
| --- | --- |
| Source and build | TypeScript, ESLint, Prettier, package/studio production builds and package checks pass |
| Unit and release contracts | 260 unit tests and eight release-verifier tests pass |
| Bundle budgets | CSS 9,670 / 10,240 gzip bytes; complete compiler and SVG 25,558 / 25,600; original budgets retained |
| Installed consumers | Fresh exact-tarball JS/TS/React/Next checks and three browser journeys pass; four environment files and all harness hashes independently verified |
| Native Chrome studio | Full 68-case suite passed before the final confirmation-dialog guard; all 22 affected recovery cases passed after that guard; both corrected control-character fixture cases also pass |
| Native Edge studio | All 22 affected final recovery cases pass |
| Firefox studio | 70 of 72 cases passed initially; the two control-character fixture failures pass on focused rerun after supplying the exact raw input. All 72 cases have passing coverage |
| Unchanged outputs | 411 compiled-output, standalone-export and font-preflight comparisons across 187 fixtures match the prior merged package exactly |
| Protected checkout | Original root HEAD, Git index and 205 file hashes unchanged |

Chrome is **153.0.8010.36** and Edge is **153.0.4234.32**, the versions in the
archived dated Stable-feed receipt. Native observations ran on Windows 11 Pro
Insider Preview, 25H2 build **26220.9223**. The OS caption and registry build are
archived separately; the registry retains the older Windows 10 product-name string.

Firefox is Playwright's **155.0** build, run headlessly under NixOS WSL with a
task-local browser download and existing Nix GTK/ALSA libraries. Initial platform
override and missing-library setup failures are preserved separately from the
successful browser run. Chromium clipboard tests read back actual clipboard text;
Firefox tests observe successful native clipboard writes and their exact payload.
No successful write is mocked in those consumer journeys. Denial/race regressions
deliberately inject failures. Narrow viewports are emulation, not physical mobile.

The Firefox control-character failure came from keyboard insertion consuming
Escape before the app received it. The corrected fixture uses the native input
value setter and an input event to deliver the exact untrusted value. Both engines
then retain the invalid draft and disable output as required. No app validation
was relaxed to pass that check.

## Actual DevTools and unchanged qualification

Eight affected Unicode cases per native browser produce **16 passing rows**.
WORD JOINER and zero-width no-break space remain joined across single/styled runs
at 130 px. A 70 px request returns caller-authorized complete text fallback. Each
row emits once with exact arguments and preserves the full native caption; sampled
SVG images retain both letters in one row. Captures come from the actual DevTools
frontend, not reconstructed page previews.

The earlier [fitting](../../fitting/2026-09-12/README.md) and
[website](../../website/2026-09-12/README.md) qualification retains its original
scope. The recorded output-identity checks justify reuse for unchanged fixtures.
The historical 456-comparison in-memory preflight experiment is also archived,
explicitly distinguished from the final packed-candidate comparison.

## Candidate identities and remaining release work

| Artifact | SHA-256 |
| --- | --- |
| `@servrox/console-fx@0.1.0` tarball | `61672e00d7a57829085d71836ede22bbc99cfb8350b067bd3f2c17ced5886592` |
| `@servrox/console-fx-react@0.1.0` tarball | `eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c` |
| Source lockfile | `a9aeac3691f826646112a9e7ba3ecc45e0fac8e5d0c3a90a0c46bda7a13c0497` |
| Prepared local studio fingerprint | `298aaa327fe4fbd0f8ca0e61a36bf332c70d637b0ae1a9ab768ff688a2cf23f3` |

The studio fingerprint is SHA-256 of compact JSON containing the ordered candidate
`files` and `configSha256`. Its 46 static files use five inline-script CSP hashes.
The reviewed build remains local. The earlier `aa7a9211…` studio artifact is a
different candidate and does not authorize upload of these bytes.

`pnpm run test:registry-consumers` is implemented and its negative trust tests pass.
It cannot observe registry installation before publication. It verifies exact names,
versions, SHA-512 metadata and downloaded SHA-256 bytes before granting only those
exact versions an age exception. Registry installs have no local override; separate
receipts archive their dependency graph. The archive here contains the successful
local-tarball graph and generated public registry URLs, never user credentials.

The existing CI workflow will archive the same consumer graph for independent
readback. CI and merge results are recorded on the PR and in the release handoff,
separately from this frozen local receipt. Physical mobile, integrated-GPU laptop,
Safari and the five-developer study remain pending external promotion observations.
Screen-reader review remains nonblocking under ADR-0013.

## Standards review

No remaining actionable violations or worthwhile heuristic concerns. Consumer
archive hashes match; no authentication config is copied; registry installs have
no local override. Reviewed recovery and fitting corrections preserve their contracts.

## Spec review

No remaining findings. The initially identified shared-confirmation import race is
closed for shared, Reset and example dialogs, including late success and failure.
Independent JSDOM checks and the separate native-browser regressions verify that
cancellation preserves work and subsequent imports retain Undo.

Governing decisions: ADR-0002–0010, ADR-0013 and ADR-0015. Accepted ADR-0012/0014
visual references remain unchanged. No new ADR or acceptance change was required.
