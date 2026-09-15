# Six architecture passes and usage video — local receipt

The [implementation receipt](../../../specs/architecture-improvements-evidence.md)
records exact source/candidate identities and the result of each validation layer.
All six requested architecture passes and subsequent review corrections are closed.

The [archive](observations.tar.gz) contains 116 evidence files. Its
[manifest](manifest.json) records the archive SHA-256 and each member's size/hash;
every member was read back and independently verified after writing. It contains
source hashes, local validation logs, exact consumer environment and harness
hashes, candidate receipts, native page captures, output-parity fixtures, the
video recording receipt and separate review closure. Authentication material and
temporary HTML review reports are excluded. Source hashes describe the reviewed
source commit; later evidence-only documentation is outside that snapshot.

## Validation and interpretation

The final local gate passed 292 unit and 25 release/artifact tests, full
format/lint/type/build/package/bundle checks, fresh packed JS/TS/React/Next consumer
checks and three native Edge consumer journeys. The original bundle ceilings
remain: CSS 9,670 / 10,240 gzip bytes and complete compiler/SVG 25,558 / 25,600.

Native Chrome **153.0.8010.36** passes all 74 final studio cases. Firefox
**155.0** passes the full 72-case architecture suite plus both new video cases in
a separate run. Native Edge **153.0.4234.32** passes all 38 affected architecture
cases plus both new video cases separately. The final video tests verify deferred
loading, keyboard play/pause, real playback dimensions/time, English captions and
the text alternative. The original recording is 44.5 seconds and has no audio.

The native Windows browser builds match the dated prior qualification. The earlier
OS observation was Windows 11 Pro Insider Preview, 25H2 build 26220.9223; this
receipt does not claim a fresh OS or Stable-feed probe. Firefox ran headlessly
under NixOS WSL using the existing task-local browser and Nix libraries. Narrow
viewports are emulation. Chromium clipboard journeys read back real text;
Firefox journeys observe completed native writes and exact payloads. Error/race
regression fixtures intentionally inject failures.

The initial sandbox unit run's subprocess restrictions are preserved separately
from the successful permitted run. The initial video-inclusive Chrome suite had
three screenshot timeouts; focused reruns reproduced them. With trace screenshots
disabled, all four isolation cases passed. The final harness restricts tracing to
the owned context, disables screencasting and suppresses imported-context ARIA
fallback. Eight affected repeated journeys and the complete 74-case suite pass.
The diagnostic probe deliberately fails after closing its page: archive inspection
confirms one owned context, retained actions, zero screencast frames and no fallback
page snapshot. That expected failure is not an application failure.

Earlier and final Chrome captures have separate archive directories. The earlier
tree also retains the 12 UX-03/05/06 storyboard images and completion receipt from
**2026-09-12 18:39**, before these architecture passes. They are inherited historical
evidence, omitted from the final capture tree and not claimed as new captures. The
output-identity receipt establishes 411 exact comparisons across 187 fixtures
against the approved PR #10 package. It justifies reuse of unchanged earlier
[fitting](../../fitting/2026-09-12/README.md),
[card](../../cards/2026-09-12/README.md) and
[DevTools](../../devtools/2026-09-12-cinematic/README.md) qualification within their
recorded scope; page screenshots and playback are not new DevTools evidence.

## Standards review

Zero remaining actionable findings. Duplicate transition resets and both recorder
cleanup/rejection issues were fixed. Native diagnostics retain useful evidence
without capturing imported browser tabs. No worthwhile heuristic concern remains.

## Spec review

Zero remaining findings. The proposed catch-to-static standalone change was
withdrawn and the approved no-IIFE grammar restored. The usage video preserves the
real playground confirmation and dates its publication-status wording. Public APIs,
document recovery, output semantics and separate release authority are preserved.

Remote CI, merge, registry installation and deployment are separate from this frozen
local archive. The older approved studio's successful hosted check is recorded in
the [hosting receipt](../../hosting/2026-09-13/README.md). The architecture/video
candidate itself has not been published or deployed by writing this receipt.
