# Website experience implementation

Status: implemented and independently reviewed, 2026-09-12. Local performance,
interaction and visual-state evidence is saved; unobserved platforms remain explicit.
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

Missing IntersectionObserver support is covered before hydration. Constructor
failures are injected into the application's optional observers while preserving
Next.js 16.3.4's shared prefetch observer. A globally throwing constructor during
module evaluation also breaks the pinned Next router before application recovery
can run (`next/dist/client/components/links.js`); this separate upstream limitation
was reproduced and is not reported as a passing recovery case.

No upstream source was copied. No GSAP, Motion, GPU/ASCII exhibit, external fonts,
visual assets or new dependency was added. UX-10 and UXR-13 are **not applicable —
exhibit omitted**. The package tarballs and generated exports contain no website
effect implementation.

| Criteria | Evidence boundary |
| --- | --- |
| UXR-01–03 | Complete static HTML is covered by the final Edge Beta page suite; immediate selection and bounded reveal also have native Chrome storyboard evidence. |
| UXR-04–10 | Keyboard/touch-sized interaction, effects policy, exact output identity, clipboard failure, transfer recovery and quiet editor behavior are covered by website/studio tests. |
| UXR-11 | Original DOM/CSS source is app-local; no third-party effect source or dependency was adopted. Packed core/React allowlists and dependency checks pass. |
| UXR-12 | The durable archive preserves before/after and effects-off initial-load, ten-second idle and active traces. Foreground desktop lab samples meet the measured load/idle budgets. The requested integrated-GPU laptop and physical mobile remain unobserved. |
| UXR-13 | Not applicable — exhibit omitted. |
| UXR-14 | Owned scheduler/observer spies verify idle, preference/visibility changes and navigation cleanup. All fifty final studio cases pass, including offscreen reveal cleanup and deferred observer failure recovery. |
| UXR-15–16 | Page copy distinguishes approximate CSS, SVG images, experimental container sizing and pending publication. UX-01 through UX-09 captures and state metadata are saved. UX-03 controlled 0/140 ms frames show authored states; natural completion and scheduler tests provide separate lifecycle evidence. |

The [durable website evidence](../evidence/website/2026-09-12/README.md) contains
the measurements and their exact scope. Foreground Chrome 153.0.8010.36 observations
used 1440 px mouse and 390 px touch-sized contexts on Windows 11, an i9-13900K and
RTX 4070 desktop at 239 Hz. Each mode has one sample per viewport, not field data
or a physical mobile/laptop result. Raw timeline traces accompany the load, idle
and active observations. Scheduler tests establish owned callback cleanup; absence
of long tasks alone would not prove zero recurring callbacks.

The earlier occluded-window run measured roughly 100 ms frame intervals and is
retained as excluded setup evidence. Foreground runs record visible/focused state;
there is no claim that the earlier run passed the 16.7 ms goal. The final values
are listed in the archive's README and machine-readable performance receipts.

Native Chrome browser zoom at 200% and 400% retained landing/studio/docs reflow;
400% editing and Reset cancellation preserved text and focus. This uses actual
Windows browser controls and measured viewport/DPR changes. CSS viewport simulation
is recorded separately. The six final featured snippets have their own native
Chrome/Edge light/dark captures; page effects never alter their compiler output.

Safari, Firefox, a representative physical mobile device and the requested
integrated-GPU laptop remain unobserved. The five-developer effects-on/off comparison
is unperformed. These are open external validation items for promotion review;
no local or agent result substitutes for them. Screen-reader review is separately
nonblocking under ADR-0013. No optional GPU exhibit or upstream source was adopted.

ADR-0002, ADR-0004 through ADR-0010 and ADR-0013 govern this app-local implementation.
