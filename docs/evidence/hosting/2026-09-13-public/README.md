# Public production observation

## Final package-pair website — September 13, 2026

The [final release receipt](final-release.json) identifies promoted artifact
`227a1e0e2dcf45d66fe9a52fcdd35b77cc12f8bdefe032fb7d29236b4fab5b22`, deployment
`dpl_D4D4s3vQDqEGWom52kzZascti5rb`. Build inputs come from `8793cae`; reviewed
source `9423f7e` merged in [PR #15](https://github.com/servrox/console-fx/pull/15)
as `2cbfce32`. Later source changes in that sequence were documentation only.
[Main CI](https://github.com/servrox/console-fx/actions/runs/34744613518) passed.
Both approved packages are published under `next`; the
[registry receipt](../../packages/2026-09-13/README.md) identifies their exact bytes.

The [protected check](final-protected.json) passed before final promotion; the
[public check](final-public.json) passed afterward against the same artifact.
Each verifies 49 static HTTP hashes plus the protected source map through separate
authenticated file-API evidence, security headers/routes, ten critical journeys,
the 44.5-second video and nine caption cues. The [executed harness](final-harness.mjs)
collects CSP events before each exercised navigation/reload, including the first
studio document. Both results have zero observed CSP violations, page errors and
failed requests. The receipt records its original command, input hashes and
environment; the archived script retains its original relative input paths.
No private access values or response bodies are archived. The temporary share
used for the protected check was revoked.

[Unauthenticated routing](final-routing.json) verifies 200 responses and final
landing/docs/studio/video hashes on both public domains. The immutable deployment
and existing preview return 302 to Vercel sign-in. The
[protection readback](final-protection.json) retains
`prod_deployment_urls_and_all_previews`. The
[official Stable feed check](final-stable-builds.json) confirms the existing
Windows Chrome 153.0.8010.36 and Edge 153.0.4234.32 qualification builds remain
current at the recorded time; this is not new DevTools rendering evidence.

Staging deviation: Vercel assigned the canonical alias despite `--skip-domain`.
Live hashes established the early assignment. The preceding verified artifact's
alias was restored, the new protected check completed, and the final artifact was
then explicitly promoted and both public aliases synchronized. Authentication
scope remained unchanged. Do not describe staging as isolated throughout.

The [completion audit](../../../specs/mvp-completion-audit.md) retains three
required external observations: developer study, physical-device performance and
Safari behavior. Publication/public access does not prove or waive them.
Screen-reader review remains nonblocking under ADR-0013.

## Earlier public-access change — preserved historical evidence

The maintainer explicitly approved “Approve public production; keep previews
protected” on September 13, 2026. Vercel Authentication changed from all URLs to
`prod_deployment_urls_and_all_previews`; the [readback](protection.json) records
public production domains and a still-protected individual deployment URL.
Password protection and Trusted IP settings were preserved. This explicit approval
resolved the earlier automatic-review rejection of the exact setting change.

The [public browser receipt](public-verification.json) covers immutable studio
`26f537cb5c06c57444b0076911e5e95c450dcce796320e6418521244dcb8b37a`, built from
`cc91f67fb6231b001908a6a1f7dee233db32b306` and verified against merged main
`c5a95cae3d5486dfc9b85ddce159b817cfec90e1`. Main CI 34735232063 passed.
Its earlier protected hosted checks and exact uploaded-file verification passed
before the public setting changed. No artifact rebuild or package publication
was performed by this protection change.

A new native Chrome context without a token or bypass verified 49 HTTP static
file hashes, a protected source-map hash through the authenticated file API,
security headers, routes, ten critical journeys, the 44.5-second usage video and
nine caption cues. No application errors or failed requests were observed.
Collected CSP buffers were empty, but the historical harness discarded the first
studio document buffer at reload. Its import, Undo and reset actions therefore
lack CSP event coverage in this receipt. A subsequent verification must collect
that buffer before reload; the original harness remains unchanged.
The journeys cover copying, single emission, invalid import recovery,
valid import/Undo, reset cancellation/focus return, draft reload and font workers.

This is a dated public-runtime observation of the identified artifact. The
package-status text in that build still reflected the earlier core-only release;
the separate registry-pair receipt supports its following documentation update.
Keep later artifact/readback evidence distinct. Screen-reader follow-up remains
nonblocking under ADR-0013; other unobserved environments retain their recorded
limits. Governing decisions: ADR-0006, ADR-0007, ADR-0009, ADR-0010 and ADR-0013.

The [exact executed harness](verify-hosted.mjs), command, input fingerprints and
Node/Playwright toolchain are identified in the receipt. It was run from the
repository root after placing that script beside the preserved artifact inputs
at `.artifacts/deployment/package-availability-final/`. Public mode skips its
optional protected-access branch; the source contains no credentials or access
links. The native host was Windows 11 Pro Insider Preview 10.0.26220, with Chrome
153.0.8010.36, driven from NixOS WSL2. This environment is recorded independently
from the artifact and the later source-only documentation update.
