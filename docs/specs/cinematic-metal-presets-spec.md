---
title: "ConsoleFX — cinematic metal typography presets"
status: "proposed; saved for implementation review"
created: "2026-09-12"
updated: "2026-09-12"
artifact_path: "docs/specs/cinematic-metal-presets-spec.md"
mode: "standard"
repository: "servrox/console-fx"
inspected_revision: "347e7cea6196f9995e7c25b3ee1a5e209e24b02c"
packages: ["@servrox/console-fx", "@servrox/console-fx-react"]
owner: "ConsoleFX maintainer"
source_request: "Add an implementation and integration specification for the cinematic metal typography presets demonstrated in the conversation."
implementation_authorized_by_this_save: false
---

# Cinematic metal typography presets

## 1. Outcome and scope

Add four original, editable title-card presets to the existing ConsoleFX library, landing-page gallery, and focused playground. They should evoke 1980s hair-metal lettering and cinematic end-credit treatments: distinct letter shapes, reflective metal, sharp highlights, restrained bloom, ornamental silhouettes, and visible extrusion. They must not be four recolored versions of the existing monospace `metallic` effect.

The creative reference is the Perception title sequence discussed in the [user-supplied Motionographer article](https://motionographer.com/news/perception-crafts-unique-typography-and-cinematic-main-on-end-title-sequence-for-marvel-studios-thor-love-and-thunder/). Its custom lettering is inspiration, not a font or asset source. Create original artwork; do not copy film wordmarks, credit-logo paths, screenshots, or font files. Do not name the shipped collection after Marvel, Thor, or Perception, or imply endorsement.

The four conversation demonstrations define the starting visual treatments:

| Factory and `PresetId` | Display name | Default text | Required visual identity |
| --- | --- | --- | --- |
| `lightningMetal` | Lightning Metal | `CONSOLE FX` | Original angular block lettering, silver-to-blue reflections, dark extrusion, sharp cyan edge highlights, optional lightning-like wedges |
| `iceCathedral` | Ice Cathedral | `STARK AI` | Tall serif lettering, white/ice-blue reflections, pointed side ornaments and thin cyan highlights |
| `liquidChrome` | Liquid Chrome | `Overdrive` | Heavy italic serif lettering, a hard chrome reflection break, dark steel depth, a metallic swept underline |
| `moltenGold` | Molten Gold | `HOT RELOAD` | Angular lettering with gold/cream highlights, orange-to-red metal, deep red extrusion and sharp silhouettes |

All four initial presets are **static SVG output**. A preset returns ordinary scene data; compilation remains silent; explicit emission and the standalone export each make exactly one console call, including the readable caption. The result is decorative image lettering, not a newly installed font or selectable vector text.

### Included

Library factories and metadata; a bounded composite effect; original internal glyph geometry for the angular treatments; safe SVG generation; literal-text preservation and fallback diagnostics; editable presets in both studio entry points; complete JavaScript, TypeScript, React, Next.js, and JSON exports; fixtures, documentation, and package checks.

### Excluded

A second renderer inside the app; a new npm package or Next.js adapter; a generic font/path/plugin API; raw SVG/CSS import; font download, embedding, or redistribution; WebGL/canvas/video rendering; automatic logging; live progress; new animations; modifications to existing preset defaults; npm publication or deployment.

The studio retains the [current visual direction](../mockups/README.md): professional minimalism, soft neumorphic depth, and small cyan accents. No purple UI, broad glow, particle backgrounds, or cinematic styling outside the output samples. Gold/red belongs to the Molten Gold sample, not the surrounding editor.

## 2. Repository baseline and integration points

This is an incremental feature, not greenfield scaffolding. Source was inspected at `347e7cea6196f9995e7c25b3ee1a5e209e24b02c`. The original product spec contains historical statements about unimplemented files; current source and the [implementation evidence](console-fx-implementation-evidence.md) describe later implementation. Do not interpret an npm version in a manifest as evidence of publication.

| Existing source | Relevant contract and planned extension |
| --- | --- |
| [Scene types](../../packages/console-fx/src/model/types.ts) | `SceneV1`, `EffectInput`, `EffectDescriptor`, `CompileOptions`, and diagnostics; extend the built-in effect union, not the scene into an arbitrary graphics tree |
| [Effect catalog](../../packages/console-fx/src/effects/catalog.ts) | Parameter defaults/bounds, supported renderers, static/motion classification, and `EFFECT_ORDER`; add the composite descriptor here |
| [Validation](../../packages/console-fx/src/validation/index.ts) | Strict known-key validation, normalization, family conflict detection, deep freezing; use this boundary for all new settings |
| [Preset catalog](../../packages/console-fx/src/presets/index.ts) | Nine existing presets, `PRESETS`, named factories, `PresetId`, and `preset(id, options)`; add four entries without renaming `gold` or `chrome` |
| [SVG renderer](../../packages/console-fx/src/renderers/svg.ts) | Generated definitions, escaped text, internal references, data URI, and clipping diagnostics; add a reusable cinematic rendering helper |
| [Browser compiler](../../packages/console-fx/src/browser/index.ts) | Rich output currently permits one static effect per run; defaults to errors for unsupported requests and makes plain-text fallback explicit |
| [Studio](../../apps/studio/src/features/editor/studio.tsx) | `PRESETS.map`, `selectPreset`, descriptor-driven `ParameterField`, preview and export; integrate through these seams rather than a parallel editor |
| [Core package](../../packages/console-fx/package.json) | Existing ESM `./presets`, `./browser`, and `./codegen` exports; no new entry point or runtime dependency required |
| [Workspace scripts](../../package.json) | Existing pnpm/TypeScript/Vitest/Playwright and package-consumer validation; use the current commands, not invented bootstrap commands |

### The composition constraint

A stack of `metallic`, `extruded`, and `neon` would currently fail rich compilation with `unsupported-combination`. Do not bypass that check globally. Represent the whole title treatment as **one static built-in `cinematicMetal` effect**, internally sharing rendering helpers where appropriate. Its material, bevel-like outline, extrusion, glow, and ornaments are controlled parts of that effect, not independent competing static effects.

## 3. Proposed data and public API

These additions are proposed, not existing exports. They depend on [ADR-0012](../adrs/0012-use-bounded-cinematic-lettering-profiles.md) being accepted before implementation of the new shared contract.

### 3.1 Preset API

Add named exports and dispatcher IDs under `@servrox/console-fx/presets`. Retain existing `PresetOptions` behavior for existing factories. Give the cinematic factories a typed options object for `text`, `color`, `depth`, `glow`, and `ornaments`; a supplied `color` overrides only the accent/edge tint, not the entire reflection palette. Defaults are profile-specific and must be materialized into the returned scene.

The proposed first-version cinematic factories are static. They may accept `motion: "none"` for dispatcher compatibility; reject other motion options with a structured validation error instead of ignoring them. Do not narrow the existing `PresetOptions.motion` union for old presets.

```ts
// Proposed usage after implementation; not a runnable current-package example.
import { lightningMetal } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = lightningMetal({
  text: "CONSOLE FX",
  color: "#69dcff",
  depth: 7,
  glow: 0.25,
  ornaments: true,
});

const compiled = compileConsole(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "reduce",
  unsupported: "error",
});

console.log(...compiled.args); // The only emission.

const standalone = exportConsoleLog(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "reduce",
});
// standalone.code is complete, dependency-free JavaScript.
```

Factories must work with the existing React adapter and Next.js recipes without special lifecycle logic. Each default scene has one centered title run, a useful plain-text label, and an approximately 840 × 270 surface within existing limits. Do not hard-code those dimensions into the renderer; the same scene must be editable and support narrower previews.

### 3.2 One bounded effect

```ts
// Proposed member of EffectInput; the normalized Effect has defaults resolved.
type CinematicMetalEffectInput = {
  readonly kind: "cinematicMetal";
  readonly profile?:
    | "lightning-metal-v1"
    | "ice-cathedral-v1"
    | "liquid-chrome-v1"
    | "molten-gold-v1";
  readonly color?: string;
  readonly depth?: number;
  readonly glow?: number;
  readonly ornaments?: boolean;
};
```

Use `family: "fill"`, `scopes: ["run"]`, `renderers: ["svg"]`, and `motion: "static"`. Add a deterministic position to `EFFECT_ORDER`. Keep the existing one-static-effect rule; this effect is internally composite, not an exception to that rule.

| Parameter | Bounds / meaning |
| --- | --- |
| `profile` | Closed enum of the four versioned profiles; default `lightning-metal-v1` |
| `color` | Existing validated hex-color format; default cyan edge/accent tint; each factory sets its material-appropriate resolved default |
| `depth` | Finite number 0–10; UI step 1; renderer uses `floor(depth)` for a bounded layer count, with no discontinuous hidden randomness |
| `glow` | Finite number 0–1; UI step 0.05; 0 removes the blur pass; cap blur at 6 SVG user units |
| `ornaments` | Boolean; controls profile-owned decorative paths; never accepts user-authored path data |

Profile-specific defaults proposed for review: Lightning depth 7/glow 0.25; Ice depth 3/glow 0.15; Chrome depth 5/glow 0.10; Gold depth 8/glow 0.20. Ornaments default on. Store these values explicitly in factory output; the effect descriptor has one documented fallback for direct authoring. Material stops, silhouette definitions, and ornament proportions are immutable implementation data for each `-v1` profile. A future material redesign gets a new profile ID instead of silently reinterpreting saved `-v1` scenes.

### 3.3 Compatibility and ownership

Keep `schemaVersion: 1`: the additive effect uses the existing known-effect extension point. This is backward readability for existing documents, **not** a claim that older packages understand the new effect. No existing scene migration or destructive storage rewrite is required.

| Producer/document | Consumer | Required behavior |
| --- | --- | --- |
| Existing V1 scene, no cinematic effect | Updated package/studio | Same normalized meaning and existing output fixtures; no implicit visual upgrade |
| New cinematic V1 scene | Updated package/studio | Normalize, render, edit, export, and round-trip all resolved settings |
| New cinematic V1 scene | Pre-feature reader | Clear unknown-effect rejection; preserve any current draft; no silent field removal or coercion to an old preset |
| Future scene version or unknown profile | Updated reader | Explicit unsupported-version/invalid-enum result; leave current document intact |
| Complete standalone snippet | Browser without the package | Executes independently because SVG is already compiled into its arguments |

Core validation owns decoding and compatibility checks. The studio owns presenting errors and preserving local work. Package docs/release notes state the first version supporting these IDs when it is actually released; do not invent that version here. The base feature contains no deprecation or removal window because nothing is removed. Package rollback must leave newer local JSON recoverable by a compatible reader.

## 4. Rendering and typography contract

### 4.1 Common SVG pipeline

Within the existing SVG renderer, build a title run in a fixed order: optional decoration, optional bounded glow, back-to-front extrusion, dark separation outline, reflective front face, fine highlight outline. Use explicit gradient stop positions, including close stops for a hard reflection break; the current evenly spaced diagonal gradient alone is not sufficient.

Share definitions using internal `<defs>`/`<use>` references where useful. Scope deterministic IDs by visual line/run and component role, so two runs/profiles cannot collide. All values and XML text are escaped or generated from vetted constants. Keep the existing Unicode-safe data-URI path; do not introduce Node `Buffer`, network font fetching, SVG script, `foreignObject`, or raw-markup insertion.

Use fixed profile geometry and fixed highlight positions, or a documented deterministic derivation from scene data. No `Math.random()`, wall-clock time, DOM measurement, canvas measurement, or asynchronous work during compilation. Equal normalized scene/options must produce byte-identical compiler and exporter output. That does not promise identical local-font rasterization across operating systems.

### 4.2 Lettering sources and text fidelity

**Lightning Metal and Molten Gold:** use original repository-owned path glyphs, initially A–Z, 0–9, space, and hyphen. The conversation's hand-drawn alphabet is prototype material requiring review, not an approved production font. Add original digit glyphs for developer labels; do not obtain outlines from proprietary fonts. Support ASCII lowercase through an explicit display-only uppercase mapping. Preserve the original source string and selectable caption; surface a `cinematic-uppercase-display` information diagnostic when appearance differs in case.

**Ice Cathedral and Liquid Chrome:** begin with local serif stacks, such as `Georgia, Times New Roman, serif`, with the profile controlling tall or italic treatment. Do not download, bundle, extract, embed, or redistribute those fonts. Document `platform-font-variation` once per relevant run; a system lacking the named faces uses its serif fallback. Unicode remains intact, but missing local glyph coverage is a font limitation, not a promise of universal shaping support.

The initial cinematic treatment is for short, single-line titles: at most 24 Unicode code points per cinematic run, counting spaces. Code-point counting bounds work; it must not split/reorder grapheme clusters. Reject a rich-render request for a cinematic run containing a newline or exceeding this title limit; allow separate ordinary subtitle runs/lines under the existing scene limits. An all-whitespace cinematic run renders no decorative title geometry and cannot divide by zero.

Unsupported glyphs in an angular profile are a **render-capability error**, not a global scene-parse failure. In strict rich mode, return `unsupported-cinematic-glyph` with the run path. With `unsupported: "fallback"`, use the existing whole-scene static plain-text fallback and warning. Never omit characters, substitute another person's name, transliterate silently, or split emoji/combining sequences into unrelated glyphs. Explicit `renderer: "text"` still works with any otherwise-valid scene text.

Font-family/weight overrides that cannot affect path lettering must not appear to work. The studio explains that the selected angular profile owns its letter shapes; family/weight controls for that run are disabled or clearly inapplicable. Ordinary font size and spacing remain editable. The compiler provides a diagnostic for ignored shape-related style overrides, while keeping those saved style values intact for later profile changes.

### 4.3 Layout and resource bounds

Angular layout uses glyph advance/ink bounds, not only `text.length * fontSize`. Compute the transformed envelope including italic/skew offsets, strokes, extrusion, ornaments, and blur spread. Align the complete run within its line, not just the unextruded face. Reserve effect padding and filter bounds so thin points and underlines are not cut off.

Respect selected font size and scene dimensions; never silently crop or irreversibly truncate text. Emit `possible-clipping` for insufficient space, using the existing diagnostic convention, and offer explicit size/surface adjustments in the studio. Do not automatically distort arbitrary strings through `lengthAdjust="spacingAndGlyphs"` merely to force a screenshot match. Native-serif widths remain estimates without DOM measurement and must be described as such.

Retain all existing [ADR-0005](../adrs/0005-generate-output-from-validated-data.md) budgets: 64 KiB imported JSON; 2,000 scene text code points including the label; 8 visual lines; 32 runs; 4 compatible effects per run; maximum 1,200 × 400 SVG surface and 1,000 elements; warn above 32 KiB and refuse standalone code above 128 KiB. The cinematic title limit and 10-layer/6-unit blur bounds are additional feature limits, not increased global budgets.

Estimate work before allocation, including total run count, glyph paths, definition reuse, extrusion instances, and filter area. Keep the final element/byte checks too. Oversize output fails through existing structured errors, not a second log call or silent quality reduction. Default scenes should remain below the 32 KiB warning threshold after complete code generation; measure, do not assume that internal `<use>` eliminates all payload cost.

### 4.4 Renderer and motion behavior

Static Chromium SVG is the rich target for all four. Requested CSS rich output is not a same-fidelity substitute: strict mode errors; explicit fallback returns readable text. Node, Bun, unknown, Firefox, and Safari requests follow the repository's current target policy; do not broaden rich-render claims here.

The first cinematic version is static-only. A cinematic run combined with any existing motion effect gets `unsupported-combination` in rich strict mode or explicit plain-text fallback, even with a reduced-motion request; do not inconsistently accept and then discard unsupported combinations. Existing presets and their motion behavior remain unchanged. The studio disables cinematic-run motion controls with a short explanation. `motion: "system"` export of a static cinematic scene stays static and must not add an unnecessary animation branch.

Later animated reflections/whole-run motion are separate work requiring explicit combination fixtures, finite duration, reduced-motion behavior, and the existing DevTools qualification gate. Do not add them by copying the earlier timer-based experiments.

## 5. Studio, gallery, and framework integration

Add a **Cinematic Metal** group for these four entries while retaining all existing presets. `PRESETS` remains the source of identity, description, preferred renderer, and grouping metadata. A small optional `group` field may be added to the preset descriptor; it must not create an app-only registry or require stored documents to retain a preset reference.

Both the integrated landing page and `/studio` must expose the collection. A thumbnail uses the real compiler output through `ConsolePreview`, not a hand-maintained screenshot or duplicate CSS recreation. Compile stable thumbnails once per relevant input/change, keep them static, and avoid regenerating an entire gallery on every text keystroke. Do not squeeze an 840-pixel title into an unreadable card: use aspect-ratio-aware preview scaling and an accessible preset name outside the image.

Selecting a preset creates one undoable document change, chooses SVG, resets selection to its title run, and leaves logging explicit. Changing text, edge color, depth, glow, ornaments, font size, or spacing updates both preview and export from the same normalized scene. Effect controls derive from metadata; add profile-specific applicability help without duplicating validation logic.

Import, shared-link acceptance, draft restoration, undo, and redo must not trap a cinematic scene in the studio's default CSS renderer. Since renderer selection currently lives outside `SceneV1`, derive an SVG recommendation from effect metadata for newly loaded cinematic scenes, or present a clear one-click switch. Preserve a user's later explicit CSS choice as an error state; do not silently override it on each keystroke. Implement and test one consistent policy across these entry points without changing stored scene meaning.

Keep **Copy console.log** and **Test in console** separate. Copy exports complete code, never ellipses or an import-only placeholder. Test calls the compiled argument array directly, never `eval()` or `Function()`. Successful test clicks emit once; selection, editing, import, copying, and preview rendering emit zero messages. Failed compilation emits zero messages and displays a readable UI error.

JSON export contains resolved settings and exact source text. TypeScript, React, and Next.js snippets consume the same scene and compiler contracts. No new React component, Next.js runtime package, or effect-specific logging hook is needed. Maintain SSR-safe module imports and the existing client boundary; verify existing adapter behavior rather than introducing render-time emission.

Accessibility follows ADR-0011: readable labels, keyboard-operable preset cards and controls, explicit selected/error states, caption/alt text, and no decorative animation. Keep the stronger typography confined to the image; do not use low-contrast embossed text for editor instructions.

## 6. Planned file changes during implementation

Existing files below were inspected where linked in section 2. New helper/test names are proposed, not claims that they already exist.

| Area | Planned work |
| --- | --- |
| `packages/console-fx/src/model/types.ts` | Add the composite effect input and resolved type; keep V1 structure and old unions compatible |
| `packages/console-fx/src/effects/catalog.ts` | Add bounded profile metadata and deterministic ordering |
| `packages/console-fx/src/validation/index.ts` | Validate/default new fields and reject unknown/executable data without breaking old fixtures |
| `packages/console-fx/src/presets/index.ts` | Four factories, IDs, metadata/group, dispatcher integration and static-only option handling |
| `packages/console-fx/src/renderers/cinematic/` (new) | `profiles.ts`, `glyphs.ts`, `layout.ts`, `render.ts`: immutable materials, original geometry, bounded layout, reusable SVG construction |
| `packages/console-fx/src/renderers/svg.ts` | Delegate cinematic runs, share deterministic definitions, retain existing output for old effects |
| `packages/console-fx/src/browser/index.ts` | Explicit glyph/title/combination preflight diagnostics and existing strict/fallback policy |
| `packages/console-fx/src/codegen/` | Reuse the existing exporter; extend tests before changing serialization; keep one-call output and full byte accounting |
| `apps/studio/src/features/editor/studio.tsx` | Group/preset selection, parameter applicability, import/restore renderer handling, exact previews and exports |
| `apps/studio/src/features/persistence/` | Regression tests for cinematic scenes and old-reader rejection; no storage-format migration |
| `apps/studio/src/app/docs/page.tsx`, package/root READMEs | Document four factories, glyph limits, static SVG status, fallbacks, caption behavior and examples |
| `packages/console-fx/test/cinematic-presets.test.ts` and `cinematic-svg.test.ts` (new) | Pure API, geometry, compatibility, bounds, and adversarial tests |
| Existing codegen/consumer/studio/React test suites | One-call exports, public tarball imports, both app entry points, lifecycle and no-emission regressions |
| `tests/devtools/` and `docs/compatibility.md` | Candidate fingerprints and actual Windows Chrome/Edge evidence for all four treatments |
| `docs/specs/cinematic-metal-presets-evidence.md` (new during implementation) | Separate source/static, automated, package, visual, and real-DevTools evidence |
| `.changeset/` (implementation only) | Describe actual API additions and applicable package changes without publishing |

Protect unrelated code, the approved base specification, existing preset appearances, Accepted ADR text/status, license/toolchain selection, secrets, deployment configuration, and existing mockups. Refactor only the local seams needed for these presets; this is not authority to reorganize the entire studio or renderer.

## 7. Acceptance criteria

1. **Catalog/API:** all four named factories, `PresetId` values, and `preset(id)` entries exist under the existing presets export; old names and defaults remain unchanged.
2. **Ordinary data:** every factory returns a deeply frozen, JSON-compatible, normalized V1 scene with explicit settings and no markup/functions/font bytes. Imports and compilation emit nothing and require neither `window` nor a network.
3. **Distinct results:** at normal console size, each default has its specified silhouette, reflection, extrusion, and ornament treatment. Maintainer review confirms these are not four recolored monospace labels or copied film logos.
4. **One composite effect:** rich cinematic scenes do not require removal of the one-static-effect guard. Extra static effects or cinematic motion combinations fail explicitly; old supported combinations remain unchanged.
5. **Text fidelity:** path-backed titles display documented ASCII capitals/digits while preserving original text in the caption. Unicode/unsupported glyphs, percent format tokens, quotes, and line separators never disappear or become executable formatting/source.
6. **Fallback:** unsupported glyph/title/rich-render requests throw structured errors by default and return exact readable static text only under explicit fallback. Unknown profiles fail validation rather than being guessed.
7. **Layout:** defaults and supported short titles render without clipped highlights/ornaments at 840 × 270 and an adjusted 480-pixel scene. Empty/space-only text is safe. Oversized titles/surfaces produce deterministic diagnostics or bounded failures, not silent truncation.
8. **Security/resources:** parsed output has no script, event handlers, `foreignObject`, external references, embedded fonts, or unbounded filters. Preflight work, total elements, and complete exported bytes stay within the specified limits.
9. **Determinism:** repeated compilation of the same normalized scene/options is byte-identical; internal IDs do not collide across multiple cinematic runs; unrelated existing snapshots remain stable.
10. **End-to-end editor:** both `/` and `/studio` support select → edit → preview → export; import/restore/undo preserve the scene and provide a usable SVG renderer path. No step other than explicit Test logs anything.
11. **Standalone export:** generated JavaScript parses to one `console.log` call, runs without imports/helpers/CDNs, produces one recording-sink emission, and preserves the readable caption with reset styles. Code preview and copied output match.
12. **Framework/package:** built tarballs support named/dispatcher imports, JSX/client-boundary examples, and plain-text Node/Bun usage. No new package, dependency, browser-global import side effect, or unintended root-import asset payload is introduced.
13. **Qualification:** every new profile has recorded actual Windows 11 Chrome and Edge DevTools results, including target environment/build, dimensions, theme, zoom, clipping, copied text, before-open/reopen and repeated-snippet cases. Image screenshots or console-event counts alone do not meet this criterion.
14. **Documentation/release:** factory usage, text limits, local-font variation, diagnostics, no-endorsement wording, and static-only status are documented. Unavailable qualification blocks rich-support/launch claims. No publication or deployment is performed under the spec-writing task.

## 8. Validation plan and delivery sequence

### P0 — contract and baseline

Review and accept ADR-0012; preserve old scene/preset fixtures and output baselines; turn the four prototype looks into original static reference renders. Confirm source ownership for any hand-authored glyphs. Record unresolved appearance questions as review items, not as support claims.

### P1 — library and generated output

Implement catalog/type/validation changes, bounded profile helpers, factories, and strict/fallback behavior. Add corpus tests for all four defaults; `BUILD 2026`; lowercase; 24/25 code points; empty/whitespace; hyphens; `%c %s %d %%`; `&<>"'`; backslashes; `</script>`; accented text; combining sequences; CJK; emoji/ZWJ; negative/nonfinite numbers; unknown keys; and repeated profiles in one scene. Invalid global control characters continue to fail the existing validator.

Use SVG XML parsing to inspect definitions/references/forbidden constructs. Use AST inspection and isolated recorded execution for exported snippets. Exercise limits before and after encoding; ensure imported `path`, `svg`, `fontUrl`, and prototype-related properties cannot enter rendering. Confirm that the selected glyph definitions, not the whole alphabet or all presets, are included in standalone output.

### P2 — studio and consumer integration

Add the collection to both app entry points and test keyboard selection, one undo step, field changes, copy fallback, invalid edits, JSON/share/local draft round trips, renderer recommendations, and exact preview URI. Test current React/Next.js integration without an effect-specific adapter. Check size regressions and installed tarball consumers.

### P3 — visual qualification and documentation

Capture generated images for reproducible visual regression with pinned browser/platform/font environment. Separately qualify real Windows 11 Chrome and Edge DevTools under ADR-0006. Compare angular outlines across environments; treat local-serif differences as documented variation, not exact-pixel failures. Review legibility and material identity with the maintainer. Fill the evidence document and compatibility rows, then prepare release notes/Changeset only when implementation is authorized. Keep unqualified new samples labeled as experimental previews without promoting them to a qualified support claim.

### Commands already present in the inspected workspace

Run the smallest relevant checks first, following ADR-0009. Confirm manifests/versions again before execution. These commands are an implementation validation plan, not a claim of execution in this documentation save.

```bash
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

`fixtures:devtools` prepares fixtures; it is not proof that real DevTools were observed. Scope or extend tests in their existing harnesses rather than adding redundant tooling. The workspace formatter glob does not cover `docs/specs/`; validate new Markdown explicitly with the installed Prettier command and `git diff --check`, without reinstalling the application toolchain solely for docs.

### Rollout and recovery

Land library support before exposing new presets in the studio. Older documents require no migration. Keep existing qualified presets available independently. If a new profile fails qualification, remove its gallery promotion or hold that feature's release without deleting recoverable scene data or weakening fallback semantics. A release rollback must warn that older readers reject cinematic scenes; preserve exported JSON/local drafts for a compatible version. Publication, version/tag choice, and deployment remain separate maintainer-authorized actions.

## 9. Source challenge and architecture gate

The specification follows the published stark AI Developer [Codex Spec Interviewer](https://github.com/stark-ai-de/agent-skills/blob/main/plugins/stark-ai-developer/skills/codex-spec-interviewer/SKILL.md) source-challenge, acceptance-criteria, and ADR-gate structure. This is a requested documentation save, not a claim that a host-native Plan mode was activated or a delegated coding agent executed work.

| Challenged assumption | Evidence | Resolution |
| --- | --- | --- |
| The project still only has mockups | Current manifests, preset factories, compiler, renderer, and studio at the inspected revision | Extend actual source; do not scaffold a replacement |
| Stack metallic, neon, and extrusion to reproduce the demo | `compileConsole` rejects more than one static effect per run | One bounded composite built-in; keep the guard |
| The film examples are one downloadable font | User's Motionographer reference describes custom lettering | Original geometry/local stacks, not a branded font dependency |
| Default settings can remain references to presets | Accepted ADR-0003 | Save resolved scene values and version profile identities |
| An SVG screenshot proves console compatibility | Chrome formatting docs, SVG image processing rules, and ADR-0006 | Exact-image previews and actual DevTools qualification are separate |
| The prototype's fixed sizes/24-character check are sufficient production layout | SVG renderer currently estimates width; new extrusion/ornaments expand ink bounds | Explicit title capability checks, metric-based path layout, envelope/byte budgets, diagnostics |
| A new type allows changing every old effect/scene | Accepted ADR-0003 and current old-reader validation | Additive support, old fixtures retained, explicit new-to-old rejection, no destructive migration |

**External sources checked:** [user's creative reference](https://motionographer.com/news/perception-crafts-unique-typography-and-cinematic-main-on-end-title-sequence-for-marvel-studios-thor-love-and-thunder/); [Chrome console formatting](https://developer.chrome.com/docs/devtools/console/format-style), including `%c` and data-URL restrictions; [SVG image conformance](https://www.w3.org/TR/SVG2/conform.html), including restricted image processing. These establish design context and platform foundations, not new-preset test results.

**ADR gate:** required for the new public effect/profile and compatibility contract. [ADR-0012](../adrs/0012-use-bounded-cinematic-lettering-profiles.md) is **Proposed**, extends the existing internal-model policy, and supersedes no accepted record. Implementation of that new contract is blocked until the maintainer accepts it. No existing ADR is silently rewritten or marked accepted.

Material governing decisions: [ADR-0002](../adrs/0002-compile-purely-and-emit-exactly-once.md) (one emission), [ADR-0003](../adrs/0003-share-one-versioned-scene-model.md) (model/compatibility), [ADR-0004](../adrs/0004-separate-core-react-adapter-and-studio.md) (package boundaries), [ADR-0005](../adrs/0005-generate-output-from-validated-data.md) (security/bounds), [ADR-0006](../adrs/0006-qualify-renderer-profiles-in-real-devtools.md) (qualification), and the repository's ADR-0007–0011 policies for persistence, tooling, evidence, delivery, and accessibility. See the [canonical index](../adrs/README.md).

## 10. Verification, assumptions, and implementation handover

The user requested persistence of a spec for these demonstrated presets. This save records that requested scope; it does not claim the user reviewed every new API field, numeric default, or architectural proposal. Exact material artwork, thresholds, and grouping copy remain proposed within the bounded design. ADR acceptance and later implementation authorization are separate checkpoints.

Only this spec, the supporting Proposed ADR, and its minimal canonical-index entry belong to the documentation change. No source/assets, package versions, lockfiles, deployment settings, or historical evidence are changed. This pass establishes source-backed planning and document consistency only; no new-preset implementation, browser qualification, package test, or publication was performed.

### Copy-ready execution prompt

```text
Implement docs/specs/cinematic-metal-presets-spec.md in servrox/console-fx.

First read AGENTS.md, docs/adrs/README.md, and the relevant accepted ADRs.
Verify that ADR-0012 has been accepted; if it remains Proposed, stop before
implementing the new effect/profile contract and request its review.
Re-inspect current source because the spec baseline is a pinned earlier revision.

Work incrementally: library/type/catalog/validation and static rendering first;
then four factories; then gallery/studio/export integration; then qualification.
Use one composite cinematicMetal effect through the existing SceneV1 compiler.
Preserve old preset behavior, safe one-call code generation, source text,
explicit fallback, resource limits, and the restrained cyan studio design.
No copied film assets, font fetching/embedding, generic plugins, new package,
console timers/clearing, automatic logging, publication, or deployment.

Meet the acceptance criteria with proportional automated/consumer/visual tests.
Record commands and results separately from actual Windows Chrome/Edge DevTools
observations in docs/specs/cinematic-metal-presets-evidence.md. Mark unavailable
checks and qualification honestly; do not replace them with page screenshots.
Preserve unrelated work and report the changed files, governing ADRs, test
results, remaining qualification gates, and the scoped release-note changes.
```
