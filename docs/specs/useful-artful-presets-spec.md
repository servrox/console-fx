---
title: "ConsoleFX — useful and artful preset collection"
status: "approved for implementation; runtime evidence pending"
created: "2026-09-12"
artifact_path: "docs/specs/useful-artful-presets-spec.md"
mode: "deep"
repository: "servrox/console-fx"
inspected_revision: "3c42e12d705b044809c05579f762bcb8c137890a"
owner: "ConsoleFX maintainer"
source_request: "Add a PR describing more useful and artful presets; include an individual visual mockup for later comparison."
implementation_authorized: true
---

# Useful + artful presets

## 1. Review this collection

Propose **ten new presets**, five practical summaries and five original graphic treatments. Every preset has its own 720 × 240 editable SVG, fixed sample input, semantic text fixture, and comparison criteria. This PR contains design/specification artifacts, not implemented presets or a release.

[Open the individual preset specifications and images](../mockups/preset-collection-v1/README.md) · [Comparison procedure](../mockups/preset-collection-v1/comparison.md) · [Fixture data](../mockups/preset-collection-v1/fixtures.json)

The [visual overview](../mockups/preset-collection-v1/README.md) embeds the same ten individual SVG files used in the detailed preset entries; there is no separate, potentially inconsistent overview artwork.

| ID / proposed factory | Purpose | Distinct visual direction | Reference |
| --- | --- | --- | --- |
| `buildReceipt` | Summarize a supplied build/deployment result | Pale receipt, green status, aligned facts, tear edge | [SVG](../mockups/preset-collection-v1/buildReceipt.svg) |
| `requestTrace` | Show a single request and three supplied stages | Ordered timeline, restrained cyan nodes, right-aligned total | [SVG](../mockups/preset-collection-v1/requestTrace.svg) |
| `serviceReady` | Present startup/environment details | Hardware-like service passport, inset icon, clear endpoint | [SVG](../mockups/preset-collection-v1/serviceReady.svg) |
| `commandCard` | Show a next step without executing it | Muted step number and recessed command well | [SVG](../mockups/preset-collection-v1/commandCard.svg) |
| `releaseBulletin` | Announce a supplied release and two highlights | Editorial paper, serif headline, small version stamp | [SVG](../mockups/preset-collection-v1/releaseBulletin.svg) |
| `blueprint` | Give an engineering project a signature | Original cube construction, drafting lines, quiet grid | [SVG](../mockups/preset-collection-v1/blueprint.svg) |
| `contourMap` | Give a product a calm directional identity | Fixed topographic curves, clear type-safe area | [SVG](../mockups/preset-collection-v1/contourMap.svg) |
| `letterpress` | Create a tactile, understated welcome | Shallow recessed serif type on warm paper | [SVG](../mockups/preset-collection-v1/letterpress.svg) |
| `signalHalftone` | Give a creative tool a two-ink poster identity | Teal disc, terracotta halftone, explicit two-line title | [SVG](../mockups/preset-collection-v1/signalHalftone.svg) |
| `orbital` | Give a runtime/product a mission-card signature | Sparse orbital rings, small amber satellite, clean title | [SVG](../mockups/preset-collection-v1/orbital.svg) |

These complement the nine existing basic presets and the separately approved [cinematic metal presets](cinematic-metal-presets-spec.md). They do not rename or replace `gold`, `chrome`, or the four cinematic proposals. Existing work and prior visual references remain intact.

**Review checkpoint:** On 2026-09-12 the maintainer explicitly answered “Approve ADR-0014 and all ten designs,” including the prepared ordinary scene slots and Windows local-font fallbacks. The active request authorizes full implementation and integration. The original PR was documentation only; approval does not claim runtime or release evidence.

## 2. Product boundaries

Every initial preset is **static**. Compilation prints nothing; an explicit emission calls the sink exactly once. The standalone export contains one `console.log(...)`, including a reset-styled readable caption. There are no timers, automatic logging, console clearing, patched console methods, network calls, or page mutations.

