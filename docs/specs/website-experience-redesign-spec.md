---
title: "ConsoleFX — tactile website experience and curated progressive effects"
status: "proposed; documentation PR for implementation review"
created: "2026-09-12"
artifact_path: "docs/specs/website-experience-redesign-spec.md"
mode: "deep"
repository: "servrox/console-fx"
inspected_revision: "15bb758a79d2af1d5b5da4c3db7656d1cbd494de"
initial_inspected_revision: "3c42e12d705b044809c05579f762bcb8c137890a"
owner: "ConsoleFX maintainer"
related_prs: [3, 4, 5]
implementation_authorized: false
---

# Tactile discovery, precise editing

## 1. Objective and authorization

Redesign the landing page and integrated workbench so ConsoleFX feels memorable, responsive and useful without becoming a generic GPU-effects showroom. Preserve professional minimalism, harmonious dark neumorphic surfaces, small cyan accents and the genuine browser-console output as the hero.

The user requested an evaluation inspired by Canvas UI and React Bits and a PR specifying its recommendations. This PR saves proposed documentation and interaction references only. It does not authorize runtime implementation, dependency installation, source vendoring, package publication, deployment, origin-trial enrollment or changes to other Proposed ADRs.

Read the [evaluation and inspected component shortlist](website-experience-redesign-evaluation.md) and [interaction storyboard](../mockups/website-experience-v1/storyboard.md). Detailed designs and budgets are review proposals, not previously accepted visual goldens or measured results.

Success is not the number of effects installed. A visitor should understand the product, enjoy changing a real example, identify a professional use case, and obtain the correct standalone or package code without losing work. The workbench must remain calm during editing.

### Relationship to existing proposals

