# Architecture and usage-video hosted verification

Observed on 2026-09-13. The maintainer requested that the complete current website
be live in `servroxs-projects/console-fx` and explicitly approved the prepared
video artifact and public evidence upload. This receipt is separate from the
frozen [116-file local archive](../../architecture/2026-09-13/README.md).

Source: `5d969822c4a841859289e31a029b30e81c57d4af`; its application/build inputs
match the qualified video candidate, and main CI 34728723330 passed.
Studio fingerprint: `a2c2b4ebc70773259faa9676dc2e8fc3932e3b3706edd1f5bda9af5b9ffea0e7`.
Archive SHA-256: `4a0e6268c504dfae9dbb219d0bca75336bccbf04fd1401a6c4d29232a8419a64`.

[Deployment dpl_GXSRqSSFKokKYKDeohT4zBkfEhfH](https://vercel.com/servroxs-projects/console-fx/GXSRqSSFKokKYKDeohT4zBkfEhfH)
was created from the verified static output with domain assignment skipped, then
explicitly promoted without rebuilding. [Uploaded-file readback](upload-readback.json)
matches all 51 expected hashes, including routing configuration. The deployment
is READY; production authentication still covers all URLs at this checkpoint.
The requested change to public production domains is pending explicit approval
after automatic approval review rejected changing the authentication scope.

[Hosted native Chrome verification](hosted-verification.json) passed 49 HTTP
static-file hashes and security headers; the protected source map's bytes were
verified through the authenticated Vercel file API. The 44.5-second video plays
with nine English caption cues and an adjacent transcript. Editing, one explicit
console test, complete copying, invalid import recovery, import/Undo, Reset
cancellation/focus return, draft reload, local font measurements, documentation
navigation and 390-pixel reflow passed. There were no page errors, failed requests
or CSP violations. Narrow viewports are emulated, not physical-device evidence.

The core package's public registry bytes now match approved hash `61672e00…` at
version `0.1.0`. The registry exposes both `next` and `latest`; no tag was changed
by this deployment task. The React package still needs its browser verification,
so registry-consumer validation and install call-to-action updates remain pending.

Recovery: retain the prior verified protected deployment
`dpl_GVuSXcTqLDQLkJdmMjUzR68X2XzS`. Restore all-URL authentication before recovery
if a later public check fails. Physical-mobile, integrated-GPU laptop, Safari and
formative developer-study observations remain unobserved follow-ups; no new
compatibility, usability or performance claim is made. Screen-reader review is
nonblocking under ADR-0013.

Governing decisions: ADR-0006, ADR-0007, ADR-0009, ADR-0010 and ADR-0013.
