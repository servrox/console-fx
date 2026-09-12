# Website experience implementation

Status: implemented; final performance and review evidence in progress, 2026-09-12.
This implements the mandatory DOM/CSS slice of the [experience specification](website-experience-redesign-spec.md)
alongside the [value-story integration](website-value-implementation-evidence.md).

The existing dark surfaces, restrained cyan accent, Arial text and Consolas utility
type remain. Original app-local components provide a 280 ms Plain/Styled reveal,
stationary semantic card controls with a small inner-surface lift, and a pointer
light coalesced into one pending animation frame. Essential selection changes
immediately. Page effects are transient and separate from scene motion. Unknown
or reduced motion, Effects off, document visibility loss and unmount stop owned
decoration; offscreen reveals/cards cancel. No effect wraps editor inputs or code.
Observers and callbacks are owned by mounted components and cleaned up explicitly.

No upstream source was copied. No GSAP, Motion, GPU/ASCII exhibit, external fonts,
visual assets or new dependency was added. UX-10 and UXR-13 are **not applicable —
exhibit omitted**. The package tarballs and generated exports contain no website
effect implementation.

| Criteria | Evidence boundary |
| --- | --- |
| UXR-01–03 | Complete static HTML, immediate semantic selection and bounded reveal are tested in Windows Chrome. |
| UXR-04–10 | Keyboard/touch-sized interaction, effects policy, exact output identity, clipboard failure, transfer recovery and quiet editor behavior are covered by website/studio tests. |
| UXR-11 | Original DOM/CSS source is app-local; no third-party effect source or dependency was adopted. Packed core/React allowlists and dependency checks pass. |
| UXR-12 | Functional pre-change build and initial-load measurements are preserved under `.artifacts/website/before/`. Final incremental JS/idle/active comparison remains pending. Earlier frame samples were around 100 ms and are not a 16.7 ms pass. |
| UXR-13 | Not applicable — exhibit omitted. |
| UXR-14 | Owned scheduler/observer spies verify idle, preference/visibility changes and navigation cleanup. Final regression rerun includes the added offscreen reveal cleanup. |
| UXR-15–16 | Page copy distinguishes approximate CSS, SVG images, experimental container sizing and pending publication. UX-01/02/04/07/08/09 captures exist; remaining prescribed state captures and final artifact receipt are pending. |

The initial comparison used one native Chrome run per desktop/mobile-sized viewport,
without claiming actual mobile hardware. Final performance receipts must record
browser/hardware/viewport and keep before/after JS, idle work and active frame
observations distinct. Safari, Firefox and a representative physical mobile device
remain unobserved. Screen-reader review is a nonblocking ADR-0013 follow-up.

ADR-0002, ADR-0004 through ADR-0010 and ADR-0013 govern this app-local implementation.