Useful presets format **caller-provided snapshots**. They do not inspect builds, tests, HTTP requests, processes, environment variables, releases, or service health. The status words, latency, version, and service details in the mockups are synthetic examples, not repository measurements or claims. Request-node spacing encodes order, not proportional time. Artwork is not telemetry, geography, live progress, or a real architecture diagram.

Do not execute the command in Command Card or turn depicted controls into console interactions. Do not introduce a tracing product, terminal emulator, table API, data source connector, charting package, live monitoring, font loader, SVG uploader, or public template/plugin system.

Retain the [current interface direction](../mockups/README.md): professional minimalism, soft neumorphic depth, and small cyan accents. Graphic treatments belong to the **output plate**, not to the surrounding studio interface. No purple theme, broad glow, or particle background. Light paper presets must remain visually contained when placed in a dark console; dark plates remain legible in a light console.

No package publication, deployment, release automation, or dependency upgrade is authorized by this PR.

## 3. Repository source challenge

The branch was inspected at `3c42e12d705b044809c05579f762bcb8c137890a`. The implementation now exists; historical statements about an empty repository are not the baseline.

| Source | Observed constraint | Consequence |
| --- | --- | --- |
| [Preset catalog](../../packages/console-fx/src/presets/index.ts) | Nine built-ins, `PRESETS`, named factories, `preset(id, options)` | Extend the same catalog and retain existing IDs/defaults. |
| [Model](../../packages/console-fx/src/model/types.ts) | Versioned text lines/runs; no general card or graphics tree | Exact card-wide layouts require a reviewed bounded presentation extension. |
| [Validation](../../packages/console-fx/src/validation/index.ts) | Strict known keys, owned enums, normalized immutable data | New fields require explicit schemas; never accept mockup SVG as imported scene data. |
| [Browser compiler](../../packages/console-fx/src/browser/index.ts) | One static effect per run; explicit renderer/fallback policy | Do not disable combination checks to reproduce whole-card art. |
| [SVG renderer](../../packages/console-fx/src/renderers/svg.ts) | Flow-based text layout, local font stacks, owned SVG templates | Existing flow layout cannot faithfully reproduce all ten cards without an extension. |
| [Studio](../../apps/studio/src/features/editor/studio.tsx) | Catalog-backed gallery/selection and shared compiler preview/export | Integrate here; do not ship ten hard-coded app-only images as completed presets. |
| [React adapter](../../packages/console-fx-react) | Preview and explicit emission consume compiled scenes | Reuse it; no preset-specific React components or Next.js package. |
| [Resource and safety decision](../adrs/0005-generate-output-from-validated-data.md) | Bounded validated data, internal SVG references, no external fonts | Keep the limits and original geometric artwork; no font assets. |
| [Compatibility decision](../adrs/0006-qualify-renderer-profiles-in-real-devtools.md) | Image previews and actual DevTools evidence differ | Mockups cannot establish rich console support. |
| [Cinematic ADR](../adrs/0012-use-bounded-cinematic-lettering-profiles.md) | Separately approved single-run cinematic effect | This collection does not replace that decision. |

Chrome documents `%c` styling and data-URL image backgrounds [E1]. SVG's secure image modes distinguish image rendering from interactive/scripted documents [E2]. These support the rendering direction, not a browser-support claim for these unimplemented presets. No external documentation settles a product-specific layout or gives permission to alter accepted local contracts.

**Result:** preserve the existing pure compiler, validated scene, package boundaries, and explicit fallbacks. Propose one bounded card-wide presentation seam instead of pretending the current flow renderer already supports exact card geometry. No new external runtime dependency is required by this proposal.

## 4. Architecture proposal and gate

**ADR required: yes.** [ADR-0014](../adrs/0014-use-closed-preset-presentations.md) proposes a closed, static, scene-level presentation contract because this changes a shared JSON/API boundary. Status is **Accepted**, with explicit maintainer approval recorded on 2026-09-12. It supersedes none of the accepted decisions, including the separately approved cinematic ADR-0012 and accessibility successor ADR-0013.

