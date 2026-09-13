# Public production observation

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
