---
title: "ConsoleFX website — demonstrate delight, utility, and library value"
status: "proposed; documentation PR for implementation review"
created: "2026-09-12"
artifact_path: "docs/specs/website-value-story-spec.md"
mode: "standard"
repository: "servrox/console-fx"
inspected_revision: "3c42e12d705b044809c05579f762bcb8c137890a"
owner: "ConsoleFX maintainer"
source_request: "Evaluate how the website can show playful output, professional use cases, and the value of the library; add a PR specifying the recommendations."
implementation_authorized: true
---

# Website: demonstrate the result and the reason to adopt

> **Accepted successor (2026-09-14):** [ADR-0016](../adrs/0016-organize-discovery-around-an-example-catalogue.md) moves full discovery/editing to Studio and integration/video to Docs. [ADR-0017](../adrs/0017-default-new-workbench-examples-to-automatic-svg-sizing.md) enables explicit fitting and experimental automatic SVG sizing for new catalogue examples only. These narrow changes supersede conflicting integrated-landing/opt-in creation wording below; saved/imported work, core defaults and all other obligations remain binding.

## 1. Outcome, review status, and scope

Turn the integrated landing page into a clear journey from creative interest to a useful developer example and a deliberate adoption choice. Preserve ConsoleFX's identity as a small browser-console presentation library, not an observability platform.

The visitor should understand: **what the output looks like; what they would use it for; why the reusable package offers more than hand-written styling; and how to try it without installing anything.** The [evaluation](website-value-evaluation.md) explains the diagnosis and prioritization.

The user authorized this evaluation/specification PR. Copy, interaction details, and acceptance targets below are proposals for maintainer review, not previously approved product claims. This PR contains documentation only. Implementation, package publishing, deployment, and acceptance of existing Proposed ADRs require separate authority.

### Included in later implementation

Landing-page narrative and navigation; a small interactive hero; curated examples built with current APIs; practical use-case demonstrations; standalone/package adoption paths; a fair native-console comparison; clearer copy/export interactions; task-oriented documentation; accessibility, performance and state-preservation checks; claim/status gating; a moderated evaluation protocol.

### Excluded

New effects, card renderers, fitting algorithms, schema/API changes, general logging or telemetry, automatically collected app data, user accounts, remote example feeds, CMS, analytics/tracking, package/dependency upgrades, a separate Next.js package, automatic console output, new deployment/release configuration, or changes to existing visual goldens.