### 4.1 One scene, not two models

Add an optional `presentation` field to the existing version-1 scene through the explicit compatibility policy below. The proposed shape is:

```ts
// Proposed contract; not currently exported.
interface PresetPresentationInput {
  readonly kind: "presetCard";
  readonly profile: PresetPresentationProfile; // Closed, versioned IDs below.
  readonly accent?: string;                   // Existing validated hex-color rules.
  readonly detail?: "minimal" | "standard";
  // Valid only for requestTrace/v1; materialized during normalization.
  readonly tone?: "success" | "warning" | "error" | "neutral";
}
```

Profiles are `buildReceipt/v1`, `requestTrace/v1`, `serviceReady/v1`, `commandCard/v1`, `releaseBulletin/v1`, `blueprint/v1`, `contourMap/v1`, `letterpress/v1`, `signalHalftone/v1`, and `orbital/v1`. Normalization resolves `accent` and `detail`, plus `tone` for Request Trace only (direct-authoring default `neutral`; rejected on other profiles); it never stores a live lookup to mutable preset defaults. A profile is an immutable renderer algorithm version, not a pointer to the latest factory configuration. A redesign that changes stored meaning receives a new profile ID.

All visible strings live in ordinary `scene.lines[].runs[].text`, in documented reading order, with normalized text styles. The profile descriptor maps named content slots to those line/run positions and owns their geometry. Text is **not duplicated** in the presentation object, SVG blobs, raw markup, JSX, or arbitrary key/value payloads. Every visible fixed label also maps to a run, so the plain-text caption includes labels and units rather than a misleading list of values.

The proposed [materialized scene fixtures](../mockups/preset-collection-v1/scene-fixtures.json) map every semantic slot to an ordinary line/run. Adjacent slots on one line have a locked, ordinary two-space separator run; this preserves readable captions and text on explicit detachment. The ten scenes use at most six lines and twenty runs. Review these fixtures with ADR-0014 before runtime implementation. The SVGs' pixel coordinates and design fixtures' `factoryInput` objects are documentation data, **not an already supported SceneV1 import format**. Do not ship that design-file format as a second scene model.

The presentation descriptor is the common source for slot labels, compatible typography, row/run shape, text limits, profile version, parameter controls, and renderer support. It is internal owned metadata with a read-only consumer view, not arbitrary layout registration. Preset selection materializes normalized data; editor, preview, export, and package users consume the same scene.

### 4.2 Profile invariants

Profiles own layout, ornamental geometry, and decorative font treatment. Width and height remain `scene.surface` values. The reviewed design baseline is 720 × 240 CSS px. Within the existing maximums, uniformly scale the design unit box to fit the chosen surface and center it; do not stretch lettering to a different aspect ratio. Enforce padding and safe text regions. Non-matching aspect ratios may leave space; report that approximation rather than cropping content.

Normal text style fields remain validated and materialized. Profile descriptors state which styles are user-editable. Unsupported family/size/weight combinations produce an actionable diagnostic; do not silently ignore imported text styles. Profile-owned shadows or shallow embossing are not represented by stacking additional user effects.

Presentation scenes initially permit **no run effects or decorative motion**. Existing effect combinations on non-presentation scenes keep their current behavior. Applying a card to an already-effected document requires a reversible, explicit conversion; do not silently discard effects. Removing the card presentation likewise requires an explicit action and leaves all text available in ordinary flow layout.

`detail: "minimal"` removes nonessential ornamentation but preserves all text, labels, status words, and order. `accent` changes only descriptor-declared accent geometry; it must not recolor status semantics, all text, or a paper surface into an unreadable combination. Limits and unsupported style cases are resolved in the core, not only in sliders.

### 4.3 API and dispatcher

