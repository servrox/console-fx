---
title: "ConsoleFX — responsive sizing and reliable content fitting"
status: "proposed; documentation and research PR"
created: "2026-09-12"
artifact_path: "docs/specs/responsive-fitting-spec.md"
repository: "servrox/console-fx"
inspected_revision: "3c42e12d705b044809c05579f762bcb8c137890a"
related_proposal: "PR #3 at 6c6ab18e76f5ff12c6f45e1c20060e9105e2ed88"
mode: "deep"
owner: "ConsoleFX maintainer"
implementation_authorized: false
---

# Responsive sizing and reliable content fitting

## 1. Outcome and authorization

Make ConsoleFX fit **content inside a chosen frame**, fit **that frame into a console where possible**, and preserve **readability at small sizes**. These are three distinct contracts, not a single `responsive: true` promise.

The user requested a PR containing the recommendations from the responsiveness evaluation. This PR saves a proposal, an architectural decision, and an isolated research probe. It does not implement a public API, change existing presets, approve an ADR, merge another PR, publish packages, deploy, or authorize those actions. Detailed contracts below remain subject to maintainer review.

[Research probe and qualification procedure](../research/console-fit/README.md) · [Proposed ADR-0014](../adrs/0014-separate-content-fit-from-output-sizing.md)

### Deliver in this order

1. Opt-in fixed-frame fitting: meaningful text measurements, authored geometry, safe paint bounds, deterministic overflow handling.
2. Reviewed compact layouts for useful cards; do not just miniaturize them.
3. Experimental Chromium container-relative SVG sizing, separately gated by actual DevTools evidence.
4. A playground Fit inspector with explicit sizes, comparison views, and visible uncertainty.
5. Per-profile Windows Chrome/Edge qualification before advertising support.

The intended claims are **fits the declared frame under the recorded measurement conditions** and, once qualified, **browser-resolved scaling in named DevTools profiles**. Never claim universally perfect fit or knowledge of an unobservable console width.

## 2. Evidence and current source constraints

Inspected `main` at the revision above. The package, React adapter, studio, and scripts already exist; historical empty-repository statements in the original spec are not the implementation baseline.

