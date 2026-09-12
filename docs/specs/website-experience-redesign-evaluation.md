---
title: "ConsoleFX — a tactile, expressive website without the effects-demo trap"
status: "proposed; source-based evaluation"
created: "2026-09-12"
repository: "servrox/console-fx"
inspected_revision: "15bb758a79d2af1d5b5da4c3db7656d1cbd494de"
initial_inspected_revision: "3c42e12d705b044809c05579f762bcb8c137890a"
artifact_path: "docs/specs/website-experience-redesign-evaluation.md"
---

# An interactive console workbench, not a wall of effects

## Recommendation

Make the page feel like a beautifully built developer instrument: matte dark surfaces, clear typography, tactile controls, and one memorable plain-to-styled reveal. Use Canvas UI and React Bits as a curated source of interaction ideas and selected, reviewed components, not as a new site-wide rendering stack.

The hierarchy should be **understand the product → reveal a result → try a useful example → edit → copy or adopt**. This extends [PR #5's value story](https://github.com/servrox/console-fx/pull/5), rather than replacing professional use cases with spectacle. The implementation proposal is in [the companion specification](website-experience-redesign-spec.md); [the interaction storyboard](../mockups/website-experience-v1/storyboard.md) describes the target states.

This is an evaluation of repository source and current primary-source component documentation/source, not a tested redesign. No live ConsoleFX usability study, GPU comparison, browser-rendered review of the inspiration sites, or performance measurement was completed. Some individual Canvas documentation pages exceeded the retrieval limit; the provider's pinned repository, component catalog, rendering guide and Peel source were used instead. Product-design conclusions below are recommendations, not measured conversion claims.

## What the current implementation offers

The [landing/editor component](../../apps/studio/src/features/editor/studio.tsx) renders a compiler-backed hero, grouped preset previews and a complete editor. The review began with nine basic presets; the final baseline also includes the merged cinematic implementation. Its shared document/compiler path is an asset worth preserving. However, the initial visit resembles a catalog followed by a tool: attractive output is present, but discovery, selection and successful export could feel more connected.

The [CSS tokens](../../apps/studio/src/app/globals.css) already establish the right visual base: dark neutral surfaces, inset controls, cool readable text, cyan, and restrained opposing shadows. Do not replace this with purple gradients, glowing panel outlines, particles across the page, or a new theme framework.

PR #5 separately proposes purposeful examples, safe demo-to-editor transfer, format-aware copying and honest adoption messaging. That remains the content/workflow foundation. PR #3's card-design specification has since merged and its presentation decision is accepted; card runtime implementation is still a separate concern. PR #4's console-fitting proposal likewise remains separate from this redesign. A responsive page preview is not a responsive native console.

### Final baseline refresh

Before creating this PR, `main` advanced from `3c42e12` to `15bb758`. The intervening diff, current grouped gallery and architecture index were rechecked. Preserve the new cinematic presets, renderer restoration on undo/import, draft fixes, accepted card references and release evidence. ADR-0012 is now Accepted; ADR-0011 is Superseded by Accepted ADR-0013, which keeps representative screen-reader review as a nonblocking follow-up while retaining the other accessibility requirements. The merged card-presentation record is now ADR-0014. Do not reuse the older proposal-branch numbers as current governance identities. This PR adds only its own documents and leaves that work intact.

## Design direction: three levels of attention

**The frame is quiet.** Keep navigation, documentation, forms and source code ordinary semantic HTML. Raised surfaces, crisp inset fields and a restrained cyan focus/selection system create material depth without visual noise. Use large readable headings and generous spacing rather than decorative text animation on every title.

**The result is expressive.** One large console stage uses actual `ConsolePreview` output. Visitors choose Signature, Development context or Summary, then compare Plain and Styled using the same facts. A short, user-triggered two-layer reveal makes the transformation memorable. The final preview is unchanged compiler output, not a shader-enhanced promise the exported log cannot reproduce.

**The feedback is precise.** Preset hover, selection, tab changes, copy success and recoverable failure receive different, short feedback. Motion confirms an action; it never delays the action or substitutes for a visible state. Copying a failed clipboard operation must never produce a success burst.

## Component shortlist and disposition

The inspected React Bits source is pinned to `3a1c7f2f9f94ed833934ab5c2635760b9e644583`; Canvas UI to `49ae4d99244f36a794a4c02cfd756c6a17319d21`. Source-copy components are not necessarily dependency-free or suitable unchanged. Exact pins are review evidence, not permission to install them.

| Inspiration / candidate | Replace or enhance | Recommendation and required adaptation |
| --- | --- | --- |
| [React Bits SpotlightCard](https://reactbits.dev/components/spotlight-card) | Flat example/use-case cards | **First choice for adoption review.** The TS-CSS registry has no added dependencies and moves a radial highlight through CSS variables. Retain the real button/link semantics, a visible static keyboard focus, and suppress pointer tracking for reduced-motion/coarse-pointer users. Restrict cyan highlight to a faint surface response; batch pointer writes and isolate them from scene compilation. |
| [React Bits TiltedCard](https://reactbits.dev/components/tilted-card) | Hero showcase frame | **Adapt the idea, not the default component.** Source is image-oriented, imports `motion/react`, uses sizable hover scale/rotation and has a desktop-oriented warning. A compiler preview is not a generic image card. Use a small app-local transform on the outer showcase frame, at most 2 degrees and no hover zoom, returning flat before comparison/editing. Controls and exact comparison stay flat. Do not add Motion only for this. |
| [Canvas UI Peel](https://canvasui.dev/docs/components/peel) | Static Plain/Styled switch | **Use the reveal concept in the baseline; gate the literal GPU component.** Implement an original DOM/CSS mask/edge reveal over two real preview layers, with explicit buttons. Peel's source samples live HTML through the experimental canvas path. The essential comparison must work without that capability. An optional fidelity trial must not hide the lower layer when initialization fails. |
| [Canvas UI ASCII Sweep](https://canvasui.dev/docs/components/ascii-sweep) / [React Bits DecryptedText](https://reactbits.dev/text-animations/decrypted-text) | A small decorative transition accent | **Optional, tightly bounded motif.** A short monospace flourish on explicit style selection can evoke compilation. Never scramble the H1, user text, commands, code or status announcements. DecryptedText's inspected source uses `motion/react`, intervals and UTF-16 splitting; its screen-reader span follows changing display text. A direct adoption needs stable accessible text, correct text boundaries, cleanup and a reduced-motion path. Prefer a tiny original fixed-glyph decoration for the first slice. |
| [React Bits ClickSpark](https://reactbits.dev/animations/click-spark) | Copy-success affordance | **Adapt, do not paste as a page wrapper.** Its inspected source schedules animation frames while mounted even without active sparks, and triggers on any bubbled click. Use a small one-shot CSS/SVG tick burst only after resolved copy success, with centered keyboard feedback and an ordinary live status. No full-page canvas or persistent idle loop. |
| [Canvas UI ASCII Object](https://canvasui.dev/docs/components/ascii-object) | Optional standalone brand-art exhibit | **Optional later experiment.** The provider distinguishes object effects from HTML-in-Canvas, but the WebGL object path adds `three`. A single opt-in, lazy WebGL2 island could turn an original `>_` mark into a four-second ASCII sculpture. Keep it outside every exact output preview, label it website decoration, use a static poster fallback, and omit it if source, license or cost checks fail. WebGPU is not required. |

Do not use full-page Liquid, Shatter, Glyph Rain, moving backgrounds, scroll hijacking, magnetic copy buttons, auto-rotating cards, or code text reveals. Those may be compelling demos on the source sites; here they obscure the product, interrupt reading, or fight precise editing. The proposal deliberately spends visual complexity on one result and successful task completion.

### Source findings that change the adoption plan

1. **HTML-in-Canvas and GPU availability are different gates.** Canvas UI documents fallback behavior and a domain-bound origin trial for live HTML effects. Chrome's cited introduction describes an early Chrome 148–150 trial, not permanent availability for every later browser. Do not infer support from the demo working on canvasui.dev. Verify the deployed artifact's feature checks; no flag or token enrollment is required for the proposed baseline.
2. **The two libraries are not plain-MIT component bins.** Both inspected licenses identify MIT + Commons Clause terms and distinguish use inside applications/sites from redistribution of the components themselves. Record source/license provenance and review the planned app-source distribution before copying. Do not relicense copied material as ConsoleFX MIT, expose it as a downloadable component collection, put it in either npm package, or export it inside a console snippet. This is a supply-chain review requirement, not a legal opinion that this project's use is pre-approved.
3. **A webpage effect is not a console capability.** GPU scene wrappers, pointer trails and CSS transition overlays belong only to the website. The terminal samples and Test/Copy actions still use the existing compiler output. A clear distinction avoids selling an effect that disappears when the user pastes the code.
4. **A drop-in still needs integration work.** The inspected card and text effects need semantic wrappers, keyboard/touch alternatives, stop conditions, lifecycle cleanup, scoped styling and possibly source adaptation. A registry CLI can write files, dependencies and configuration; it should not initialize Tailwind/shadcn or upgrade the workspace incidentally.

## Revised page composition

At desktop widths, pair a short editorial hero on the left with an interactive console stage on the right. Keep the stage larger than the decorative framing. Below it, show six purpose-led example cards in a regular grid, followed by three restrained professional use-case comparisons. Bring a compact editing workbench and its export controls into the same flow; offer `/studio/` for uninterrupted work. Finish with the standalone/package adoption choice and compatibility/release evidence.

The mobile design is not a shrunken desktop dashboard. Put the explanation, stage and primary action in reading order; render two-state comparisons as buttons, cards as a vertical grid, and customization panels as disclosure sections. A compact export dock must respect safe areas, virtual keyboards, focused fields and footer content. Nothing requires hover, dragging or a GPU.

The visual system should have two modes: **Showcase** for discovery (one deliberate reveal and subtle card affordances), and **Workbench** for concentration (no tilt, spotlight tracking, cipher effect or sparks around inputs/code). This can be achieved by scoped components rather than a global mode switch or new document setting.

## Priority and impact hypotheses

| Priority | Recommendation | Why it is worth doing | Validation rather than assumption |
| --- | --- | --- | --- |
| P0 | Genuine plain/styled reveal and direct test/copy | Makes the outcome tangible quickly | First-use task and exact-output parity tests |
| P0 | Tactile selected/focused cards and preview-to-editor continuity | Makes exploration feel intentional | Pointer, keyboard, touch and draft-preservation tasks |
| P0 | Compact workbench, clear copy format and honest feedback | Improves the actual adoption task | Successful copy, failure, narrow layout and full-studio transfer tests |
| P1 | Small compilation flourish and restrained success burst | Adds a memorable signature without requiring shaders | Reduced-motion, reading/distraction and idle-work checks |
| P2 | Opt-in ASCII Object exhibit | Offers a creative easter egg without misrepresenting output | License, import, browser-fallback, sustained-frame and user-value review |

No claim of conversion lift, universal performance or completed accessibility follows from this design. Compare the restrained design with its effects disabled in a small formative study; remove an effect that distracts from understanding or completing an export.

## Primary sources and audit notes

- [React Bits TS-CSS SpotlightCard registry](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/public/r/SpotlightCard-TS-CSS.json), [TiltedCard](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/public/r/TiltedCard-TS-CSS.json), [ClickSpark](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/public/r/ClickSpark-TS-CSS.json), and [DecryptedText](https://github.com/DavidHDev/react-bits/blob/3a1c7f2f9f94ed833934ab5c2635760b9e644583/public/r/DecryptedText-TS-CSS.json): implementation/registry inspection, not executed here.
- [React Bits license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md), inspected blob `6425315416e94469f28d0223a09f7285b2f785ab`; [Canvas UI pinned license](https://github.com/DavidHDev/canvas-ui/blob/49ae4d99244f36a794a4c02cfd756c6a17319d21/LICENSE.md).
- [Canvas UI introduction](https://canvasui.dev/docs), [installation](https://canvasui.dev/docs/installation), [rendering guide](https://canvasui.dev/docs/rendering), [component catalog](https://canvasui.dev/components), [pinned README](https://github.com/DavidHDev/canvas-ui/blob/49ae4d99244f36a794a4c02cfd756c6a17319d21/README.md), and [Peel source](https://github.com/DavidHDev/canvas-ui/blob/49ae4d99244f36a794a4c02cfd756c6a17319d21/src/lib/Peel/PeelVanilla.ts).
- [Chrome HTML-in-Canvas trial introduction](https://developer.chrome.com/blog/html-in-canvas-origin-trial): experimental mechanism and dated trial context, not current per-device qualification.
- [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading): client-side conditional imports and the Client Component restriction on `ssr: false`.
- [W3C interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), and [Web Vitals](https://web.dev/articles/vitals): inform the proposed acceptance policy, not proof of results.

All external sources were checked on 2026-09-12. Recheck component revisions, license terms and platform support at implementation time. No third-party component or font source is included in this documentation PR.