Add the ten named factories to `@servrox/console-fx/presets`. Utility factories take typed named content, not arbitrary objects. The expected fields and fixed sample values are in each preset's catalog entry and `factoryInput` fixture. Utility calls require their substantive fields; they never fill in current system facts. Artwork factories may use their explicit sample titles as defaults.

Extend the typed dispatcher with a per-ID options map or overloads, preserving existing `PresetOptions` exports and every existing call signature. Do not widen the new factories to `Record<string, unknown>` or cast invalid field combinations into `SceneV1`. Catalog demos supply explicit example inputs. Selecting a demo is visibly labeled **Sample data** in the studio and never prints automatically.

```ts
// Proposed usage after ADR acceptance and implementation.
import { buildReceipt } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";

const scene = buildReceipt({
  project: "atlas-web",
  outcome: "PASSED",
  revision: "a1b2c3d",
  duration: "2.34 s",
  checks: "48 / 48",
  environment: "preview",
});

const output = compileConsole(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "reduce",
  unsupported: "error",
});
console.log(...output.args);
```

The example uses synthetic inputs. Numeric-looking fields are caller-provided display strings in this first collection; no sorting, totals, pass-rate calculations, unit conversion, or HTTP-status inference is implied. Build Receipt uses an explicit outcome enum (PASSED/FAILED/WARNING/UNKNOWN); Service Passport an explicit state enum (READY/DEGRADED/OFFLINE/UNKNOWN), with descriptor-owned word/icon/color mappings. Request Trace takes a separate explicit tone (success/warning/error/neutral), persisted in `presentation.tone`; JSON, history, sharing and editor changes preserve it independently of accent and status text. It does not infer that tone from the status string. Request Trace accepts exactly three named display stages; Release Bulletin exactly two highlights. General timelines, arbitrary rows, arithmetic, and inferred state are outside this scope.

### 4.4 Compatibility and fallback

| Producer / consumer | Required behavior |
| --- | --- |
| Existing v1 scene → new reader | Same normalization/meaning and existing snapshots; omit `presentation` when absent. |
| New presentation scene → new reader | Validate the closed profile and slots; render only with compatible requested settings. |
| New presentation scene → old reader | Explicit rejection of unknown data; preserve current draft, do not pretend compatibility. |
| Unknown profile/version → new reader | Error before rendering; retain imported source and current document. |
| Valid scene → explicit text renderer | Complete readable content; static output; no graphics required. |
| Valid presentation → CSS or unsupported target, strict policy | Structured unsupported-presentation/renderer error; no partial image or silent style loss. |
| Same valid request, explicit fallback policy | Plain text plus diagnostics; exactly one call if the caller emits. |
| Valid text exceeds profile's rich-layout capacity | Strict rich request errors; explicit fallback returns full text with an overflow reason. |
| Unsafe/malformed/over-global-limit data | Validation failure; fallback is not a validation bypass. |

No destructive migration, removal of old readers, or schema renumbering is proposed. Tests must prove the matrix before promoting the shared API; ADR-0014 acceptance can revise this versioning choice. Exporting standalone JS eliminates the package dependency at execution time, not the need to validate the generating scene.

## 5. Layout and resource policy

For each profile, use the individual mockup and fixture as a design target, not as imported runtime markup. The title/body/label slots must match fixture content exactly at the baseline. Preserve literal `%c`, quotes, `<`, Unicode, and embedded newlines through the existing serializers. Titles may contain non-ASCII text; never map unsupported glyphs to blanks. Do not truncate, wrap invisibly, upper-case, or squeeze glyphs as an implicit normalization step.

Expose long-text constraints before emission. Initially bound utility single slots to 80 code points, headline slots to 48, artwork subtitles to 80, and command slots to 120, in addition to global limits. These are rich-layout capacity bounds, not permission to reject shorter Unicode captions from explicit plain text. Determine actual fit conservatively using the profile's safe region and font policy; size caps alone do not prove fit. Document approximation when OS font metrics vary. No DOM text measurement or font fetching in the pure compiler.