| Evidence | Observation | Consequence |
| --- | --- | --- |
| [SVG renderer](../../packages/console-fx/src/renderers/svg.ts) | Width estimates use code-point count times a font factor (0.61 or 0.6) plus spacing; overflow produces `possible-clipping`. | Add an opt-in layout phase, not more unexplained multipliers. |
| [Browser compiler](../../packages/console-fx/src/browser/index.ts) | SVG space is reserved by fixed pixel padding; `contain` sizes the image inside that fixed box. Options currently accept only target, renderer, motion, unsupported. | Add validated layout/sizing options; background containment alone is not console responsiveness. |
| [CSS renderer](../../packages/console-fx/src/renderers/css.ts) | Native text has approximate layout and effect padding. | Keep CSS/native wrapping separate from a precise SVG layout contract. |
| [Scene model](../../packages/console-fx/src/model/types.ts) and [validation](../../packages/console-fx/src/validation/index.ts) | Shared, strict versioned data; bounded dimensions and text. | Preserve legacy normalization; validate every new request and metadata field. |
| [Studio](../../apps/studio/src/features/editor/studio.tsx) and [React adapter](../../packages/console-fx-react) | Both consume the core compiler. | Use the same layout result and exact SVG URI; no independent preview renderer. |
| [Cinematic specification](cinematic-metal-presets-spec.md) | Original path lettering and local-serif treatments are proposed. | Geometric and font-based fitting have different confidence levels; ADR-0012 remains Proposed. |
| [PR #3](https://github.com/servrox/console-fx/pull/3) | Card presentation proposal uses a 720 × 240 reference and uniform scaling; ADR-0013 is proposed on that branch. | Compact reflow changes that proposed contract. Do not silently reinterpret its v1 references. |

Primary platform sources are listed in section 13. The Console standard exposes no supported message-area dimension or returned log-element API [E1]. Chrome documents CSS styling and data-URL backgrounds [E2]. Its inspected frontend creates styled inline blocks with paint containment and a maximum width; its style sanitizer allows padding/background but not arbitrary display/width/aspect-ratio controls [E3, E4]. This supports an experiment, not a portable guarantee.

### Rejected detection strategies

Do not implement `getConsoleWidth()` using `window.innerWidth`, `outerWidth - innerWidth`, page resize events, device-pixel ratio, timing tricks, getters invoked by object inspection, `debugger`, or detection of whether DevTools is open. None provides the supported message-area contract this feature needs. An extension, remote debugging session, or custom DevTools panel is out of scope.

`ResizeObserver` is appropriate for our own preview element [E8], not DevTools' private DOM. Viewport-relative units are not a substitute for the message's containing block. Do not query or mutate the frontend, and do not read browser state inside the pure compiler.

## 3. Architectural decision and dependency boundaries

**ADR required: yes.** Proposed [ADR-0014](../adrs/0014-separate-content-fit-from-output-sizing.md) separates content layout from output sizing and makes environment-derived measurements explicit data. It also defines how a render recipe carries options without corrupting SceneV1. Implementation of the new shared contract waits for explicit acceptance.

Governing accepted decisions: ADR-0002 (pure compilation/single emission), ADR-0003 (one scene and compatibility), ADR-0004 (package boundaries), ADR-0005 (validation and budgets), ADR-0006 (renderer qualification), ADR-0007 (local persistence), ADR-0009 (proportional evidence), and ADR-0011 (accessibility). Their accepted text and status remain unchanged.

ADR-0013's number is reserved by open PR #3, so this proposal uses 0014. This branch targets main independently and links to PR #3 rather than copying or modifying its files. Reconcile both index additions when both PRs land. No acceptance of ADR-0012 or ADR-0013 is implied.

Fixed-frame work can proceed independently after its own approval. Cinematic integration additionally needs ADR-0012 and the relevant implementation; compact card integration additionally needs ADR-0013 and a reviewed extension to its layout policy. Container sizing need not block the useful fixed-frame slice.

## 4. Proposed request/result contract

Names in this section are proposed, not current exports. Extend existing CompileOptions and ExportOptions rather than adding a new renderer package. Preserve all old calls and defaults when the new options are absent.

```ts
interface LayoutRequest {
  readonly algorithm: "fit/v1";
  readonly width: number;       // Actual chosen SVG artboard width, in CSS px.
  readonly maxHeight: number;   // Height budget, not known console height.
  readonly variant: "standard" | "compact" | "auto";
  readonly overflow: "error" | "wrap" | "shrink" | "wrap-then-shrink";
  readonly minFontSize: number; // Readability floor at a known display size.
}

type OutputSizing =
  | { readonly mode: "fixed"; readonly width: number }
  | {
      readonly mode: "container-experimental";
      readonly maxWidth: number;
      readonly fillFraction: number;
    };

type MeasurementQuality =
  | "authored-geometry"
  | "measured-local-font"
  | "estimated";
```

A layout request's width comes only from an explicit caller constraint, a selected size, or an observed **owned preview** size. When omitted, the old scene/frame behavior remains. Auto variant selection uses this known layout width and reviewed profile rules, never an alleged console-width observation.

A supplied fixed sizing width may downscale a layout, but it must preserve aspect ratio and meet declared minimum display text sizes. Prefer laying out at the intended displayed width instead of compiling wide and shrinking. If final layout height is H and width W, fixed display height is `displayWidth * H / W`. Validate both; no independent width/height stretching.

For container sizing, maximum display width must not exceed the laid-out width in v1. The maximum displayed height follows the same ratio. Use finite positive values under existing 1,200 × 400 bounds. Proposed fillFraction bounds are 0.50–0.98, default 0.96; these are design policy, not browser limits. All expressions are produced from validated numbers, not user CSS strings. Padding and readability floors must leave positive usable content space.

The compiled result should expose a structured layout report: resolved layout/profile revision; artboard; slot/glyph/paint bounds; actual font sizes; wraps and scale factors; measurement quality/environment; and diagnostics. Container mode must report `resolvedDisplayWidth: null`, `resolvedDisplayHeight: null`, and `displayReadability: "unknown"`. A predicted sample width belongs only in a labeled preview report. Fixed widths are requested display dimensions, not a guarantee of available console space.

Keep any detailed LayoutPlan internal or read-only; it is not an arbitrary graphics import API. `fit/v1` algorithm revisions that change stored visual meaning require a new reviewed identifier and compatibility fixtures.

## 5. Content layout algorithm

### 5.1 One bounded pipeline

```text
validate scene + explicit requests
  -> resolve profile, slots, legal wrap opportunities, and constraints
  -> resolve measurement data / authored geometry
  -> reserve decoration and complete motion-envelope bounds
  -> select reviewed standard or compact layout at the known width
  -> wrap and/or shrink only as explicitly permitted
  -> validate final painted bounds and readable font floors
  -> serialize SVG + readable caption + layout diagnostics
  -> generate independent fixed/container carrier sizing
```

Input text remains canonical and immutable. Wrapped layout fragments are derived data; do not insert line breaks, upper-case text, ellipsize, drop fields, or squeeze glyphs in the stored scene to conceal overflow. The native caption uses the original semantic text/order, not the line-broken visual fragments.

Preserve explicit newlines. Choose line breaks at legal language-aware opportunities; never split a grapheme, combining sequence, or joined emoji. Shape and measure entire candidate fragments, including ligatures, RTL text, kerning, and spacing. Do not add isolated glyph widths and call that shaped text. Record the segmentation/shaping implementation in evidence; native segmentation may vary by environment.

Unbreakable commands, IDs, versions, and endpoints must not be silently rewritten. A displayed command may wrap without injecting command characters into its caption or copied value. When permitted wrapping/shrinking cannot preserve the full content, return a fit failure. No arbitrary hyphen insertion or invisible shortening.

### 5.2 Measurement confidence

**Authored geometry:** immutable original path glyphs supply advances and ink bounds. Account for negative bearings, transforms, strokes, joins/miter limits, ornaments, and all layers. Deterministic vector bounds do not imply identical anti-aliasing in every renderer.

**Measured local fonts:** an optional, explicitly invoked browser adapter uses Canvas TextMetrics [E6] with the exact intended style, closed local font stack, spacing, direction and shaping settings. Prefer OffscreenCanvas where available; a detached canvas fallback must never be attached to the inspected page. No DOM text probes, font files, font downloads, `document.fonts.load`, or network/font-resource requests. If the environment cannot meet this no-resource condition, the adapter reports unavailable.

The adapter is outside compilation and emission. It returns a bounded data snapshot, not a callback, DOM object, canvas context, or font binary. Each record is keyed to the exact text, normalized style, candidate size, algorithm/profile revision and environment. Validate finite metrics, signed bearings, matching keys, counts and bounds before use. Missing or stale measurements are not proof of fit; return a diagnostic or use the explicitly allowed estimated path. A corrupt snapshot is a validation error, not a fallback trigger.

Use advance widths for placement and ink bounds for painted extents: TextMetrics can distinguish width, left/right ink bearings and ascent/descent [E6]. Measurement in one page/OS does not prove the recipient's DevTools will resolve the same local font. Label it measured-local-font, never universal-exact. Test system-font substitutions, italic overhangs, CJK, RTL, combining text and emoji. Do not embed or outline redistributed font files to claim portability.

**Estimated metrics:** retain a conservative option where measurement is unavailable, with visible `unverified-font-metrics`. It must not produce an unconditional exact-fit verdict. A strict exact-geometry request can fail until authored metrics are available; explicitly requested readable-text output does not need rich measurements.

The pure planner operates only on data and deterministic helpers. The optional adapter performs bounded measurement work before planning, is not invoked on import or by logging, and is not included in standalone exports. Proposed work ceilings: 16 shrink candidates and 512 unique shaping requests per attempt; snapshot input at most 64 KiB. These are initial engineering budgets to test, not benchmarks. Exceeding a budget produces a structured error; never loop until a timeout or allocate an unbounded cache.

### 5.3 Paint bounds and fitting

For each effect/profile, compute conservative left/right/top/bottom paint insets including extrusion, stroke, italic/skew overhang, ornaments, glow, and motion extrema. SVG object bounds alone do not include every painted decoration [E7]. Freeze an explicit finite blur tolerance per profile (for example a reviewed sigma allowance); do not claim that an infinite Gaussian tail is completely contained.

Use profile-safe regions, not just the outer surface rectangle. Reserve whitespace separating utility fields before measuring those slots. Shrink uniformly; do not use `textLength` glyph stretching as generic overflow recovery. Where content geometry scales uniformly, begin with `s = min(1, availableWidth/contentWidth, availableHeight/contentHeight)`, then recompute non-scaling effects, minimum display type sizes, wrapping, and final bounds. Handle empty/zero-area content without division by zero.

Pin the chosen line-break strategy and font-size search grid in `fit/v1`; ties must resolve deterministically. Obtain measurements for the actual candidate lines after wrapping/shrinking. For local fonts, use a bounded two-pass preflight: the pure planner returns missing measurement requests as data, an explicitly invoked adapter resolves that batch, and the planner reruns with the snapshot. The 512-request/16-candidate budgets cover the entire attempt, not each retry. Compilation never calls the adapter or hides an unbounded retry loop. For animation, union all extrema analytically for the supported effect, not merely sampled first/last frames. Allow no unsafe profile with unknown/unbounded paint extent.

## 6. Readability and compact presets

A 16 px label in a 720 px-wide image shrunk to 240 px becomes about 5.3 px. Passing a geometry test is not enough. A proposed initial utility-body floor is 12 CSS px at a **known display width**; this is a product default, not a WCAG-defined minimum. Profiles may require larger floors. If preserving every value needs more than the existing 400 px height limit, fail or use explicit text fallback; do not enlarge global budgets silently.

| Profile | Standard intent | Compact intent |
| --- | --- | --- |
| Build Receipt | Aligned facts and receipt edges | Stacked label/value groups; all facts retained |
| Request Trace | Three horizontal stages | Three ordered vertical stages, not a proportional timing chart |
| Service Passport | Identity beside environment facts | Identity above endpoint and details |
| Command Card | Command well with explanation | Wrapped command/description with original copied command preserved |
| Release Bulletin | Headline, version stamp, two highlights | Stacked headline/version/highlights |
| Blueprint / Orbital / Contour Map | Full original decoration | Reduced ornaments and a clear title-safe region |
| Letterpress / Signal Halftone | Reviewed editorial composition | Reviewed type hierarchy; retain intentional line ordering |
| Cinematic titles | Full silhouette and ornaments | Bounded title scale and only explicitly optional ornament removal |

Compact is a reviewed profile variant, not a universal rearrangement algorithm. Determine breakpoints from fitting and comparison fixtures; do not apply a magic global 480 px breakpoint to every design. Unsupported compact variants must report `unsupported-layout`, not pretend to reflow.

PR #3's original 720 × 240 SVGs and hashes remain intact. Add compact references at 360 px (height up to 400 px) and representative narrow/wide comparisons during authorized implementation/design work. The reference dimension is not a promise that arbitrary text fits there. Require exact original text and per-slot visual acceptance before accepting a compact baseline. An image hash is not maintainer approval.

Do not add presentation variants to an accepted immutable `/v1` profile if that changes stored meaning. Since PR #3 is still proposed, its author may reconcile the contract before acceptance; otherwise use a successor profile/explicit recipe mapping. This PR does not rewrite ADR-0013 or its ten references.

## 7. Experimental container-relative SVG carrier

### Mechanism

Delegate scaling to the rendering frontend without reading its dimensions. For laid-out width W, height H, ratio `r = H/W`, maximum display width M, and fill fraction f:

```text
horizontal padding per side = min(M/2 px, 50*f %)
vertical padding per side   = min(M*r/2 px, 50*f*r %)
```

For 720 × 240, M=720 and f=0.96, the probe uses:

```css
font-size: 0;
line-height: 0;
padding: min(120px, 16%) min(360px, 48%);
background: url("data:image/svg+xml,...") center / contain no-repeat;
```

Percentage padding on both axes resolves against the containing block's logical width [E5]. In a simple definite-width containing block, the modeled carrier width is `min(M, f*C)` and its height preserves r. This equation is a model, not a measured console layout. Four percent spare width is not a guaranteed allowance for source anchors, nesting, timestamps, repeat counters, borders or scrollbars. First-line floats and intrinsic inline sizing are qualification cases, not details to assume away.

Use a dedicated styled image span, reset styling, and place the complete native-text caption on a following line within the same log call. Do not duplicate the image via `console.log` on resize. No observers/listeners/timers in emitted code. Existing entries may be resized by frontend CSS, but do not promise reopening/replaying/caching behavior until observed.

### Boundaries and fallback

Container sizing is SVG-only, explicit opt-in, named `container-experimental`, and initially Chromium-targeted. Unsupported renderer/target requests error by default; `unsupported: "fallback"` permits readable text with diagnostics. Never silently substitute a fixed oversized image. A page-level CSS.supports test cannot qualify the DevTools sanitizer or layout.

CSS does not report the resolved width back to the package. It cannot drive JS layout selection, a post-print minimum-size check, or automatic caption-only fallback. The precompiled layout remains the same image. Always report `experimental-container-sizing` and `display-readability-unknown`; advise compact/fixed/native text for dense utility output. A native caption mitigates information loss; it does not make microscopic image text readable.

Do not add SVG media-query/container-query layout switching to v1. Keep that as separate research. Do not substitute `vw`, screen width, or browser-chrome subtraction for the tested containing-block expression. Keep font/padding bounds and the combined motion-export byte budget under ADR-0005. If actual qualification fails, retain fixed fitting and the probe, but do not promote this mode as supported.

## 8. Package, React and studio integration

### Core and exports

Add planner/bounds/measurement data modules under `packages/console-fx/src/` and tests under its existing test directory; exact new filenames are implementation choices. Extend existing model/validation, SVG renderer, compiler, and codegen seams. Reuse the existing `./browser` entry for an explicit optional measurement helper if approved. Root imports must remain browser-state-free and must not pull in React, Next.js or measurement side effects.

Preview and standalone export consume the same resolved plan/URI. Do not remeasure silently during export, or show a fitted preview while exporting unfitted data. Generated JS contains one console.log; already-compiled strings/numeric sizing expressions; and only existing guarded motion selection where requested. No runtime measurement, FontFace, canvas, network, or page mutation in the generated snippet.

The SVG font environment can change at the recipient; retain the measured-local-font warning even after precompilation. Authored paths remain the most deterministic option. Explicit text output bypasses decoration and keeps semantic content. Strict CSS pixel-fit requests return unsupported-layout unless separately qualified; native CSS output keeps its existing approximate contract.

### Fit inspector

Add sizes 280, 360, 480, 720 and 960 CSS px plus a resizable preview boundary. Observe only the studio's own content box. Hidden/zero-width previews defer fitting; do not create invalid zero-sized requests. Clean up observers on unmount and coalesce updates so preview resizing does not produce feedback loops. Preview resize never logs or updates an already printed message.

Separate **simulate at width** from **use this width for export**. The first changes comparison UI only; the second is an explicit recipe edit. Display standard/compact/auto choices, overflow policy, minimum type size, measurement quality, paint-bound overlay, fixed/container sizing, predicted downscale, and diagnostics. Do not label the slider as the actual console width.

Preserve keyboard operation, visible focus, text alternatives, contrast and non-color error states under ADR-0011. Use the existing restrained, cyan-accented neumorphic UI; no purple theme or neon-heavy panels. SVG comparisons render the exact image URI. CSS comparisons remain labeled approximate. Show reference, known-width output, and compact/narrow result separately.

The React adapter reuses compiled output; do not add preset-specific components, resize-driven console emissions, or a Next.js runtime package. Explicit logging hooks, mount-once semantics, silent SSR and Strict Mode tests remain unchanged.

### Persistence and compatibility

Do not add output-size fields, measurement callbacks, or transient metrics to SceneV1 without a migration decision. The proposed recipe is a separate, core-validated JSON wrapper, not a competing content model:

```ts
interface RenderRecipeV1 {
  readonly kind: "consoleFxRenderRecipe";
  readonly recipeVersion: 1;
  readonly scene: SceneV1;
  readonly options: ExportOptions; // Existing options plus reviewed layout/sizing.
}
```

The scene remains the single content source. ExportOptions stores explicit system/reduced-motion intent, never a live measurement snapshot or guessed recipient width. Normalized recipe settings must round-trip. The whole recipe uses the same 64 KiB import bound. Before implementing recipe persistence, add strict parsing and old/new fixtures; do not expand parseScene to guess a recipe.

| Producer / consumer | Required result |
| --- | --- |
| Old SceneV1 and omitted options → new reader | Existing normalization and default output preserved; no forced fitting |
| New options → old compiler | Explicit rejection; never assume the new sizing was applied |
| Old raw-scene draft/import → new studio | Read using existing path; preserve raw original and apply documented defaults |
| New recipe → new studio | Validate scene and options before replacing editor state; preserve all fit/export settings |
| New recipe → old reader | Clear unsupported-format failure; existing draft unchanged |
| Unknown recipe/algorithm/profile revision | Error, no guessed downgrade or destructive migration |
| Measurement snapshot from other text/style/environment | Recompute explicitly or downgrade confidence with diagnostics; never silently trust it |

Add a distinct Recipe JSON export while retaining accurately labeled Scene JSON for content-only consumers. Shared URLs/local drafts must carry the recipe where fitting settings are promised; do not silently lose them on reload. Keep existing retention, share-size, conflict-resolution and delete behavior under ADR-0007. Preserve the old storage record before explicit conversion; no destructive automatic overwrite. Recipe validation belongs to the core, and the studio uses it instead of duplicating schemas.

## 9. Failure policy and resource bounds

Unsafe or malformed inputs fail validation; fallback never bypasses validation. For valid content that cannot meet the requested rich constraints, strict mode reports an error and emits nothing. Explicit fallback returns all readable text plus diagnostics, and emits once only when the caller requests emission.

Proposed diagnostic codes: `layout-overflow`, `unsupported-layout`, `unverified-font-metrics`, `stale-measurement`, `measurement-unavailable`, `paint-bounds-unverified`, `below-readable-size`, `experimental-container-sizing`, and `display-readability-unknown`. Do not echo sensitive full commands or endpoints into error text. An unknown display width is not an invented zero or a successful fit verdict.

Keep existing input/text/line/run/element/dimension/export budgets. Derived SVG line wrapping must respect the eight-visual-line limit unless a separately approved successor changes it. Content after fitting must still fit the 400 px height budget. Unsupported content is not cropped, deleted, replaced by ellipses, or reduced below the floor. Bound filter extents, gradients/pattern density, candidate count and cached measurement bytes before allocation, then enforce serialized limits. Do not relax the one-static-effect policy to implement fitting.

## 10. Acceptance criteria

| ID | Done when |
| --- | --- |
| FIT-01 | Old scenes/calls with omitted options preserve normalized data and approved output fixtures. |
| FIT-02 | Same scene, requests and measurement snapshot produce byte-identical output/diagnostics without mutation, state reads or logs. |
| FIT-03 | Authored geometry fits all ink, strokes, ornaments, extrusion and complete motion envelopes within declared safe regions/tolerances. |
| FIT-04 | Font cases include narrow/wide Latin, italic overhang, multiline text, CJK, RTL, combining marks and emoji; estimates cannot claim exact fit. |
| FIT-05 | Wrapping preserves canonical text, graphemes and semantic reading order; caption/copy contains original commands, IDs, versions and URLs. |
| FIT-06 | Impossible valid layouts fail explicitly or use caller-authorized full-text fallback; no hidden truncation/distortion/tiny-text workaround. |
| FIT-07 | Measurement adapter is explicitly invoked, performs no page mutation or resource request, and unavailable/stale/hostile data is handled within budgets. |
| FIT-08 | Reviewed compact references preserve all required slots and readable floors; original PR #3/cinematic references are not overwritten. |
| FIT-09 | Every observed width 280/360/480/720/960 has recorded layout, dimensions, scale, effective type size, confidence and verdict. Valid failure is distinguishable from successful fit. |
| FIT-10 | One log per explicit call; none on compilation, import, preview resize, preset changes or SSR; standalone output never measures or polls. |
| FIT-11 | Container expression is generated from validated numeric bounds and preserves the intended ratio/cap in a recorded layout harness; no claimed exact console size. |
| FIT-12 | Actual Windows Chrome and Edge qualification covers source anchors, nesting, timestamps, repeated messages, docking/drawer, zoom, resize, reopen and offscreen cases. Unobserved/failed profiles stay experimental. |
| FIT-13 | Recipe/draft/share round trips preserve scene and render intent; old/future/invalid versions cannot corrupt current work. |
| FIT-14 | Fit inspector is keyboard-accessible, labels simulated width honestly, and separates simulation from export edits. |
| FIT-15 | Packed JS/TS/React/Next.js consumers keep working, package/bundle budgets pass, and no extra dependency or publication is smuggled into the slice. |

A PNG loading, a passed source-shape probe, or a page-based reconstruction does not satisfy FIT-12. No viewport-independent readability guarantee is possible for an unknown, arbitrarily narrow container; required captions and honest diagnostics are part of the acceptance contract.

## 11. Delivery and validation

**Phase A — approve and plan:** accept/revise ADR-0014 and API/recipe semantics. Record which preset dependencies are approved. Add new compact references through visual review, preserving original hashes.

**Phase B — fixed fit:** implement opt-in planner, authored/estimated metrics, paint bounds and error/fallback tests. Then add the explicit measurement adapter and confidence tests. Keep legacy output unchanged by default.

**Phase C — useful compact layouts:** integrate accepted card profiles and reviewed compact variants. Qualify fixed widths before automatic carrier work. Cinematic profiles get independent geometry checks.

**Phase D — container experiment:** use the included probe to qualify percentage padding in actual DevTools. Implement an opt-in carrier only under an approved profile; failure does not block previously qualified fixed/text work.

**Phase E — Fit inspector and consumers:** integrate recipe persistence, exact preview/export, multi-width comparisons, accessibility and packed-consumer tests. Release remains a separate authorization.

Current repository commands to use proportionally during implementation (consult current manifests again):

```sh
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test
pnpm test:codegen
pnpm test:studio
pnpm check:packages
pnpm check:bundle-size
pnpm test:consumers
pnpm build
```

The included documentation probe has a separate dependency-free check:

```sh
node --test docs/research/console-fit/probe.test.mjs
```

That check tests the research snippet's execution/shape and sizing arithmetic only. It is not the package suite, an installed-package check, a browser render, or CI evidence. See the research README for a real-DevTools procedure and an unfilled observation template. Do not install or upgrade the application toolchain merely to validate this proposal.

### Rollback

Keep fixed sizing and existing scenes as defaults. A failed carrier profile can be disabled for new requests without changing existing logs, reprinting, or clearing. Revert an implementation slice through normal reviewed commits; retain recipe/source backups. Do not overwrite approved reference images to make tests green or delete old profile readers without a migration review. Reject unsupported saved recipes with a recovery path rather than silently discarding their settings.

## 12. Source challenge, review checkpoint and execution handover

**Preserved:** pure compiler, single emission, no runtime console-width detection, one shared scene/compiler, explicit fallbacks, existing budgets, no font redistribution, quiet studio theme, and actual-DevTools evidence boundaries.

**Revised from the exploratory evaluation:** automatic container sizing is only a frontend-resolved hypothesis; minimum type size cannot be guaranteed at unknown display width; accurate local metrics are not portable-font proof; compact reflow requires a reviewed extension to PR #3; fitting settings need a recipe round trip rather than disappearing in raw scene JSON. Prior reconstruction results are historical observations, not new qualification or release evidence.

**Review checkpoint:** the user authorized this proposal PR. Confirm the separation, recipe format, measurement boundary, compact variant policy, numerical engineering budgets and experimental gate before implementation. Open PR #3 and Proposed ADRs 0012/0013 are dependencies only for their respective profiles, not accepted architecture. Existing accepted ADRs are neither silently superseded nor rewritten.

**Companion execution prompt:**

> Read AGENTS.md, the local ADR index, this spec and its research README. Verify approval of ADR-0014 and the selected slice; do not infer approval from this PR's presence. Reinspect current code and relevant preset proposals. Implement one authorized phase using the existing shared compiler and package boundaries. Preserve legacy defaults, canonical text, single emission, explicit fallback and resource budgets. Keep environment measurement explicit and separate from deterministic layout; never detect or mutate the DevTools DOM. Compare against preserved references at every declared width, record measurement confidence and actual evidence type, and leave container responsiveness experimental until the exact Windows Chrome/Edge matrix passes. Run proportional existing tests and packed-consumer checks. Report changed contracts, source revision, commands/results, artifacts, unverified environments and remaining gates. Do not publish, deploy, merge other PRs, or alter reference approvals without separate authorization.

## 13. Sources

Sources were inspected for this proposal on 2026-09-12. Upstream source describes an implementation snapshot, not proof of current stable-browser behavior. No external source grants a product-specific fit guarantee.

- [E1 — WHATWG Console standard](https://console.spec.whatwg.org/): logging/formatting API and implementation-owned presentation; no message-geometry API.
- [E2 — Chrome console format/style documentation](https://developer.chrome.com/docs/devtools/console/format-style): `%c` and data-URL image restriction.
- [E3 — Chromium ConsoleViewMessage](https://github.com/ChromeDevTools/devtools-frontend/blob/f03998233642576648e4e1771d2d4d8b67897e80/front_end/panels/console/ConsoleViewMessage.ts): styled-span carrier; inspect `formatWithSubstitutionString`. Historical pinned source from the evaluation, not a build qualification.
- [E4 — Chromium CSSStyleSanitizer](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/ui/legacy/components/object_ui/CSSStyleSanitizer.ts): source read at blob `8a56ad2be1782ea09c33f023d59f9cf0d98b209e`; conservative property families and data URLs.
- [E5 — CSS Box Model Level 3](https://www.w3.org/TR/css-box-3/#padding-physical): percentage-padding reference dimension.
- [E6 — WHATWG Canvas text metrics](https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-measuretext): advances and text ink metrics; not a recipient-font identity promise.
- [E7 — SVG 2 bounding boxes](https://www.w3.org/TR/SVG2/coords.html#BoundingBoxes): geometry/stroke/decorated bounds distinction.
- [E8 — Resize Observer](https://www.w3.org/TR/resize-observer/): observing an owned element, not private DevTools elements.
- [Repository skill source](https://github.com/stark-ai-de/agent-skills/blob/main/plugins/stark-ai-developer/skills/codex-spec-interviewer/SKILL.md) and its [ADR gate](https://github.com/stark-ai-de/agent-skills/blob/main/plugins/stark-ai-developer/skills/codex-spec-interviewer/references/adr-gate.md): source challenge, explicit proposals, acceptance criteria and handover structure.