This work may extract app-local modules, but must not implement the features proposed by [PR #3](https://github.com/servrox/console-fx/pull/3), [PR #4](https://github.com/servrox/console-fx/pull/4), or [the cinematic spec](cinematic-metal-presets-spec.md).

## 2. Audited baseline and architecture gate

The source audit used commit `3c42e12d705b044809c05579f762bcb8c137890a`. The hosted website was not inspected successfully; this is not a live UX, performance, or conversion audit. Read current source again before implementing. Historical statements in the original spec about missing implementation are not the current baseline.

| Existing area | Relevant finding and intended change |
| --- | --- |
| [Landing/editor component](../../apps/studio/src/features/editor/studio.tsx) | Hero and all preset previews precede the full editor. Extract the marketing composition while preserving its shared document flow. Replace generic sample content with purposeful examples. |
| [Landing entry](../../apps/studio/src/app/page.tsx) and [focused entry](../../apps/studio/src/app/studio/page.tsx) | Preserve `/` and `/studio/`; the latter remains focused rather than repeating marketing sections. |
| [Layout](../../apps/studio/src/app/layout.tsx) | Add use-case/adoption navigation and improve metadata; retain accessibility and licensing links. |
| [Docs page](../../apps/studio/src/app/docs/page.tsx) | Retain correct technical boundaries; add task-based entry points and runnable integration recipes. |
| [Preset catalog](../../packages/console-fx/src/presets/index.ts) | Nine current factories and descriptors, mostly generic sample text. Use these plus existing `defineScene`; do not add fake factory names. |
| [Core guide](../../packages/console-fx/README.md) and [React adapter](../../packages/console-fx-react/README.md) | Existing compilation, export and lifecycle contracts are the proof of value. Examples use public imports only. |
| [Editor document logic](../../apps/studio/src/features/editor/document.ts) and [persistence](../../apps/studio/src/features/persistence/documents.ts) | Preserve undo, imports and share fragments; demo browsing must not overwrite a saved draft. |
| [Compatibility](../compatibility.md), [release guidance](../releasing.md), [implementation receipt](console-fx-implementation-evidence.md) | Distinguish implemented capability, recorded qualification and publication. Do not infer a release from a version in a manifest. |
| [Design direction](../mockups/README.md) | Professional minimalism, soft neumorphic depth and restrained cyan; decorative variety belongs inside examples. |

**ADR required: no new record for this scope.** This is app-local presentation and workflow work under existing decisions, not a new public contract. Governing Accepted ADRs: [0002](../adrs/0002-compile-purely-and-emit-exactly-once.md) for silent composition/single emission; [0003](../adrs/0003-share-one-versioned-scene-model.md) for shared scenes; [0004](../adrs/0004-separate-core-react-adapter-and-studio.md) for ownership; [0005](../adrs/0005-generate-output-from-validated-data.md) for validated output; [0006](../adrs/0006-qualify-renderer-profiles-in-real-devtools.md) for claims; [0007](../adrs/0007-keep-studio-documents-local.md) for persistence; [0009](../adrs/0009-validate-changed-contracts-with-proportional-evidence.md) and [0013](../adrs/0013-keep-screen-reader-review-as-nonblocking-follow-up.md) for evidence and accessibility. ADR-0011 is superseded. No ADR status or index changes are part of this PR.

If implementation discovers it needs a new scene type, public export, remote analytics, a different persistence format, or a new emission policy, stop that portion for a separate decision. Cinematic ADR-0012, accessibility successor ADR-0013 and card-presentation ADR-0014 were separately accepted by the maintainer. The fitting proposal receives unused ADR-0015 during integration. This website specification does not change those independent contracts or grant acceptance to a proposed decision.

## 3. Page structure and copy

### 3.1 Above the fold

Suggested copy, subject to review:

- Eyebrow: **Expressive browser-console messages.**
- H1: **Make your console worth opening.**
- Supporting sentence: **Give your SDK a memorable welcome, make development context easier to scan, or add a little character to your next project. Design a message visually, then copy one console.log or compose it in TypeScript.**
- Primary CTA: **Try a message** — focuses the hero demo without printing.
- Secondary CTA: **Use in your app** — anchors to adoption.
- Evidence strip: **One intentional entry · Standalone export · Typed scenes**. Add MIT only with its license link; show release/publication status separately.

The hero demonstrates three explicit choices: **Signature**, **Development context**, **Supplied summary**. Default to a restrained signature, with practical choices visible beside it rather than behind a separate page. Initially all are static. This is not an automatically cycling carousel.

```text
[console-fx]   Examples   Use cases   Playground   Docs     GitHub

Make your console worth opening.         [Signature | Dev context | Summary]
[practical explanation]                  [Text: Hello, developer.         ]
[Try a message] [Use in your app]         [Plain | Styled] [actual preview  ]
[release/compatibility note]             [Test in console] [Copy console.log]
```

This wireframe expresses hierarchy, not pixel-level design approval. On mobile, stack it in this reading order. There must be no horizontal page scroll or clipped actions.

### 3.2 Curated examples: breadth without overload

Show six initial examples, with **All / Make it memorable / Make it useful** filters. Use simple buttons with selected-state semantics rather than a complex tab implementation unless actual tab-panel behavior is provided. Do not duplicate the complete nine-preset grid above the fold; retain access to all effects in the full playground.

Each card includes a compiler-generated static preview, purpose sentence, renderer label and availability state. Its primary action is **Edit this example**, not a misleading “install” or print-on-select action. All displayed sample values are synthetic and labeled **Sample data** where they look operational.

| Stable app-local example ID | Purpose / content | Initial implementation using existing capabilities |
| --- | --- | --- |
| `signature` | A playful welcome, `Hello, developer.` | Current `neon`, optional manual choices of `rgbSplit` and `chrome`; no automatic rotation. |
| `sdkWelcome` | `Atlas SDK` / `Sandbox mode` / `See the SDK guide` | `defineScene` with readable lines and one badge on a short run. No SDK initialization actually occurs. |
| `devContext` | `atlas-web` / `preview` / `Revision a1b2c3d` | Three short lines with a quiet environment badge. Not the future Service Passport factory. |
| `milestone` | `Build complete` / `48 checks passed` / `Ready for review` | A caller-supplied synthetic snapshot using existing text/badge capabilities. Not a Build Receipt implementation or benchmark. |
| `chromeTitle` | `Keep building.` | Current `chrome` preset. Do not name this Liquid Chrome or imply the cinematic proposal exists. |
| `quietEditorial` | `Made with care.` / `A small detail for developers.` | Existing serif text styles, plain/quiet CSS. No Letterpress/card renderer claim. |

**Implemented follow-up, 2026-09-13:** The table above records the initial pre-card examples. After the maintainer reported that the Useful messages looked alike, their homepage recipes were connected to the implemented, approved Command Card (`sdkWelcome`), Build Receipt (`devContext`) and Release Bulletin (`milestone`) profiles. Their sample headings and purposes remain; the card fields add explicit fictional context. The gallery, workflows, hero choices and editor transfer consume those same recipes. See the [correction and visual evidence](../evidence/website/2026-09-13-useful/README.md). No profile algorithm, public API or emission policy changes.

The example module materializes valid scene data. Keep typography and dimensions conservative for these specific fixtures; inspect output rather than inventing a general fitting guarantee. Future designs belong in an optional, separate **Design concepts** section with a **View proposal** link, not an enabled “Try” button.

### 3.3 Practical use cases, before the large editor

Heading: **Not just a pretty hello.** Introduce three compact workflows:

**Welcome developers to an SDK.** Show optional welcome/mode/help information. The application chooses the trigger and whether to print. Explain the value as reusable, recognizable presentation, not better SDK performance.

**Know which build you are looking at.** Show explicitly supplied project/environment/revision values. Prefer static, development-only integration. The library must not read environment variables or detect a deployment.

**Summarize a moment, not every event.** Show a supplied milestone or a user-triggered, allowlisted support summary. The caller prepares and redacts the facts. Do not claim automatic collection, tracing, telemetry, secret removal or severity mapping.

Each workflow has: one sentence explaining the job; identical-facts **Plain / Styled** views; an editable example; a short, complete integration recipe or a link to it; a concise boundary note. The plain comparison must be readable, not intentionally degraded, noisy, or missing data. Styling must not introduce information absent from the plain version.

“Print plain” versus “Print styled,” if offered, are separate deliberate actions, each producing one emission. Merely switching comparisons does not print either.

### 3.4 Playground and adoption

Keep the integrated playground at `#playground`. Introduce it as **Choose. Change. Copy.** Preserve advanced line/run, renderer, effect, import/export, undo/redo, and draft features. Offer **Open full studio** without discarding the active scene.

Place an adoption section at `#use-in-your-app` after the compact playground introduction or alongside its export area, not hidden at the end of technical documentation:

| Path | Message | Main action |
| --- | --- | --- |
| **Use one message** | Copy a complete, fixed JavaScript message. No ConsoleFX import is needed when that snippet runs. Edit the source scene to change it later. | **Copy console.log** |
| **Compose messages in code** | Use typed scene data when text or values change, or reuse a presentation across application code. This route imports the package. | **Read the integration guide** / **Copy TypeScript example** |

Explain the tradeoff: standalone source can be larger, especially with SVG/motion; the package is useful for maintainable composition. Do not imply that a hard-coded snippet updates with the original playground design.

While publication remains pending in reviewed release evidence, show **Package publication pending — standalone export works without installation** and link to source/workspace instructions. Do not display a working npm install CTA or a fabricated package version. Promote install instructions only after registry/release verification at implementation time; use the existing release process, not a new website-triggered publication action.

### 3.5 Prove the package value fairly

Heading: **Why not just use %c?** Suggested answer:

> For a single colored label, native console styling is enough. ConsoleFX is for the presentation you want to reuse: typed scenes, consistent effects, literal-text handling, readable fallbacks, and complete exports from the same design.

Compare responsibilities, not unsupported performance or line-count claims:

| Need | Native console / a small helper | ConsoleFX's added responsibility |
| --- | --- | --- |
| One colored label | Often sufficient | Optional; no reason to force a dependency. |
| Reuse a design with changing text | You own the helper and conventions | Normalized typed scenes and named presets. |
| Rich imagery and export | You construct/encode/maintain output | Shared generation and a visual editor. |
| Framework lifecycle | You control when effects run | Existing React adapter and documented Next.js recipes. |
| Portability and escaping | You own those checks | Explicit profiles, diagnostics and tested text handling, within recorded limits. |

Place a real public-API example here, labeled as package usage. For instance, using current APIs:

```ts
import { badge } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";

const scene = badge({ text: "Preview build" });
const output = compileConsole(scene, {
  target: "chromium",
  renderer: "css",
  motion: "reduce",
});
console.log(...output.args);
```

During implementation, execute/typecheck all displayed examples against the current built package. Never show an invented helper merely because it is shorter. The hero's copy action must copy the actual export, not this package example or illustrative pseudocode.

### 3.6 Trust, limits, and navigation

A compact **Built for deliberate messages** section should link to source, MIT license, exact browser evidence, and the integration guide. Include these limitations near the relevant controls as well: CSS previews are approximate; SVG is an image with readable caption; motion is finite/experimental as recorded and cannot update a printed log; other rich profiles require explicit fallback or error; fixed SVG widths can overflow narrow consoles; perfect fitting is not available just because PR #4 exists.

FAQ includes: Does this replace my logger? Is every output selectable? Does it work outside Chrome/Edge? Can I use it without installing? Will it print automatically? What belongs in a production console? Keep answers concrete. Recommend sparse development/opt-in messages, not decorating every event. Use native console inspection and existing operational logging for their normal jobs.

Preserve `/#presets`, `/#playground`, `/studio/`, `/docs/`, and existing `#scene=` links. New `/#use-cases` and `/#use-in-your-app` anchors are additive. Metadata should name browser-console styling and TypeScript use, not only a slogan. Set canonical/public-indexing metadata only for a verified public origin; never expose or reclassify a protected preview. Add social artwork only from shipped/clearly labeled samples, with no invented metrics or ratings.

## 4. Interaction and state contracts

### 4.1 A real quick demo, not a simulated terminal

Hero examples use the existing public compiler and React preview. The mini-editor exposes text plus a small style choice, not a full second editor. Keep its transient scene separate from the persisted playground document. On load, ordinary navigation, sample selection, text editing, comparison changes, filtering, or hydration: **zero library console calls**.

**Test in console** compiles the selected sample with explicit settings and emits exactly once. Show the outcome in page UI, not another console message. Instructions say **Open DevTools → Console, then test this message**. Do not claim to open DevTools programmatically or detect its width/presence. Do not tell visitors to disable paste/self-XSS protections. On mobile or unavailable DevTools, keep copy and page preview useful without pretending the console was inspected.

**Copy console.log** copies the same scene's complete standalone output. Never evaluate generated JavaScript; testing calls the compiled arguments through the existing emitter. Invalid/unsupported requests show diagnostics, preserve text, and do not emit. On unsupported rich targets, explain the recorded target and allow an explicit plain-text choice; do not silently label a rich fallback as equivalent.

**Edit in playground** transfers the exact normalized scene and its explicit renderer choice as one undoable change. If that replaces user work, show a confirm/cancel choice and preserve the prior document in history. Do not save a default hero scene over an existing local draft. A pending shared-scene decision retains priority; subsequent example transfers are disabled until resolved.

**Open full studio** uses the existing validated scene-sharing path, with existing size limits and a visible fallback to JSON export when a scene is too large. It must preserve the editor's current scene, respect destination draft confirmation, and not create a new persistence or URL schema. Do not promise that renderer settings persist in raw SceneV1 links when they are not serialized; recover explicitly in UI. PR #4's future recipe envelope is a separate integration.

### 4.2 Format-aware copying

Use one dominant copy action matching the currently displayed format:

| Displayed format | Primary action / explanation |
| --- | --- |
| Standalone JavaScript | **Copy console.log** — complete source; no runtime package import. |
| TypeScript | **Copy TypeScript example** — requires package/workspace imports. |
| React | **Copy React example** — requires core, React adapter and React. |
| Next.js | **Copy Next.js example** — client-side recipe using existing packages, not a new Next package. |
| JSON | **Copy scene JSON** — editable data, not an executable console statement. |

Provide a secondary standalone shortcut if needed, but never copy different code from what the selected-format action names. On clipboard rejection show selectable full source and a recovery instruction; do not show a success state. Do not remove export-byte diagnostics or motion-branch size information.

### 4.3 Motion and production restraint

All samples start static. A user can explicitly play one supported motion preview; respect reduced/unknown motion preference, preserve the existing maximum five-second duration, and provide a static view. Do not run multiple simultaneous animated gallery images or replay automatically on scroll/hover. Preview replay does not promise restarting a cached console image.

Documentation must demonstrate caller-owned development/opt-in gating. Keep browser emission out of SSR/server rendering; no log inside a React render body. Describe once-per-mounted-instance behavior accurately, including genuine remounts and page reloads. Never claim dead-code elimination or zero production cost merely from a runtime guard. Application examples should avoid private identifiers, complete request objects, tokens, cookies, user details, or real customer data.

## 5. Implementation structure and availability

### 5.1 App-local modules, shared rendering

Proposed paths, to be adapted to actual source without empty scaffolding:

- `apps/studio/src/features/landing/landing-page.tsx`: page narrative and section composition, server-render static copy where practical.
- `apps/studio/src/features/landing/quick-demo.tsx`: small client interaction island, transient scene and explicit test/copy.
- `apps/studio/src/features/landing/examples.ts`: authored, typed example metadata and pure construction through existing public APIs.
- `apps/studio/src/features/landing/use-cases.tsx` and `adoption.tsx`: task explanations, comparisons and integration choices; split only when responsibility warrants it.
- Existing `features/editor/studio.tsx` and document reducer: shared editor/transfers, format-aware copy and preservation of focused mode.
- Existing route files, `app/layout.tsx`, `app/docs/page.tsx`, `styles/studio.css` and `app/globals.css`: integration and restrained styling.
- Extend current studio E2E tests; add app-local example fixtures/tests using existing tools. Inspect exact test filenames before edits.

Example metadata may contain stable IDs, purpose/category, fixture values, selected renderer and availability annotations. Actual renderer/effect capability comes from public compiler/descriptors; qualification annotations cite the existing evidence record. This is not a new public preset catalog, hidden SVG registry, user-import format or remote data service. Do not duplicate semantic content or maintain a separate hero renderer. Before/after views and exports derive from the same normalized text and scene.

### 5.2 Availability states must not lie

Use separate concepts: **implemented/runnable** means the shipped code can construct the sample; **experimental/qualified** describes renderer evidence; **concept** is proposed design only. Merging a spec does not change either implemented or qualified status.

| Item | Baseline / promotion gate |
| --- | --- |
| Current basic presets, custom scenes and integration recipes | Implemented in source; test the exact chosen examples and label their renderer/qualification accurately. |
| Existing finite motion | Keep the current preference/caching limits and evidence status; no blanket all-browser claim. |
| Cinematic profiles | Concept until relevant decision, implementation and profile evidence exist. |
| PR #3 utility/artful cards | Concept until separately implemented; existing simple scene recipes can demonstrate the use case now. |
| PR #4 automatic sizing/compact fitting | Proposal; no “always fits” badge, fake active control, or browser-width detector. |
| npm installation/public launch | Repository says pending. Reverify against authorized release evidence and registry before changing public calls to action. |

Do not block the initial website improvements on PR #3 or #4. Later promotion replaces a concept card with the same verified runtime capability only after its own review. Preserve original reference assets and hashes; website screenshots are not new preset goldens.

## 6. Quality, evaluation, and acceptance

### 6.1 Accessibility and performance

Retain the WCAG 2.2 AA project baseline. Require contrast for labels/actions, non-color status labels, visible focus independent of shadows, keyboard access, meaningful field labels, semantic headings and a skip link. Announce explicit copy/test/error results, not every keystroke. No hover-only action or auto-moving carousel. Stack comparisons on narrow screens; preserve readable text rather than shrinking a utility card indefinitely. Offer full text when image text becomes hard to read.

Keep static hero/use-case/adoption text in the initial HTML. Do not require the full advanced editor bundle to explain the product. Initialize only the selected hero sample, defer offscreen expensive samples/editor where feasible, reserve preview dimensions to prevent jumps, and avoid duplicating compiler or adapter copies in the bundle. Do not add a CMS, font service or animation library for this scope. Use the existing pinned toolchain.

Capture before/after route bundle sizes and page performance under the same recorded environment during implementation. Any regression needs explanation and review; do not publish a numerical speed/size claim without reproducible measurement of the actual artifact/import path. No performance test was run for this documentation PR.

### 6.2 Acceptance criteria

| ID | Done when |
| --- | --- |
| WVS-01 | Initial HTML states the browser-console purpose, shows creative and practical intent, and provides distinct try/adopt actions without implying npm publication. |
| WVS-02 | Three hero choices and six curated examples use valid current APIs and compiler-derived output; operational-looking fixtures are marked synthetic/sample data. |
| WVS-03 | Plain/styled comparisons preserve the exact facts and reading order; no intentionally deficient “before” example or fabricated performance evidence. |
| WVS-04 | Load, SSR, hydration, filtering, text edits, comparisons, sample selection and import produce zero library console calls. |
| WVS-05 | Each successful explicit test produces one call using the selected scene/settings; compile failures produce none and display actionable feedback. |
| WVS-06 | Copy produces complete source for the named format, matching its preview/input; clipboard failure preserves a selectable recovery path and never announces success. |
| WVS-07 | Transfers to the playground/full studio preserve existing draft/share decisions, cancellation, normalized scene content, undo and existing size bounds. Renderer-setting limitations are explicit. |
| WVS-08 | Three professional workflows include a concrete scene, correct caller-owned trigger, a tested integration recipe and the relevant limits; no data-collection or logger-replacement implication. |
| WVS-09 | Standalone and package paths explain dependencies/tradeoffs, expose public imports only, and gate install commands on verified publication. |
| WVS-10 | `%c` comparison acknowledges the native solution; all library differentiators link to current API/evidence rather than fake stars, testimonials, speed gains or adoption numbers. |
| WVS-11 | Concept/experimental/implemented states are distinct; none of the cinematic, PR #3 or PR #4 proposals is presented as completed solely because its spec exists. |
| WVS-12 | Static default, reduced/unknown motion, finite play and cached-console limitations are preserved. No autoplay carousel, console clearing or resize-driven emissions are added. |
| WVS-13 | Keyboard, focus, labels, contrast and reading order pass targeted automated/manual review at 360/768/1280/1440 px and recorded 200%/400% zoom; no page overflow or inaccessible copy/test action. |
| WVS-14 | Static copy is available without client execution; bundle/performance comparison is recorded, hidden demo work is bounded, and no tracking/remote content service is introduced. |
| WVS-15 | Existing anchors, focused studio, docs, valid/invalid share links, saved drafts, failed storage/import and reset/clear semantics pass regression tests. |
| WVS-16 | Public docs show complete tested JS/TS/React/Next examples; SSR/render stays silent and opt-in/development gating is caller-owned, with no unverified zero-cost promise. |
| WVS-17 | Actual Chrome/Edge tests of featured demo snippets are linked to exact artifacts/builds, separately from page screenshots. Missing qualification stays labeled and blocks promotion of the affected claim. |
| WVS-18 | A review receipt records the formative user tasks, results, unresolved gaps and copy decisions. Proposed target: four of five developers explain both use types, choose an adoption path, and complete a first desktop test within 90 seconds with initial DevTools instructions. This is a usability target, not a marketing statistic. |

### 6.3 Validation commands and manual scenarios

Re-read current scripts first. At the inspected revision the existing commands include:

```sh
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm test:studio
pnpm test:consumers
pnpm check:bundle-size
```

Use targeted app example/interaction tests first, then the affected full suites before review. Package-consumer regression matters for copied framework recipes even though no core code should change. This list is an implementation validation plan; none of these application commands was run for this spec save.

Manual cases: first visit; resumed draft; different shared scene; cancelled replacement; repeated test clicks; narrow/mobile screen; reduced motion; clipboard denied; invalid rich combination; literal percent/control-text fixtures; copy each export format; return from focused studio; screen-reader walkthrough as nonblocking follow-up under ADR-0013; package-not-published status. Test synthetic support data with deliberate secret-looking input to confirm documentation does not claim automatic redaction; never use real secrets.

Formative study: five web developers, including two unfamiliar with ConsoleFX. Ask them to explain the product without prompts, customize and test one message, find a professional use, choose snippet versus package, and identify a limitation. Record task success/time and misunderstandings manually with consent. Revise unclear copy before public promotion; no analytics SDK, session replay or fingerprinting is authorized.

## 7. Delivery, recovery, and handover

**Phase A — first useful success:** implement the hero, curated existing-capability examples, three practical workflows, format-aware copying and draft-safe transfers. Validate WVS-01 through WVS-08 plus existing editor regressions. This phase does not depend on new presets or responsiveness.

**Phase B — adoption and trust:** complete public-API recipes, native comparison, claim/publication gating, navigation/metadata and task-based docs. Validate WVS-09 through WVS-11 and WVS-15/16.

**Phase C — polish and evidence:** performance/accessibility review, actual featured-output qualification and moderated tasks. Record WVS-12 through WVS-18 evidence in a future `docs/specs/website-value-implementation-evidence.md`. Launch/deployment requires separate authorization.

**Later:** promote separately implemented cinematic/utility/fitting features using their evidence, not a website-local reimplementation. Existing default scenes, core exports, accepted ADRs, dependencies, presets, and stored documents remain protected.

Rollback is the isolated website implementation commit/PR, not resetting user storage or reverting unrelated library work. No migration is planned. Retain current routes and fragment compatibility. On a bad demo, remove it from the curated list or show its accurate concept/qualification state rather than replacing the compiler with hard-coded output. Never force-push another proposal branch.

### Companion implementation prompt

> Read AGENTS.md, the relevant Accepted ADRs, this spec and website-value-evaluation.md. Reinspect current main, source, publication/compatibility evidence and related proposals. Confirm the authorized implementation phase; this documentation PR alone does not authorize implementation. Build the website narrative around existing public ConsoleFX APIs. Preserve quiet neumorphic/cyan UI, exact-scene preview/export, silent edits, one explicit emission and all draft/share recovery. Do not implement proposed presets/fitting, add telemetry, change a public API, install a new stack, publish or deploy. For each slice, add focused tests, run the applicable existing scripts, record source/page/native/release evidence separately and disclose missing checks. Mark new claims as pending until their specific evidence exists. Report changed paths, criteria covered and remaining gates.

## 8. Sources, assumptions, and verification record

Primary repository sources are linked above at their current paths; the audit revision is pinned in the front matter. Relevant external sources checked on 2026-09-12:

- [Chrome: formatting and styling console messages](https://developer.chrome.com/docs/devtools/console/format-style): native `%c` and data-URL backgrounds exist; a library adds composition/tooling, not an exclusive capability.
- [Next.js: server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components): keep browser interactions in client boundaries while rendering static explanation without a monolithic client dependency.
- [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): informs controlled motion; the product's static-default/five-second policy is intentionally stricter than merely quoting a criterion.
- [stark AI Developer specification workflow](https://github.com/stark-ai-de/agent-skills/blob/main/plugins/stark-ai-developer/skills/codex-spec-interviewer/SKILL.md) and its source-challenge/ADR guidance: used as authoring references, not a claim of native Plan-mode activation or a separately executed agent.

Assumptions for review: English-first copy; developers are the audience; maintain current dark neumorphic/cyan direction; improve comprehension before adding tracking; static useful examples are enough for the first release of this website work. Detailed final copy, featured scenes and numerical usability targets remain reviewable proposals.

**Source challenge result:** existing code supports the reusable-library story, but future card/fitting features and publication must stay gated. A website-only change can deliver the main benefit without changing shared architecture. No additional ADR is proposed. No core, runtime, preset or prior-PR implementation is included.

**Verification status:** source inspection and documentation validation only for this PR. No current hosted-site inspection, application build/tests, native DevTools exercise, user study, package publication or deployment was performed. The maintainer has not yet accepted the detailed copy or implementation criteria. Preserve that distinction in the PR description and later evidence receipt.

## Integration review — 2026-09-12

The active maintainer request to review/merge all PRs and fully implement all specifications supplies implementation authority for this app-local work. The original source audit remains pinned historical evidence. Current accessibility follows Accepted ADR-0013: missing Narrator/NVDA observations are nonblocking follow-up, while keyboard, focus, contrast, zoom/reflow and recovery checks remain required. A moderated developer study is still unperformed; no automated or agent check substitutes for participant evidence.