Keep all existing ADR-0005 limits: input 64 KiB, 2,000 text code points including labels, eight visual lines, 32 runs, 1,200 × 400 maximum CSS pixels, and 1,000 SVG elements. Warn at 32 KiB and refuse standalone snippets above 128 KiB. Estimate profile complexity before allocating geometry and enforce actual generated-byte/element limits after generation. Patterns also have bounded repeated density: at most a 216 × 216 ornamental region with a six-unit halftone grid in the design baseline; contour lines at most 14. No seed/time/randomness controls in v1.

The documentation overview is a table of ten separate images, not one exported console image. Each reference is 720 × 240 and stays within the proposed per-message limits.

Use only authored geometry, ordinary local font stacks, XML-escaped strings, and internal fragment references. No scripts, event handlers, `foreignObject`, external links/resources, embedded fonts, remote SVG, or raw CSS fields. Surface overflow may clip decorative geometry at the artboard edge; never mask text to hide layout failures. Plain-text caption and preview alt text include all meaningful content exactly once even when an emboss effect draws duplicate decorative glyphs.

## 6. Studio and framework integration

The landing-page gallery and focused studio both list the same ten descriptors, grouped **Useful** and **Artful**. Grouping must not change the existing preset IDs or remove the basic/cinematic groups. Preset cards compile their example scenes using the real core renderer once it exists; the mockup SVGs remain comparison assets, not gallery implementation shortcuts.

Selecting a preset loads one editable normalized scene into the current undoable document. The UI provides named content fields, accent/detail controls, renderer/fallback feedback, and the usual export actions. The profile's locked structural slots are evident. Structural edits or effects incompatible with the profile require an explicit detach/convert action with undo; importing an incompatible structure never silently drops rows. Import, share links, saved local drafts, undo/redo, and reset must preserve profile and content together.

**Copy console.log** exports complete executable standalone source. **Test in console** sends compiled argument arrays directly to the sink, never `eval()` of generated code. Editing fields, choosing examples, changing preview backgrounds, and importing files emit zero messages. JSON/TypeScript/React/Next.js exports carry the full materialized scene including presentation data, not an image URL or a future factory dependency.

Use the existing `ConsolePreview`, `useConsoleScene`, and `ConsoleBanner`. The SVG preview displays the exact image URI produced by the compiler. Preserve client boundaries, server-safe compilation, Strict Mode behavior, and existing explicit mount/event semantics. No separate `@servrox/console-fx-next` package or preset-specific hook is needed.

Keyboard selection, visible focus, descriptive labels, readable errors, and the existing accessibility baseline remain required. Status cards include words/icons as well as color. Output artwork can be a rich image, but it is never the sole accessible representation. No animation is added; reduced-motion/unknown preference produces the same static result.

## 7. Comparison-ready deliverables

Every preset has all of the following in [the collection folder](../mockups/preset-collection-v1/README.md):

- Its own SVG with a title/description, stable 720 × 240 artboard, no remote assets, and no executable content.
- A `fixtures.json` entry containing stable ID/profile, fixed factory input, ordered visible text, and stable slot identities; SVG source stores geometry/style, while individual catalog entries document controls, landmarks, and acceptance criteria.
- A byte fingerprint in `sha256.json`, plus a standard-library-only structural/semantic reference validator.
- An individual catalog section embedding that SVG, distinguishing sample values from real measurements.

The overview is supplemental, not a substitute for individual baselines. `baselineStatus` is **accepted**, following the explicit 2026-09-12 review of all ten designs and their slot fixtures. Do not overwrite the reference to conceal an implementation mismatch; a baseline change needs a separate reviewed revision and a reason.

Comparison has three layers: **exact semantic content**, **geometry/color/structural intent**, then **environment-specific raster appearance**. Follow [comparison.md](../mockups/preset-collection-v1/comparison.md). No single global percentage-difference threshold is allowed to hide missing labels, bad status words, dropped commands, or clipping. Source hashes prove integrity/reproducibility only; they do not prove implemented behavior or DevTools support.