- [PR #5](https://github.com/servrox/console-fx/pull/5) owns the proposed value narrative, practical examples, draft-safe transfers, adoption paths and format-aware copying. This proposal adds the visual/material system and detailed interaction/effect behavior. Do not implement a second hero, duplicate example catalogs or competing export panels. Reconcile in one implementation branch; neither spec is silently overwritten.
- [PR #3](https://github.com/servrox/console-fx/pull/3) has merged its utility/artful preset specification and accepted card-design references; its runtime implementation remains separate. [PR #4](https://github.com/servrox/console-fx/pull/4) proposes content fit/output sizing. This redesign can use existing scene APIs without either runtime extension. Card/fitting controls are promoted only after their own implementation and evidence.
- The [cinematic presets](cinematic-metal-presets-spec.md) are implemented in the refreshed main baseline. Preserve their grouping, renderer restoration, documented limits and evidence; this PR does not rebuild or remove them. Page tilt, peel, ASCII art or spark feedback must not be advertised as an exported console effect.
- This PR targets `main` independently, not the documentation branches. Cross-PR references use explicit PR/pinned links where files are not on `main`.

## 2. Baseline and architecture gate

The final audited `main` is `15bb758a79d2af1d5b5da4c3db7656d1cbd494de`, refreshed from the initial `3c42e12d705b044809c05579f762bcb8c137890a` inspection after intervening work merged. Its [studio.tsx](../../apps/studio/src/features/editor/studio.tsx) combines hero, grouped basic/cinematic preset cards, document state, controls and export. [globals.css](../../apps/studio/src/app/globals.css) already defines appropriate neutral/cyan materials. Preserve that direction and the existing [studio styles](../../apps/studio/src/styles/studio.css), [document reducer](../../apps/studio/src/features/editor/document.ts), [local persistence](../../apps/studio/src/features/persistence/documents.ts), and public compiler/React preview boundaries.

The [workspace manifest](../../package.json) pins pnpm, React, Next.js and TypeScript. It does not list Motion, GSAP, Three.js or vgpu. Do not install whole animation stacks, initialize shadcn/Tailwind, add another lockfile or upgrade dependencies just to reproduce a microinteraction. The initial implementation can use original app-local DOM/CSS effects. A reviewed source import is an optional implementation choice, not a requirement to redistribute upstream components.

**ADR gate: no new ADR for the mandatory app-local scope.** Existing Accepted ADRs [0002](../adrs/0002-compile-purely-and-emit-exactly-once.md), [0003](../adrs/0003-share-one-versioned-scene-model.md), [0004](../adrs/0004-separate-core-react-adapter-and-studio.md), [0005](../adrs/0005-generate-output-from-validated-data.md), [0006](../adrs/0006-qualify-renderer-profiles-in-real-devtools.md), [0007](../adrs/0007-keep-studio-documents-local.md), [0008](../adrs/0008-own-pnpm-and-typescript-toolchain.md), [0009](../adrs/0009-validate-changed-contracts-with-proportional-evidence.md) and [0013](../adrs/0013-keep-screen-reader-review-as-nonblocking-follow-up.md) govern the work. ADR-0013 supersedes ADR-0011: representative screen-reader review is recommended nonblocking follow-up, not a reinstated launch gate. Accepted ADR-0012 governs the now-implemented cinematic profiles; Accepted ADR-0014 governs the separately merged card-presentation proposal. Preserve their recorded identities and statuses. App-local visual wrappers do not change scene schemas, public APIs, npm ownership or emission policy. No accepted decision is superseded or reclassified.

The optional GPU exhibit requires a separate explicit go/no-go review of dependency, license, cost and browser evidence before adoption. If implementation proposes reusable/public effect exports, general render infrastructure, new persistence/telemetry, trial enrollment or a changed runtime boundary, stop that portion and draft the necessary local ADR before implementation. A website-effect license review is not an automatic license-policy change for the project.

## 3. The product experience

### 3.1 A single interactive hero stage

Use PR #5's short explanatory hero and three choices: **Signature / Development context / Summary**. Keep the H1 readable in initial HTML. Do not blur, scramble or delay critical copy to manufacture suspense. Maintain two explicit adoption paths: **Try a message** and **Use in your app**.

The stage contains real compiler-generated static output, an editable text field, **Plain / Styled** buttons, a capability label and explicit **Test in console / Copy console.log** actions. Default to the final styled state, not an obscured loading animation. The plain view uses identical facts and readable formatting rather than intentionally unattractive data.

On explicit comparison selection, update semantic state immediately and use a 240–320 ms original two-layer wipe with a small lifted-edge impression inspired by Canvas UI Peel. This is app-only transition decoration; its two endpoints are the genuine plain/styled previews. Keep controls outside the clipped layers. Decorative clones are inert and `aria-hidden`; only one semantic result is exposed. Copy/Test do not wait for the animation. Disable the animation rather than losing content when clipping/canvas/JS enhancement is unavailable.

For fine pointers and allowed motion, the outer frame may tilt at most 2 degrees while idle. No magnification. Stop and flatten when a field/control receives focus, when text is selected, or while the visitor uses the comparison. The accurate comparison/working preview is always flat. On keyboard or coarse-pointer interaction use an ordinary edge/focus state, not a desktop-only warning.

Do not add a page-level pointer follower. Do not measure the native Console from page dimensions. Native console compatibility remains governed by the existing profile evidence.

### 3.2 Purpose-led cards that feel selected, not just hovered

Keep PR #5's six curated examples and **All / Make it memorable / Make it useful** filters. Examples are app-local uses of currently implemented factories/scene APIs, not new npm presets. Show renderer and availability labels, and **Sample data** for operational-looking facts.

A React Bits SpotlightCard-style surface can replace flat hover treatment. A faint local cyan/neutral light, <=2 px lift and readable selected border are sufficient. Move the highlight through CSS properties with at most one pending animation frame per active card; do not update React document state per pointer event. Keep a native semantic button/link for the real action. No button inside a button, no invisible hit surface, and no hidden tooltip required to understand a card.

Hover/focus never selects a preset or emits. A committed selection is visible separately from hover. Selecting an example updates the mini-demo or explicitly loads the editor according to the action label. Filtering does not recreate the active document, animate all thumbnails, or queue dozens of delayed entrances. A short local crossfade is enough; focus remains predictable if a filtered card is removed.

Selecting an example must not quietly replace a saved draft. Browsing stays in transient demo state. **Edit this example** transfers a validated scene through the existing reversible document action, with the confirmation/conflict handling defined in PR #5. Preserve raw JSON/share compatibility and original user text; do not create a new effect setting inside SceneV1.

### 3.3 Professional use cases get clarity, not extra effects

Retain **SDK welcome**, **Development context** and **Supplied summary** comparisons. Keep their content and integration code legible, stable and user-triggered. Facts come from explicit synthetic example data; ConsoleFX neither collects them nor redacts secrets automatically. Commands and endpoints are text, not auto-executed interactions.

Allow a small border/selection transition around the chosen example. Do not tilt dashboards, animate metric counts, make background grids pulse, or suggest that the library provides telemetry. Do not import the utility-card mockups into a shader and present that as an implemented preset.

### 3.4 The workbench is the precision mode

On `/`, retain the integrated playground anchor and a compact three-region editor: content/presets, preview/source, properties. On `/studio/`, remove marketing motion entirely. Both use the same existing document/compiler/export path.

Prefer a visibly connected flow: choose a card, change its content, inspect the real output, then export it. Selection, active tab and focus share one visual indicator style. The full code area remains unanimated, selectable and readable. No sparkle on typing, field shakes, random typography, parallax panels, hover zoom or cipher effects in the editor.

A format-aware export rail may stay visible within the editor on desktop. It must not introduce a second competing primary action or cover content. Below 768 CSS px, prefer a normal inline action unless a safe-area/keyboard/focus test proves a dock remains usable. Keep controls reachable at 320 CSS px and under zoom. Existing diagnostics, undo/redo, import, draft failures and source selection remain available.

The primary copy action follows the selected format; a package tab must not claim no imports. Show **Copied** only after success. Retain complete selectable source and a retry path when clipboard access fails. Optional success decoration is a local 4–6 stroke tick burst, <=300 ms, inspired by ClickSpark. It triggers once per successful action, not on bubbled clicks, and is suppressed under reduced motion. Keyboard feedback is centered on the action; it must not require pointer coordinates.

### 3.5 Optional creative exhibit, separate from the product preview

After the practical explanation, an optional **Explore the craft** exhibit may display one original `>_` brand mark using Canvas UI ASCII Object. This is a P2 experiment, not a launch requirement. Use a static original SVG poster until the visitor chooses **Play website effect**. Show **Website decoration — not included in exported logs** beside it. It cannot replace the hero's actual output or be labeled a preset.

The initial experiment should choose the WebGL2 variant, not import WebGL and WebGPU together. Object effects add Three.js according to the provider; verify the exact dependency graph and license before copying. No external model/CDN/font requests, glTF uploads, live DOM capture or canvas trial token. Use only the project's original local brand geometry. If initialization is unsupported, rejected, lost or too expensive, retain the static poster and normal site controls.

Play lasts at most four seconds and has an immediate Stop/Show static action. Only one GPU exhibit may run on a page. Pause/cancel offscreen, on hidden document, Effects off, reduced motion, navigation, unmount or context loss. Dispose canvases/resources/listeners and guard asynchronous initialization that resolves after teardown. Do not automatically restart after visibility changes; a deliberate replay may begin another bounded run.

No part of this optional exhibit enters either npm package, the normalized scene, code export, `ConsolePreview` output, share fragments or native console messages. Leaving it unimplemented is an acceptable outcome of the review gate.

## 4. Selected integrations and source review

The evaluation links pinned primary sources. The preferred baseline choices are:

| Candidate | Action |
| --- | --- |
| SpotlightCard TS-CSS | Consider reviewed app-only source adaptation; no extra dependencies in the inspected registry. An original equivalent is acceptable. |
| TiltedCard | Use a restrained original outer-frame transform; avoid adopting its image-only structure and Motion dependency for a tiny interaction. |
| Canvas UI Peel | Use an original DOM comparison reveal by default. Literal HTML-in-Canvas adoption is deferred, not required for visual success. |
| ASCII Sweep / DecryptedText | Optional fixed decorative compilation flourish only; <=600 ms on explicit choice. Do not mutate semantic/user/code text. Prefer an original finite CSS/SVG accent without a new dependency. |
| ClickSpark | Replace the raw-click/idle-loop behavior with one-shot success feedback. A small original CSS/SVG effect is preferred. |
| ASCII Object | Optional separately approved WebGL2 exhibit, lazy and strictly outside product previews. |

Do not copy a component's default colors, full-screen examples or registry shell wholesale. Use TypeScript plus scoped CSS to match the existing app; no Tailwind setup is required. Component API names above describe the audited upstream sources, while proposed ConsoleFX wrapper names below are app-local design choices, not upstream exports.

### License and supply-chain checklist

Both audited providers use MIT + Commons Clause language, not plain MIT. Before any copied/adapted source lands, record upstream URL/revision, file and license hashes, original notice, modifications, exact transitive dependencies, component use and delivery surfaces. Review the public application repository and generated third-party notices as well as the hosted site; keeping code outside npm is necessary but not by itself proof of license compliance. Obtain clarification if the intended distribution is uncertain. Do not add a blanket ConsoleFX MIT header to third-party files or remove existing notices.

An application-specific source adaptation is not a general re-exportable component product. Do not expose a component registry/download panel or derive console snippets from restricted upstream implementation. If source adoption is not cleared, implement the high-level interaction independently using ordinary platform primitives without copying upstream code/artwork; keep attribution for inspiration separate from code provenance. No vendor files are copied by this PR.

Registry installation is a write operation, not merely discovery. Inspect the chosen TS-CSS registry entry and target paths before using a pinned CLI or manual source import in a separate authorized implementation. Review diffs to prevent package upgrades, config reinitialization, hidden install scripts or a second lockfile.

## 5. App-local module and state plan

Rebase this ownership plan against the eventual PR #5 implementation rather than creating duplicate modules. Suggested new paths are proposals, not existing files:

| Area | Responsibility |
| --- | --- |
| `apps/studio/src/features/landing/landing-page.tsx` | Semantic page composition and PR #5's example/use-case/adoption sections |
| `apps/studio/src/features/landing/console-showcase.tsx` | Mini-demo state, explicit comparison and transfer callback, real public preview |
| `apps/studio/src/features/landing/example-card.tsx` | Semantic card and static fallback; isolated surface response |
| `apps/studio/src/features/experience/page-effects.tsx` | Small app-only effect permission/context; no scene persistence or console calls |
| `apps/studio/src/features/experience/reveal-frame.tsx` | Controlled decorative two-layer reveal; always renders the real content |
| `apps/studio/src/features/experience/success-feedback.tsx` | Finite feedback after copy resolution; accessible status stays outside decoration |
| `apps/studio/src/features/experience/ascii-exhibit.client.tsx` | Optional, separately approved lazy exhibit; no import from default/editor paths |
| `apps/studio/src/styles/experience.css` | Scoped material/interaction states, no global animation reset |
| `apps/studio/src/vendor/` | Only individually reviewed source, notices and provenance if adoption is approved; do not scaffold this folder otherwise |

Keep the shell/H1, explanations, labels, examples and static posters available in initial HTML. Isolate browser effects in Client Components; do not mark the whole root layout client-side to make an effect work. `next/dynamic` with `ssr: false` belongs in a Client Component, and a dynamically imported component that mounts immediately may still load immediately. The optional exhibit must be conditionally mounted after deliberate activation; verify requests/chunks rather than assuming a dynamic import proves deferral.

Pointer coordinates, animation progress and page-effects preference are transient UI state. They must not trigger scene validation/codegen or draft autosave. Keep effect wrappers outside document identity/memo keys. Comparison/export uses stable validated scene/options. Run optional browser observers only after mount; initial server/client markup agrees. No random glyphs/time values/GPU probes in render.

**Page effects** has a visible per-session Off control and follows reduced motion. This is independent of the existing console-output motion control: turning page effects off must not mutate the user's saved scene or exported code. Do not introduce persisted preferences in this slice. Previewing/logging SVG motion continues to follow its own existing explicit reduced-motion contract.

If effects fail, retain the functional semantic content. Error boundaries are limited to optional effect islands, not a wrapper that replaces the entire editor. Unsupported enhancement is not shown as an alarming console error and must not prevent a valid Copy/Test action.

## 6. Interaction and lifecycle contract

| Interaction | Timing / geometry budget | Required alternative |
| --- | --- | --- |
| Card surface response | 120–180 ms opacity, <=2 px lift, pointer updates batched | Visible static focus/selection on keyboard, touch or Effects off |
| Hero tilt | <=2 degrees, no scale, reset <=200 ms | Flat preview; disable during focus/edit/selection |
| Plain/styled reveal | 240–320 ms maximum, semantic selection immediate | Immediate swap with same content |
| Selection/tab indicator | 160–200 ms, no large layout movement | Immediate selected state; no delayed operation |
| Optional fixed-glyph accent | <=600 ms once per explicit choice, outside meaningful text | Omit it entirely |
| Copy tick burst | <=300 ms after success, 4–6 strokes | Text and live status only |
| Optional GPU exhibit | <=4 seconds, <=1 active instance | Original static poster with the same layout footprint |

These are proposed UX limits, not measured library capabilities. Effects are cancelable: rapidly changing a selection cancels/replaces pending decoration instead of queuing a backlog. Avoid repeated React renders for visual frames. Normal page operations must produce zero library logs; a Test action still emits exactly once. An effect callback must never call Test or Copy.

For reduced motion or unknown preference at hydration, present the static state. Re-evaluate preference changes and stop active decoration. Do not make desktop-hover optimization the functional path for touch. Never move the pointer target, hijack scrolling, delay navigation or animate source selection.

## 7. Accessibility, truthfulness and responsive behavior

Retain the project's WCAG 2.2 AA target and the active ADR-0013 validation policy. Missing representative Narrator/NVDA/browser review remains documented nonblocking follow-up; known unresolved critical-journey failures still follow the active exception/promotion rules. Do not restore the superseded screen-reader launch gate. Keep one semantic H1, persistent labels, clear focus, text contrast and visible control boundaries. Do not rely on the soft shadow/highlight for state. Practical examples and code stay readable against static opaque surfaces. Native buttons/links own actions; decorative canvases/overlays are inert and excluded from the accessibility tree.

The W3C interaction-animation criterion is Level AAA; honoring it here as a stricter motion policy does not mislabel it as an AA rule. The existing AA baseline and applicable pause/stop/hide obligations remain. Avoid automatic motion; optional page motion must be suppressible without removing functionality. No rapid flashing or animated metrics.

Focus/keyboard users get the same selection, comparison and export as pointer users. Use native or fully keyboard-supported tab/segmented behavior, not hover-only reveals. Screen readers hear a stable original result and one copy status, never random cipher characters. Preserve source text selection and clipboard fallback. Check contrast in every state, zoom/reflow and coarse-pointer behavior manually in addition to automated scans.

Website responsive breakpoints do not change console sizing policy. A narrowed preview may use a labeled simulation/contained view; do not claim the real emitted 600-pixel SVG adapts until PR #4's implementation is qualified. Generated-output screenshots exclude page-only transformations. All operational example facts remain synthetic; install/feature CTAs are gated on current release and implementation evidence.

## 8. Proposed performance and loading budgets

Measure before changing dependencies and compare the same production build/device setup after each slice. The following are acceptance budgets, not observations:

- Add no more than **20 KiB gzip incremental JavaScript** to the landing route's initial client path for mandatory decoration, measured against the merged functional baseline. Do not pull Motion, GSAP, Three.js or vgpu into that path. Basic CSS interactions should require far less; this is a ceiling, not a target.
- **Zero GPU contexts and zero optional GPU module/model requests before explicit Play.** No background preload that defeats this gate. `/studio/` and `/docs/` must not load the decorative exhibit.
- The optional exhibit has a provisional **200 KiB gzip incremental JS** ceiling including its rendering dependency graph and **100 KiB compressed original visual assets**, DPR capped at **1.5** and at most **1 million backing-store pixels**. If the real dependency/render workload exceeds these limits, defer or redesign the exhibit; do not silently raise budgets.
- **Zero decoration-owned recurring timers or frame callbacks at idle**, after completion, hidden/offscreen, Effects off and unmount. Bounded in-flight async work must not mount resources after cancellation. A pending pointer frame is allowed while interaction is active, not an eternal ticker.
- Capture a ten-second active/idle performance trace on a recorded integrated-GPU laptop and representative mobile device. Target no new decoration-attributable long tasks over **50 ms** during basic selection/copy; keep active animation frame work within a **16.7 ms p95 frame-interval target** on the recorded desktop. If the optional exhibit cannot meet its target, preserve the static alternative. Do not fabricate low-end/device results from headless screenshots.
- Public field targets, when an authorized deployment supplies real evidence, are **LCP <=2.5 s, INP <=200 ms, CLS <=0.1 at the 75th percentile**. Lab results are proxies, not field data. Reserve stage/poster dimensions, do not delay the H1 behind an effect, and prevent font/layout jumps. This task adds no analytics collection.

Record gzip settings, entrypoint graph, browser/OS/device, viewport, motion mode and sample size. Test again with the effect disabled to attribute regressions rather than blaming unrelated editor work.

## 9. Validation and comparison plan

Before implementation, capture the current production-build functional baseline and the reviewed PR #5 narrative state. This proposal supplies [state IDs UX-01 through UX-10](../mockups/website-experience-v1/storyboard.md) for future screenshots/recordings. It does not replace existing preset SVG reference hashes.

Use 320/390, 768 and 1440 CSS px viewports; keyboard and fine/coarse pointer; normal and reduced motion; page effects enabled/disabled; no JS static content; GPU unavailable/context lost/import rejected; clipboard allowed/rejected; restored draft/shared-scene conflict; rapid switching; navigation and React development remount/replay. Check Chrome, Edge, Safari and Firefox for website behavior; native-console claims still require their separate recorded profile qualification.

Compare fixed-scene compiled args or SVG image URI before/after page effects. A visual wrapper must not change these bytes. Verify copying exports only the selected format and no third-party effect code. Test import/codegen silence, one call per explicit Test, no logs for filters/effects/preferences, and preserved text under Unicode/literal-percent input.

Check effect cleanup with scheduler/observer spies scoped to owned code, a short idle trace and repeated mount/unmount. Do not infer cleanup from a static screenshot. Verify pending asynchronous GPU setup is disposed when the user navigates away before it completes. Confirm fallback recovery leaves the same scene, focus and primary actions.

Existing workspace commands, subject to rechecking the implementation branch:

```sh
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:codegen
pnpm build
pnpm test:studio
pnpm test:consumers
pnpm check:packages
pnpm check:bundle-size
```

Add targeted experience tests under existing test conventions rather than claiming the commands above already cover new behaviors. Document Markdown checks separately: the existing format script does not target all `docs/` Markdown. Run `git diff --check`, relative-link/anchor and metadata checks for documentation. No application suite or dependency installation is needed merely to review this proposal.

A five-developer formative comparison of effects enabled versus disabled should ask participants to explain the product, test one message, find a practical example and copy the desired integration format. Record errors, task completion and distraction comments, not a statistically significant conversion claim. Keep the prior 90-second first-test goal as a hypothesis. Remove effects that make the task harder even if they look impressive in isolation.

## 10. Testable acceptance criteria

- **UXR-01 — Clear first render:** WHEN JavaScript or effects are unavailable, THE PAGE SHALL retain its H1, explanation, meaningful static output, navigation and honest fallback instructions; no essential text waits for animation.
- **UXR-02 — Output fidelity:** FOR fixed scene/options, enabling page effects SHALL NOT change compiled arguments, image URI, copied snippet or saved scene. Final product previews use the public compiler output.
- **UXR-03 — Intentional reveal:** WHEN Plain/Styled is selected by pointer, keyboard or touch, selection SHALL update immediately; optional decoration settles within 320 ms and never blocks Copy/Test.
- **UXR-04 — Tactile but usable cards:** Cards SHALL distinguish hover, focus and selection; stay semantic; select only on deliberate activation; and preserve labels/actions without hover.
- **UXR-05 — State safety:** Browsing examples or playing decoration SHALL NOT alter the saved draft, output motion or export format. Explicit editor transfer follows the existing confirmation and undo flow.
- **UXR-06 — Honest export feedback:** Success styling SHALL follow successful clipboard resolution only; rejection retains selectable complete source and retry. The primary label/content matches the selected format.
- **UXR-07 — Quiet workbench:** `/studio/`, inputs, source and actionable controls SHALL remain free of tracking spotlight, tilt, cipher and canvas spectacle; functional preview/code behavior is unchanged.
- **UXR-08 — Emission invariant:** Imports, SSR, editing, page motion, filters and sharing SHALL emit zero library logs; each explicit Test SHALL emit exactly one message.
- **UXR-09 — Accessible static mode:** Reduced/unknown motion and Page effects off SHALL remove nonessential animation without removing content/operation; preference changes stop active effects and do not rewrite scenes.
- **UXR-10 — Responsive interaction:** At 320 CSS px, 200% zoom and on coarse pointers, no essential action SHALL be clipped or covered. Touch users need no desktop-hover effect. Sticky controls do not obscure focus/keyboard/dialogs.
- **UXR-11 — Source isolation:** Copied/adapted upstream source, if approved, SHALL remain app-local with preserved notices/provenance. Neither npm tarballs nor standalone exports include that source, GPU dependencies or webpage assets.
- **UXR-12 — Budget evidence:** The mandatory effect slice SHALL meet the incremental-load and idle-work budgets, with before/after artifacts and attributable measurements; no claim is based only on a source-library marketing statement.
- **UXR-13 — Optional GPU gate:** IF the exhibit is approved and implemented, it SHALL request no GPU/module/assets before explicit Play, run one bounded instance, and restore its poster on unsupported/failed/lost context without affecting editor actions.
- **UXR-14 — Cleanup:** Completion, Effects off and visibility loss SHALL stop decorative rendering and recurring frame/timer work; retain only the minimal policy/visibility listeners needed by a mounted static fallback. Unmount SHALL disconnect all owned observers/listeners and release GPU resources. Delayed initialization cannot resurrect a disposed island.
- **UXR-15 — Evidence and truth:** The UI SHALL distinguish website decoration, compiler preview, concepts and qualified native output. No invented statistics, install availability, automatic sizing or unsupported presets are promoted.
- **UXR-16 — Regression references:** Implementation review SHALL include UX-01–UX-10 state artifacts, motion/viewport metadata, accessibility checks and output-identity comparisons; existing preset references remain unchanged unless explicitly reviewed.

## 11. Delivery, rollback and implementation handover

**Phase A — Functional hierarchy and material craft:** reconcile PR #5, establish static-first hero/workbench, scoped material tokens, semantic cards and correct copy behavior. No upstream dependency is necessary. Gate on state safety, accessibility and output identity.

**Phase B — Controlled delight:** add reveal, small surface response and optional success accent with the lifecycle/motion policy. Review one interaction at a time, not a simultaneous effect bundle. Gate on enabled/disabled comparison, response/idle traces and multi-input tasks.

**Phase C — Optional source adoption/ASCII exhibit trial:** review license/provenance and exact dependency cost; approve or reject the trial separately. Implement only behind explicit activation and a removable app-local boundary. Failure/defer does not block A/B or imply a broken site.

**Phase D — Review and promotion:** run the acceptance matrix, visual states, production bundle checks and formative tasks. Publish/deploy only through separately authorized existing processes; this document does not trigger them.

Rollback disables/removes effect wrappers while retaining normal content, current scene, semantic controls and existing export implementation. There are no database changes, destructive migrations or new saved-scene fields. Disabling the optional exhibit removes its imports/assets from the public route graph. Keep evidence for a failed experiment; do not rewrite baseline screenshots to make it pass.

### Companion execution prompt

> Implement only the explicitly authorized phase of `docs/specs/website-experience-redesign-spec.md`. Read AGENTS.md and the applicable Accepted ADRs first. Recheck main and reconcile PR #5's narrative/state/copy work; do not create competing landing/editor state. Use the evaluation's pinned sources for review, not blanket permission to install or relicense components. Keep original DOM/CSS microinteractions as the baseline, the real compiler preview/export unchanged, and optional GPU work separate and gated. Preserve current packages, scene contracts, drafts, accepted decisions and preset visual references. Verify the specified accessibility, output identity, single-emission, performance, failure/cleanup and package-isolation criteria. Record exact executed checks and unavailable observations. Stop before any unapproved dependency, public API, persistence, publication, deployment or trial change.

## 12. Source challenge and documentation-save evidence

The published stark AI Developer `codex-spec-interviewer` 0.3.4 workflow was used as an authoring reference for source challenge, architecture gating, explicit scope, acceptance criteria and handover. This is a proposed PR requested by the user, not a claim that native host Plan mode was activated or that the detailed design has been accepted.

Repository evidence: the instructions/ADR index, landing/editor and CSS, package manifest, and PR #5's pinned specification; the final refresh additionally inspected the six-commit intervening diff, current grouped gallery, Accepted ADR-0013 successor and updated index at `15bb758`. The added documents are based on that refreshed tree and do not rewrite any intervening changes. External evidence: the audited React Bits registry source, Canvas UI docs/README/Peel source and both licenses, Chrome's dated trial description, Next.js lazy-loading guidance and W3C/Web Vitals references listed in the evaluation.

The challenge changed a naive drop-in plan into a selective one: external source is not automatically plain MIT; a `motion/react` dependency is not free; raw ClickSpark has an idle frame loop; live HTML canvas effects are not baseline capabilities; and website decoration cannot be sold as exported console output. Existing package boundaries, reduced-motion/static alternatives and pure single-emission compilation remain binding.

This documentation save validates file structure/links and PR scope only. It does not report a working redesign, runtime component execution, local/CI application tests, measured performance, screen-reader conformance, real DevTools qualification, license approval, publication or deployment. Implementation remains pending review and explicit authority.
