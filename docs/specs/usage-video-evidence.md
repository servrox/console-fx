# Website usage walkthrough

The maintainer requested a website video showing usage, followed by review and
fixes until no findings remain. The landing page now includes an actual studio
recording, native playback controls, English captions and an adjacent transcript.
It never autoplays; `preload="none"` keeps video bytes out of initial navigation.
The dated caption distinguishes the recording's package status from later releases.

The recording shows editing, RGB split/plain comparison, one explicit console
test, complete clipboard export, confirmed playground transfer, a further edit
and its updated export. It preserves the real confirmation dialog. The page
preview is identified as approximate; this video is not DevTools qualification.
ADR-0002, ADR-0004, ADR-0006, ADR-0007, ADR-0009 and ADR-0013 govern these contracts.
No public API, document schema, dependency or ADR changed.

## Media and provenance

- Captured on 2026-09-12 in native Windows Chrome **153.0.8010.36** from the built
  `c1a0427` studio, before inserting the walkthrough into the landing page.
- Actual local flow: one observed console entry and two complete clipboard
  readbacks. Edits and copying stay silent. Isolated context; sample data only.
- Both formats are **44.5 seconds**, **1440 × 960**, and have no audio track.
- MP4/H.264: **726,057 bytes**. WebM/VP9: **972,138 bytes**. WebP poster:
  **50,952 bytes**. Caption file: **815 bytes**.
- Original screen capture and authored instructions; no stock footage, music,
  generated UI, external player, tracking, or embedded font binary.
- Assets live in `apps/studio/public/media/`. The reproducible capture harness
  is [record-usage-video.mjs](../../scripts/record-usage-video.mjs). It requires
  an already-running isolated Chrome CDP session and a local production server.
  Encoding uses the existing Nix-managed FFmpeg **8.1.2**, without a new dependency.

## Review closure

| Finding | Fix | Result |
| --- | --- | --- |
| Acquisition failures could bypass recorder cleanup, and context-close failure could skip disconnect. | Context/page acquisition is guarded; browser disconnect runs in a nested `finally`. | Standards re-review: closed. |
| Background capture rejection could escape before cleanup. | Attach rejection handling immediately, stop capture, and propagate the saved error before writing success evidence. | Standards re-review: closed. |
| Recorded publication wording could become stale after npm publication. | Date the footage's release status explicitly. | Spec re-review: no current mismatch. |

The final independent reviews report **zero Standards findings and zero Spec
findings**. These are source/media observations, separate from playback tests.
Browser validation, exact candidate hashes and CI are recorded in the
[architecture receipt](architecture-improvements-evidence.md).

The earlier approved `298aaa32…` Vercel preview does not contain this newer video.
Publication and deployment status must follow the [release ledger](../releasing.md).