## 8. Implementation phases and file plan

| Phase | Work | Exit gate |
| --- | --- | --- |
| 0 — review | Approve/revise the ten visuals, slot schema, and ADR-0014 | Accepted shared contract; agreed comparison baseline. No runtime work before that gate. |
| 1 — vertical slice | Shared presentation metadata + validation; Build Receipt and Letterpress; strict/text fallback | Old-scene tests pass; two exact semantic fixtures; end-to-end preview/export/emission parity. |
| 2 — collection | Remaining eight profiles, bounded geometry, named factories and catalog entries | All ten individually compared; per-profile rich capability failures handled. |
| 3 — integration | Useful/Artful gallery grouping, field editing, drafts/import/export and React/Next recipes | Both app entry points behave identically; no editing emissions or document loss. |
| 4 — qualification | Package consumers, security/accessibility tests, actual Windows Chrome + Edge checks | Evidence per preset; scoped release authorization still separate. |

Expected existing areas: `packages/console-fx/src/model/types.ts`, `src/validation/index.ts`, `src/presets/index.ts`, `src/browser/index.ts`, `src/renderers/svg.ts`, `src/codegen/`, `apps/studio/src/features/editor/studio.tsx`, `apps/studio/src/features/persistence/`, package tests, studio tests, and docs. Proposed new modules: `packages/console-fx/src/presets/presentations.ts` for owned descriptors and `packages/console-fx/src/renderers/presentations/` for bounded rendering helpers. Names are implementation proposals, not files created in this PR.

Root imports must not pull in the whole new artwork catalog, React, or Next.js. Keep the existing ESM entry points. Use current toolchain pins and public-package consumer checks; do not add a drawing library to reproduce simple SVG geometry. The reference validator in this PR is documentation tooling only; importing it into the app or shipping it in npm would be a scope error.

Protected areas in this PR: all runtime sources, manifests, lockfile, CI/publication/deployment config, accepted ADR text, original specs, old mockups, and the cinematic proposal. Only the new documents/mockups and minimal architecture index entry are proposed changes.

## 9. Acceptance criteria

| ID | Done when |
| --- | --- |
| UAP-01 | All ten IDs have a factory, catalog entry, fixed input, individual mockup, and individual comparison result. No empty placeholder card. |
| UAP-02 | For the fixed fixture, every meaningful label/value is present and the reading-order caption is exact; synthetic values are not presented as project measurements. |
| UAP-03 | Factories and compilers emit nothing. Each explicit emission and each executed standalone export makes exactly one sink call. |
| UAP-04 | Old preset IDs, normalized scenes, public imports, and supported effects retain their previous behavior. |
| UAP-05 | New shared data obeys the old/new reader matrix, with no destructive import, implicit migration, or hidden document loss. |
| UAP-06 | SVG output matches named layout landmarks and safe regions; default references have no clipped text. Long/wide/Unicode input has an explicit strict/fallback result. |
| UAP-07 | Useful cards never read ambient state, compute metrics, execute commands, fetch URLs, or poll. |
| UAP-08 | Artwork geometry is fixed and bounded; repeated compilation with identical resolved inputs is byte-stable. |
| UAP-09 | Forbidden markup/resources and prototype/accessor attacks fail before rendering; semantic percent tokens and Unicode survive export. |
| UAP-10 | Choosing/editing/importing a preset emits zero logs; Test emits once; Copy returns the same resolved scene's complete export. |
| UAP-11 | All formats, persistence, undo/redo, and React/Next integration preserve presentation and content; no studio-only rendering path exists. |
| UAP-12 | Accessibility is checked independently of appearance; status and text do not depend solely on color or an image. |
| UAP-13 | Packed-package imports and bundle-size checks pass; no new external assets, font files, runtime dependency, or publication occurs implicitly. |
| UAP-14 | Actual DevTools observations exist per intended rich profile in Windows Chrome and Edge, with precise build, OS, width, zoom, theme, candidate SHA, and artifact paths. |
| UAP-15 | Comparisons reference the reviewed mockup/fixture hash and distinguish SVG/image validation from actual DevTools evidence. |

