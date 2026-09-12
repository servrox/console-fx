# Website integration evidence — 2026-09-12

The value-story and mandatory DOM/CSS experience slices are implemented and
independently reviewed. The [archive](observations.tar.gz), [manifest](manifest.json)
and [validation receipt](validation.json) retain native output, production page
tests, visual states and local performance as separate evidence. No website
effect enters a package, scene, standalone snippet or native console message.

The final fifty desktop/mobile-sized studio cases pass. They cover silent editing,
exact preview/export identity, clipboard rejection, recovery, transfer confirmation,
one undoable import, fitting/measurement, draft conflicts, keyboard/focus, reduced
motion, offscreen/visibility cleanup, static HTML and automated accessibility.
The final page suite uses installed Windows Edge Beta 152.0.4191.51; this is not
Stable renderer qualification or physical mobile evidence.

## Actual native output

Four native reports contain **36 rows**: six featured examples and three practical
guide samples, each in Light and Dark themes in actual Windows Chrome Stable
153.0.8010.36 and Edge Stable 153.0.4234.32 DevTools. Every row emits once with exact
compiled arguments and its complete native caption. Scenes, options, code and SVG
bytes are in `fixtures/`; original captures are in `native/` within the archive.

Light-theme inspection found pale CSS text on white in the SDK, development,
milestone and quiet-editorial examples. They now explicitly use their existing
opaque SVG surface. This is a deliberate adjustment to the original quiet CSS
proposal. The three public guide recipes use bounded explicit SVG fitting with
complete text fallback. Their exact displayed sources passed the [packed consumer
and TypeScript checks](recipes-consumer.json), including caller guards and framework
lifecycle behavior. Signature retains its CSS path; native badge recipes remain
available. The earlier six-case and pre-correction captures remain local historical
observations and are superseded for the final website claims.

## Visual states, motion and reflow

`states/` includes UX-01 through UX-09 across desktop and narrow contexts. UX-03
captures authored reveal states at 0/140 ms using a controlled pause, followed by
natural completion. They are state references, not a measurement of frame timing.
The storyboard receipt records exact selected/Unicode output identity and zero
real console calls. UX-10 is **not applicable — exhibit omitted**.

The native Chrome 200/400% browser-zoom receipt checks landing, studio and docs
reflow, then editing and Reset cancellation with text/focus preservation at 400%.
It uses Windows browser menu controls and measured DPR/viewport changes. This
receipt predates the final sample-only SVG/guide correction; its tested navigation,
editor, reset and layout behavior is unchanged. Simulated narrow viewports and
controlled animation states remain distinct evidence.

Missing IntersectionObserver is tested before hydration; app-owned constructor
failures are tested separately. A globally throwing constructor also breaks the
pinned Next.js 16.3.4 prefetch module before app recovery. That reproduced upstream
limitation is disclosed, with no false global-recovery claim or framework patch.

## Local performance

Foreground Chrome 153.0.8010.36 ran on a Windows 11 i9-13900K/RTX 4070 desktop at
239 Hz, with one 1440 px mouse and one 390 px touch-emulated sample per mode.
Raw compressed timeline traces include the ten-second idle and active intervals.
All final observations record visible/focused state and zero idle/active long tasks.

| Mode | Initial JS, gzip bytes | LCP, desktop / narrow | CLS, desktop / narrow | Active frame p95 |
| --- | --- | --- | --- | --- |
| Preserved pre-change page | 179,203 | 164 / 168 ms | 0 / 0 | 4.3 ms |
| Final page, effects enabled | 174,782 | 116 / 132 ms | 0.01074 / 0 | 4.3 ms |
| Final page, effects disabled | 174,782 | 128 / 140 ms | 0.01074 / 0 | 4.3 ms |

Initial JavaScript decreases by 4,421 gzip bytes. The effects-enabled/disabled pair
uses the same final source; scheduler/observer tests separately verify owned
callback cleanup. The before page has no Plain/Styled control, so its active task
is pointer movement rather than the final page's repeated selections. These are
local lab observations, not causal field-performance claims. Earlier occluded runs
with roughly 100 ms frame intervals remain local excluded setup evidence.

The requested integrated-GPU laptop, representative physical mobile, Safari,
Firefox and five-developer formative study remain unobserved. No participant
timings, success rates, consent or effects preference was invented. Screen-reader
review is a separate nonblocking follow-up under ADR-0013. Missing external
observations remain explicit items for promotion review.

## Release boundary

The [prepared deployment](deployment-candidate.json) and [artifact fingerprint](reviewed-artifact.json)
identify local bytes only. [Project preflight](project-preflight.json) confirms the
personal ConsoleFX project and authentication on all URLs. Its current Git-linked
production attempt is in ERROR; that is not a successful deployment of this candidate.
The repository's `apps/studio/vercel.json` disables automatic Git deployments so
source merges do not publish unreviewed builds. It follows [Vercel's documented
configuration](https://vercel.com/docs/project-configuration/git-configuration#turning-off-all-automatic-deployments).
Upload, hosted checks, promotion and npm publication retain the [release ledger](../../../releasing.md)
and ADR-0010 exact-artifact authority gates.