## 10. Validation and evidence

### This documentation PR

```sh
python docs/mockups/preset-collection-v1/validate_mockups.py
```

Additionally parse all SVGs and JSON; verify ten unique entries, one individual image per entry, expected dimensions, valid internal references, no forbidden elements/URLs, exact text fixtures, hashes, and changed-file whitespace. Inspect all individual plates at native size and the combined overview. Record the actual results in the collection's comparison document. These checks do not validate unimplemented factories or application code.

### Later authorized implementation

Inspect current `package.json` first. The existing workspace provides these relevant commands; use the pinned project Node/pnpm environment, not whichever host Node happens to be present:

```sh
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test
pnpm test:codegen
pnpm test:studio
pnpm test:consumers
pnpm check:packages
pnpm check:bundle-size
pnpm build
pnpm fixtures:devtools
```

Add focused tests for slots/profile unknown keys, exact caption ordering, empty/long/wide/RTL/emoji/combining text, newline behavior, literal `%c` and `%s`, malicious command strings, unknown profiles, incompatible effects, generated-byte/element bounds, factory immutability, parameter defaults, and old/new document fixtures. Use recorded sinks for call counts and AST checks for standalone code, without executing user commands.

Actual console qualification remains separate from browser image rendering. Test light/dark themes, narrow consoles, zoom, repeated entries, and copied captions per ADR-0006. Static profiles can progress independently of the cinematic proposal; do not advertise this collection as supported until its own evidence exists.

## 11. Rollout, rollback, and unresolved review choices

Ship a small reviewed vertical slice before the whole collection. Preserve prior profiles and schemas. A rollback can remove new gallery exposure while keeping readers and plain-text recovery for saved presentation scenes; never destroy users' stored documents to disable artwork. Revert only the implementation slice under review. Documentation goldens remain versioned evidence rather than moving to match whatever rendered.

Resolved by the 2026-09-12 review: ADR-0014 acceptance, all ten visual baselines, ordinary scene slot mapping and declared local font stacks including Windows fallbacks. Runtime API integration and rich-layout qualification still require implementation evidence. Global safety, one-emission behavior, static scope, and no-purple/minimal studio direction are preserved requirements, not optional review questions. Exact publishing/deployment status is irrelevant to creating this proposal and has not been inferred.

## 12. Companion implementation handover

> Read `AGENTS.md`, the applicable Accepted ADRs, this spec, and `docs/mockups/preset-collection-v1/README.md`. Do not implement the new shared presentation boundary until ADR-0014 and the visual baselines have explicit maintainer acceptance. Re-inspect current code and preserve concurrent changes. Implement the vertical slice first without changing old preset semantics or accepted boundaries. Use the exact fixture inputs and individual SVGs; create separate actual-render artifacts and comparisons rather than editing goldens to fit. Keep all text in the shared scene, compile silently, and emit once. Integrate via the existing catalog, compiler, preview, and export APIs. Record semantic, structural, raster, package, and actual DevTools evidence separately. Do not publish or deploy without separate authorization.

## Sources

- [E1: Chrome DevTools — format and style messages](https://developer.chrome.com/docs/devtools/console/format-style), checked 2026-09-12 for `%c` and data-URL image behavior.
- [E2: W3C SVG — conformance and secure image processing modes](https://www.w3.org/TR/SVG/conform.html), checked 2026-09-12 for image-mode resource restrictions.
- Repository source and local ADR links in section 3; those are the integration authority at the inspected revision.
- [stark AI Developer — Codex Spec Interviewer](https://github.com/stark-ai-de/agent-skills/blob/main/plugins/stark-ai-developer/skills/codex-spec-interviewer/SKILL.md), version 0.3.4 inspected, and its source-challenge/ADR-gate references. This PR is a review proposal with source-backed constraints, not a claim of completed implementation or user-approved new architecture.
