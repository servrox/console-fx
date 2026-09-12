---
title: "ConsoleFX — TypeScript framework and visual console configurator"
status: "approved specification revisions saved; implementation pending"
created: "2026-09-10"
updated: "2026-09-11"
artifact_path: "docs/specs/console-fx-spec.md"
mode: "deep"
repository: "servrox/console-fx"
package_names: ["@servrox/console-fx", "@servrox/console-fx-react"]
npm_scope: "@servrox"
npm_publish_access: "unverified; confirm before release"
license: "MIT; asset and dependency rights checks pending"
requested_scope: "save only the approved specification and implementation handover revisions"
---

# ConsoleFX
## Approved implementation specification

**Current evidence update — 2026-09-12:** the original save checkpoint below is
historical. Later implementation is recorded in the [base evidence](console-fx-implementation-evidence.md)
and [cinematic feature evidence](cinematic-metal-presets-evidence.md). Accepted
ADR-0012 adds the bounded cinematic contract; Accepted ADR-0013 supersedes
ADR-0011 and makes unperformed screen-reader review nonblocking follow-up.
The original 24 criteria remain the base product contract.

**Outcome:** a publishable TypeScript library for composing a styled console message, an integrated Next.js landing page and studio that exports a self-contained `console.log(...)`, a required thin React adapter, and tested Next.js recipes. The product name is ConsoleFX. The maintainer approved the revised product contract, MIT license choice, and save-only update to the existing spec and handover. Implementation and release remain pending.

**Approved shape:** two npm packages, one Next.js application, and no separate Next.js runtime package initially, under Accepted ADR-0004.

| Deliverable | Name | Responsibility |
| --- | --- | --- |
| Framework | `@servrox/console-fx` | Typed scene model, validation, compilation, presets, standalone export |
| React adapter | `@servrox/console-fx-react` | Explicit event logging, opt-in mount banner, reusable preview |
| Integrated landing page and studio | `apps/studio` | Hero, examples, and visual editor consuming the public package APIs |
| Next.js integration | Example and documentation | Client component integration and optional startup instrumentation |

The repository and package naming are selected, not placeholders. npm scope access and name availability remain unverified release gates. Paths, APIs, and commands describing implementation remain planned work. This save updates only this specification and its [implementation handover](console-fx-handover.md), preserving the existing instructions, Accepted ADRs, visual references, exploratory script, and Git index. It authorizes no feature implementation, dependency installation, commit, publication, or deployment.

## 1. Requirements and boundaries

### 1.1 The core contract

A scene describes one message. Compilation produces zero console emissions. Explicit emission produces exactly one call to a console sink. A standalone export contains exactly one `console.log(...)` invocation and does not require the npm package at execution time.

“One message” can occupy several visual lines inside one console entry. It does not imply one physical line of JavaScript or one visual text line. DevTools may additionally display a pasted expression's return value; that is not a second library emission. The Console standard describes this distinction [S10].

Core compilation, emission, and exported snippets must not clear existing logs, replace global console methods, poll, create animation timers, fetch remote resources, or modify the application's DOM. Explicitly rendered preview/editor components are the intended UI exception; they must not make hidden console emissions. Editing the configurator must not automatically print messages. The studio's explicit **Test in console** button emits once for each user click.

Decorative animation describes precomputed motion. It is not live application state. A moving indicator must not be described as real deployment progress or a changing live metric.

### 1.2 In scope

The initial product includes typed and serializable scene configuration, static styled text, a bounded SVG graphics renderer, finite declarative motion, plain-text fallback, presets, safe standalone code generation, recoverable local drafts, import/export, npm packaging under MIT, the React adapter, Next.js recipes, and the integrated landing page/studio. All eight effect families and four motion treatments in section 4.4 are launch requirements. Motion remains experimental until qualified; that label does not waive the full-product launch gate.

### 1.3 Non-goals

Do not build a terminal emulator, transport logger, observability platform, animation engine for general web pages, browser extension, or replacement for Pino/Winston. Do not add server-log forwarding to the browser, arbitrary JavaScript execution, arbitrary HTML/SVG/CSS upload, custom font fetching, cloud accounts, databases, paid services, or remote preset execution.

Do not promise arbitrary CSS support, identical typography across operating systems, automatic knowledge of the DevTools theme, or reliable detection of whether DevTools is open. Do not offer an update, pause, resume, or delete handle for an already emitted log entry. Those capabilities are outside the selected Console API contract [S10].

## 2. Evidence and feasibility gate

### 2.1 Verified platform foundations

Chrome documents `%c` styling, ANSI SGR styles, and `data:` URLs for CSS image references in console messages. It restricts URL-based console styling to data URLs [S1]. SVG's image processing model allows declarative animation without script execution or external references [S2].

These two facts support investigating animated SVG as a console background; they do **not** prove that every animation/filter behaves correctly in every DevTools version. The earlier chat demonstration is exploratory context, not a release qualification result.

Next.js supports client component boundaries and advises library authors to preserve `"use client"` on client entry points [S3]. Its `instrumentation-client.ts` convention provides a possible startup integration [S4]. React Strict Mode reruns render/effect work during development, so render-time logging and naive mount effects need explicit testing [S5].

### 2.2 Mandatory Phase 0 experiment

Before building the full editor, create a small internal fixture with one badge, a multi-style text line, a static SVG, and an animated SVG. Execute generated code in actual **Windows 11 Chrome and Edge DevTools**, separately, on each browser's current stable channel. Verify stable-channel currency at qualification time; record the observation date, exact browser/build and Windows build, theme, zoom, console width, test case, renderer/options, candidate revision or artifact fingerprint, outcome, and evidence path. Do not infer Edge results from Chrome or use Linux/headless page rendering as this gate's evidence.

Observe text clipping, escaping, background visibility, SVG filter bounds, motion start and stop, logging before DevTools opens, closing/reopening DevTools, offscreen entries, repeated identical snippets, narrow consoles, and copied text.

A normal browser `<img>` screenshot is useful rendering evidence but is not DevTools UI evidence. Playwright console events can validate emitted arguments and counts [S6]; they do not by themselves establish that the DevTools frontend painted or animated the entry correctly.

**Phase 0 and launch gates:** the four feasibility fixtures establish the first implementation path, not completion of the gallery. Before the full product launches, every required effect family and motion treatment in section 4.4 must pass actual DevTools qualification in both Windows 11 browsers on recorded current-stable builds. Each supported combination needs its own fixture. Failed, unavailable, or stale qualification keeps the full launch blocked; fix the treatment or obtain a revised product-scope decision rather than silently dropping it.

Under ADR-0006 and ADR-0010, independently qualified CSS/plain-text and static SVG slices can progress and be delivered within separate authorization. Keep animated SVG experimental until the relevant evidence exists; disable unsupported motion controls and preserve static output. Such a slice does not satisfy the complete launch requirement. Do not replace failed single-entry animation with clear-and-redraw loops. Record compatibility evidence in the planned `docs/compatibility.md` and reproducible fixtures/observations under `tests/devtools/` when implementation is authorized.

No application or actual DevTools qualification was performed for this documentation save. Section 14 distinguishes source inspection and the bounded formatter-loop reproduction from those pending tests.

## 3. Product architecture

### 3.0 Repository baseline

Target repository: `servrox/console-fx`; the public repository and `main` default branch were recorded during initial planning. The September 11, 2026 local save preflight found a README, spec/handover, mockups, an exploratory console script, `AGENTS.md`, and eleven Accepted ADRs with an index, provider mapping, and setup receipt. There are no package manifests, lockfile, package scripts, CI workflows, or license file yet. The package and app paths below are planned. MIT is now approved; adding the license file and checking asset/dependency rights belong to later implementation/release work.

Use the NixOS-managed Linux toolchain in the `nixos` WSL distribution, with repositories/worktrees on the native Linux filesystem. Recheck current state and protect concurrent work before every authorized slice. Accepted ADR-0001 through ADR-0010 and ADR-0013 govern the covered architecture (ADR-0013 supersedes ADR-0011); section 13 maps their responsibilities. The historical empty-repository observation is not the current baseline.

### 3.1 One model, multiple renderers

```text
TypeScript configuration ─┐
                         ├─> validate + normalize -> SceneV1
Studio editor state ─────┘                            |
                                      capability resolution
                                                   |
                          ┌────────────────────────┼──────────────────┐
                          v                        v                  v
                     CSS text                 SVG image          plain text
                          └────────────────────────┼──────────────────┘
                                                   v
                               compiled args + diagnostics + preview data
                                                   |
                           ┌───────────────────────┼──────────────────┐
                           v                       v                  v
                    direct console.log      standalone JS       React adapter
```

The editor, preview, code exporter, and framework examples must consume the same normalized model and compiler output. Do not implement an independent “almost equivalent” renderer inside the editor.

### 3.2 npm package boundaries

Keep schema, validation, renderers, effect implementations, and code generation as modules of one core npm package. A separate package for each renderer would create unnecessary release coordination at this scale.

Planned public exports within the Accepted ADR-0004 boundaries:

| Import | Public contents |
| --- | --- |
| `@servrox/console-fx` | Scene types, `defineScene`, `parseScene`, validation/diagnostic types, read-only effect descriptors |
| `@servrox/console-fx/browser` | `compileConsole`, optional browser emission helper |
| `@servrox/console-fx/presets` | Individually exported preset factories |
| `@servrox/console-fx/codegen` | Standalone exporter and source serializers |

The root import must not import React, Next.js, editor components, or code generation. Browser code must not import Node built-ins. Preset factories must not register themselves globally. Subpath exports provide explicit package entry points [S7]; tests must verify the actual published export map.

A static ANSI compiler is a follow-on option, not a prerequisite. Chrome already supports ANSI styles [S1], but full ANSI parsing and cursor manipulation are separate work. Never interpret arbitrary incoming terminal control sequences as part of this initial release.

### 3.3 Planned workspace layout

```text
console-fx/
  apps/
    studio/
      src/app/
        page.tsx
        studio/page.tsx
        docs/
      src/features/
        editor/          # document state, selection, undo/redo
        controls/        # typed effect controls, panels
        preview/         # preview integration, replay/static switch
        export/          # copy/download and integration recipes
        persistence/     # local drafts, JSON/fragment import
      src/components/ui/
  packages/
    console-fx/
      src/model/
      src/validation/
      src/effects/
      src/renderers/css/
      src/renderers/svg/
      src/renderers/text/
      src/presets/
      src/codegen/
      src/browser/
      test/
    console-fx-react/
      src/hooks/
      src/components/
      test/
  examples/
    vanilla/
    react/
    next-app-router/
  tests/
    consumers/           # installs built tarballs, not workspace source
    fixtures/
    devtools/            # reproducible fixtures and observation records
  docs/
    specs/
    adrs/
    compatibility.md
    security.md
  .changeset/
  .github/workflows/
  pnpm-workspace.yaml
  package.json
```

Under ADR-0008, use pnpm workspaces [S8] with one `pnpm-lock.yaml`, strict TypeScript, a Next.js App Router studio, and React. Use `tsc` for initial ESM library output and declarations, avoiding a package bundler unless measured distribution needs justify one. Vitest owns library tests and Playwright owns studio interaction tests. At bootstrap, verify that Node 24 remains supported by the selected dependencies, select and pin compatible patched versions, settle lint/format tooling and lifecycle-script trust/release-age settings, and record compatibility before installing dependencies. Exact pins are unspecified until that check. Smoke-test Bun consumption separately. No Turborepo, backend service, database, or generic plugin platform is required initially.

## 4. Planned public API contract

This section specifies intended APIs. These exports do not exist yet.

### 4.1 Author a scene

```ts
import { defineScene } from "@servrox/console-fx";
import { compileConsole } from "@servrox/console-fx/browser";

const scene = defineScene({
  schemaVersion: 1,
  label: "starkAI — local AI, ready",
  surface: {
    width: 600,
    height: 180,
    background: "#080c1c",
    padding: 20,
    borderRadius: 14,
  },
  lines: [
    {
      align: "center",
      runs: [
        {
          text: "starkAI",
          style: { fontSize: 48, fontWeight: 900 },
          effects: [
            { kind: "neon", color: "#22d3ee", intensity: 0.7 },
            { kind: "wave", amplitude: 6, periodMs: 2400 },
          ],
        },
      ],
    },
    { runs: [{ text: "Local AI. Ready." }] },
  ],
  motion: { durationMs: 4800, finish: "freeze" },
});

// Compilation is pure and does not print anything.
const output = compileConsole(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "reduce", // Explicit "allow" enables qualified animation.
});

// Exactly one log call, under the caller's control.
console.log(...output.args);
```

The shared scene is renderer-neutral, but renderer fidelity is not identical. SVG supports explicit surface dimensions and positioning; CSS text uses a constrained inline/line layout and cannot promise exact image-like panel geometry. Unsupported or approximated features produce diagnostics.

### 4.2 Compile result and errors

```ts
export type ConsoleArgs = readonly [format: string, ...values: string[]];
export type Renderer = "css" | "svg" | "text";

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T; readonly diagnostics: readonly Diagnostic[] }
  | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] };

export interface Diagnostic {
  readonly code: string;
  readonly severity: "info" | "warning" | "error";
  readonly path: readonly (string | number)[];
  readonly message: string;
}

export interface CompiledConsole {
  readonly args: ConsoleArgs;
  readonly renderer: Renderer;
  readonly text: string;
  readonly animated: boolean;
  readonly byteLength: number;
  readonly preview: CompiledPreview;
  readonly diagnostics: readonly Diagnostic[];
}

export type CompiledPreview =
  | {
      readonly kind: "css";
      readonly lines: readonly {
        readonly runs: readonly {
          readonly text: string;
          readonly style: Readonly<Record<string, string>>;
        }[];
      }[];
    }
  | {
      readonly kind: "svg";
      readonly imageUri: string;
      readonly width: number;
      readonly height: number;
      readonly alt: string;
    }
  | { readonly kind: "text"; readonly text: string };

export interface CompileOptions {
  readonly target?: "chromium" | "firefox" | "safari" | "node" | "bun" | "unknown";
  readonly renderer?: Renderer;
  readonly motion?: "allow" | "reduce";
  readonly unsupported?: "error" | "fallback";
}
```

`defineScene` validates developer input and returns normalized `SceneV1`, or throws an exported `SceneValidationError` containing read-only diagnostics. `parseScene(unknown): ValidationResult<SceneV1>` accepts an already decoded value and returns a discriminated result for untrusted data; failure has no partial scene and at least one error diagnostic. Unsupported future versions have an identifiable `unsupported-schema-version` diagnostic. JSON readers enforce the input byte limit before parsing and turn decoding/parsing failures into visible import errors before calling this API.

`compileConsole(scene, options?: CompileOptions): CompiledConsole` validates before generation. Invalid scenes or requested unsupported capabilities throw an exported `ConsoleCompileError` with read-only diagnostics. The fallback policy never rescues structurally invalid data, unsafe controls, resource-limit failures, or unexpected internal errors. Diagnostic codes and paths are stable programmatic fields; consumers must not parse message wording.

Defaults are `target: "unknown"`, `renderer: "text"`, `motion: "reduce"`, and `unsupported: "error"`. There is no implicit rich-renderer selection. Rich output requires an explicit renderer and a supported target profile. An unsupported renderer/feature with `unsupported: "error"` fails; explicit `"fallback"` deterministically produces readable static text with a diagnostic naming the requested and resolved rendering behavior. There is no silent CSS-to-SVG promotion. Published richer profile capabilities require section 2 evidence; renderer names alone do not assert qualification.

The text renderer accepts any valid scene as its readable projection and reports omitted decoration as diagnostics. Choosing text, including by default, is not itself an unsupported-feature error. This does not bypass validation of the scene or its effect parameters.

The result's `renderer`, `animated`, and preview discriminator describe the **resolved output**, including fallback. CSS preview lines/runs contain normalized literal text and the compiler's allowlisted CSS property/value maps; property names use CSS spelling. SVG preview contains the exact generated image URI and dimensions used by console output, with its readable caption as `alt`. Text preview contains the same readable fallback. Adapters consume these public data structures without parsing `args` or reimplementing effects. Preview text is not console-percent-encoded; image URIs are not regenerated in the editor.

`CompiledConsole.byteLength` is the sum of UTF-8 bytes in the format string and every string argument, measured after encoding, excluding JavaScript source syntax. `exportConsoleLog(...).byteLength` is the UTF-8 byte count of the complete returned `code`, including both motion branches when present. Use `TextEncoder` or an equivalent browser-safe UTF-8 count, never JavaScript string length. These are distinct payload measurements, not heap-size claims.

Return diagnostics as values. Never add hidden `console.warn` or `console.error` emissions. Unexpected internal failures must not be silently reported as successful compilation.

### 4.3 Stable scene and effect contracts

`SceneV1` contains a schema version, readable label, optional surface, ordered lines, styled text runs, and bounded motion settings. Configuration is JSON-compatible: no functions, class instances, DOM nodes, symbols, or executable strings.

An effect is a discriminated union with typed parameters. One internal catalog owns validation, defaults, composition, and implementation. Expose a read-only descriptor projection through the public core root so the studio and React adapter can build controls without private source imports:

```ts
export type ParameterDescriptor =
  | { readonly type: "number"; readonly default: number; readonly min: number;
      readonly max: number; readonly step: number }
  | { readonly type: "color"; readonly default: string }
  | { readonly type: "boolean"; readonly default: boolean }
  | { readonly type: "enum"; readonly default: string; readonly values: readonly string[] };

export interface EffectDescriptor {
  readonly kind: EffectKind;
  readonly displayName: string;
  readonly family: string;
  readonly scopes: readonly ("run" | "surface")[];
  readonly parameters: Readonly<Record<string, ParameterDescriptor>>;
  readonly renderers: readonly Renderer[];
  readonly motion: "static" | "decorative";
}

export function getEffectDescriptors(): readonly EffectDescriptor[];
```

`EffectKind` is the exported discriminant union from the built-in scene effect types. The descriptors' parameter keys, defaults, constraints, and supported scopes/renderers must match the same catalog used by validation/compilation. Protect nested data at runtime as well as through read-only TypeScript types so a consumer cannot change later compilation by mutating a descriptor. Descriptor enumeration has no side effects and a stable order. Document descriptor renderer support separately from the versioned browser qualification matrix.

This is public inspection of built-in metadata under ADR-0003/0004, not public registration, callbacks, custom renderers, or an extension mechanism. Effect implementations and extensibility remain internal. Exact built-in parameter bounds must be defined and tested with each effect within section 9's limits; do not invent measured browser support from descriptor presence.

Use a fixed application order for composable families: background, fill, outline, extrusion/shadow, glow, then motion. Reject conflicting effects within a mutually exclusive family rather than relying on accidental array order. The first release need not support arbitrary effect combinations; each supported combination must have a fixture.

### 4.4 Presets

Preset factories return ordinary scene data. Editing a preset materializes that data into the document. Saved documents therefore retain their appearance when a future library release changes preset defaults. JSON schema versioning is independent of npm versioning.

The approved initial gallery requires **badge, neon, RGB split, extruded text, holographic, gold/chrome, CRT, and rainbow**. Provide recognizable gold and chrome variants within the gold/chrome family. Required motion treatments are **glow pulse, gradient drift, gentle wave, and a decorative moving indicator**. A moving border may implement the decorative indicator; no live-progress behavior is implied.

Provide an editable preset and reproducible fixture for every required effect, and fixtures for every required motion with a useful static alternative. The full product launch requires all eight families (including both metallic variants) and all four motions to pass section 2's Windows 11 Chrome **and** Edge gate. Arbitrary cross-products of effects/motions are not required, but every advertised combination is. An unqualified required treatment remains a launch blocker, not an optional backlog item.

## 5. Renderers and compatibility policy

### 5.1 Native CSS text

Build the format string from library-controlled `%c` and `%s` tokens. Keep user text in separate substitution arguments and add an explicit final style reset. **Raw `%s` arguments are not sufficient isolation in Chromium:** the inspected formatter substitutes the string into its remaining format input and scans again [S13]. Literal specifiers in text can otherwise consume later style/text arguments.

For the Chromium profile, encode **each literal `%` as `%%` exactly once** in every text substitution argument, including labels/captions, after normalization and before building arguments. Preserve original literal text in the scene and structured preview. Never apply this transform to the library-controlled template or to CSS values/data URLs passed to `%c`. For example, literal `100% %c` becomes substitution data `100%% %%c`; the visible result must remain `100% %c`. Do not concatenate untrusted text into the format template. Other formatter profiles require their own qualification rather than inheriting this encoding blindly. Plain-text fallback uses a single literal argument with no formatting arguments and no percent doubling.

Maintain a conservative internal property/value allowlist, limited to qualified presets. No raw CSS is accepted. Validate text controls before any renderer (section 9), because percent encoding does not neutralize ANSI escape sequences that Chromium also parses [S13].

Regressions must cover `%c`, `%s`, `%o`, `%O`, `%d`, `%i`, `%f`, `%_`, `%`, `%%`, repeated/adjacent tokens, a trailing percent at a run boundary, multiple styled runs, empty runs, emoji, combining marks, quotes, tabs, and normalized newlines. Assert visible text, complete argument consumption, and style/reset order against the formatter loop, direct arguments, standalone export, and actual DevTools samples. Include rejected ESC/ANSI/control inputs. A recording console sink alone cannot detect formatter rescanning.

CSS output remains native text. Browser-dependent text layout, font fallback, zoom, and wrapping must be documented. There is no arbitrary CSS keyframe animation mode on this renderer.

### 5.2 SVG image output

Generate SVG exclusively from validated scene data and internal templates. Serialize UTF-8 safely into a data URL without requiring Node's `Buffer` in browser bundles. Keep paint-server and filter identifiers stable for the same scene/options.

Use a `%c` background-image carrier with bounded dimensions. Include a visible plain-text caption, reset-styled and supplied through `%s` with the profile's literal-percent encoding from section 5.1, in the same log call. The image's lettering itself is not selectable; the caption provides readable and searchable content.

Declarative animation must have a bounded total duration and a useful static frame. When motion is enabled, the initial duration default and maximum are five seconds under ADR-0006. Longer or infinite animation is deferred. Static output is the safe default when motion preference is reduced or unknown.

System fonts are permitted; external font requests and font embedding are not initial features. For per-letter motion, preserve grapheme boundaries. When segmentation is unavailable or separate glyph placement would break text shaping, keep the affected run intact and return an approximation diagnostic.

Allow only internal fragment references such as `url(#gradient-id)`. No scripts, event-handler attributes, `foreignObject`, external URLs, nested external assets, or user-authored SVG markup. Protect dimensions, filters, blur ranges, text length, and element counts against excessive rendering cost.

### 5.3 Motion preferences and repeated output

The pure compiler receives `motion: "allow" | "reduce"` and defaults to `"reduce"`; it never reads browser state itself. Browser and React helpers default to static output and accept an explicit `motion: "system"` opt-in that resolves preference at emission time. Permit animation only when the environment positively reports `prefers-reduced-motion: no-preference`. Reduced, unavailable, throwing, or indeterminate media queries select static output. Compilation with `"allow"` remains subject to qualified capabilities and finite motion bounds.

A standalone animated export should contain precompiled static and animated argument arrays and select one at execution time using `matchMedia`, still within a single `console.log(...)`. This selection adds no timers, imports, or writes. It cannot retroactively change a previously emitted entry when the operating-system preference changes.

Repeated identical image URLs may have browser-specific animation lifecycle behavior. Record this in Phase 0. A future explicit `instanceId` option may generate a distinct image identity when needed; it must be an input to compilation, not hidden randomness. Do not promise independent restarts without observing that behavior in DevTools.

### 5.4 Compatibility matrix

| Profile | Initial contract |
| --- | --- |
| Windows 11 Chrome DevTools | Full required effect/motion gallery must qualify on the recorded current-stable build before full launch |
| Windows 11 Edge DevTools | Same full launch gate, separately observed on its current-stable build |
| Firefox DevTools | Plain text guaranteed by project tests; CSS subset qualified independently |
| Safari Web Inspector | Plain text first; richer support only after an actual Safari test |
| Node/Bun | Import/compile safety and plain text; do not emit browser SVG styles to a terminal automatically |
| SSR / server components | Pure compilation permitted; no automatic browser emission |

“Guaranteed” here is a planned project support contract conditional on passing tests, not a test result from this document.

Do not choose capabilities solely from user-agent sniffing or `CSS.supports()`. Page CSS support is not DevTools style handling. Omitted options select plain text; an explicitly requested richer renderer on an unknown/unsupported target errors unless fallback is explicitly permitted. A developer can explicitly choose the documented Chromium profile. Other operating systems and richer Firefox/Safari profiles are separate follow-on qualification work, not substitutes for the Windows launch matrix.

## 6. Standalone export

### 6.1 Primary output

The main action is **Copy console.log**. For a static scene the output is a single JavaScript expression statement with literal arguments:

```js
console.log("%c%s%c", "color:#22d3ee;font-weight:900", "starkAI", "");
```

For SVG, the literal style contains the generated data URL. There must be no `...` placeholders in exported source, no imports, CDN scripts, helper declaration, top-level await, IIFE, or required library installation.

For motion-aware export, a single log statement may spread a conditional choice between precompiled argument arrays. Count console emissions, not every function call: a read-only media-preference check is permitted.

Planned exporter API:

```ts
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const exported = exportConsoleLog(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "system",
});

// exported.code is complete standalone JavaScript.
// exported.byteLength is UTF-8 bytes of the complete code, including both alternatives.
// exported.diagnostics is data, not extra console output.
```

The exporter accepts the compiler's explicit target, renderer, and unsupported policy, with `motion: "system" | "reduce"` defaulting to `"reduce"`. `system` builds a guarded runtime choice only when the scene has qualified motion; `reduce` exports static arguments alone. Its typed result has read-only `code: string`, `byteLength: number`, and `diagnostics: readonly Diagnostic[]`; failures carry typed diagnostics as in section 4.2. The pure compiler's separate `motion: "allow" | "reduce"` option represents an already-resolved policy.

The generated preference guard chooses static arguments if `matchMedia` is absent or does not positively establish `no-preference`. Test absent browser globals, reduced preference, positive no-preference, and an indeterminate query result. Browser/React helpers additionally catch host API errors and retain static output; a modified or throwing host API in standalone source is an execution error, not a claimed successful emission. Keep the one-statement source form and no-IIFE boundary.

### 6.2 Source generation safety

Use a dedicated JavaScript string serializer, including quotes, backslashes, control characters, `<`, and Unicode line separators. Never interpolate raw text into a template literal or executable expression. Avoid execution of exported code in the editor: the test button sends already compiled arguments directly to `console.log`.

Test generated source with a parser. Assert exactly one `console.log` call, no unexpected executable nodes, and no imports, writes, timers, network APIs, or dynamic code evaluation. Execute the source in an isolated test harness with a recording console and both media-preference outcomes. Assert equality with direct compilation and preservation of malicious-looking input as text.

### 6.3 Export variants

Provide standalone JavaScript, TypeScript package usage, React component/hook usage, Next.js startup/client-component recipes, and versioned JSON. JSON export is the durable editable format. A compiled snippet is a frozen output, not the editable source of truth.

Display snippet byte size and renderer support status before copying. The byte count must include both branches of a motion-aware export.

## 7. Next.js visual configurator

### 7.1 Main user journey

Choose a preset or blank message; edit text and styling; choose a target renderer; inspect the preview and diagnostics; test one entry in the real console; copy the self-contained log statement or export another integration format.

The landing page includes the hero, required output gallery, and working studio in one continuous flow. Selecting a gallery item loads its materialized configuration into that editor without printing. A focused studio route may reuse the same editor, but does not replace the integrated landing-page experience.

### 7.2 Screen layout

Use a desktop three-area editor with a stacked narrow-screen arrangement. The left area contains presets, lines, and run selection. The center contains the bounded preview and preview background selection. The right area contains typography, color, effects, dimensions, and motion controls. An export panel below shows the current code, byte size, compatibility status, and primary copy action.

Follow the [current visual direction](../mockups/README.md#current-design-direction): a restrained dark interface with softly raised/inset surfaces, readable control boundaries, and small cyan accents. The example outputs can be expressive. Preserve the integrated page hierarchy and the primary export action on mobile. Mockup version numbers, popularity counts, timings, and abbreviated snippets remain illustrative; do not copy them as product claims.

Primary actions: **Copy console.log**, **Test in console**, and **Export JSON**. Secondary actions include import, undo/redo, reset, and copy a shareable configuration link when it fits the size budget.

Do not auto-scroll or focus DevTools, clear logs, print on each keystroke, or show notifications by printing extra console messages. Report editor errors in the UI.

### 7.3 Preview honesty

Label CSS preview **Approximate browser preview**. Render the compiler's public `preview` lines/runs and style maps; do not parse its format string or imply that page layout perfectly reproduces DevTools.

For SVG, render `preview.imageUri` through an `<img>` with `preview.alt` and the compiler's dimensions. Text preview uses `preview.text`. Do not insert imported SVG with `dangerouslySetInnerHTML`. The SVG preview is still not proof of DevTools compatibility.

Provide **Play**, **Replay**, and **Show static** actions for the editor preview. Show static replaces the preview with a static rendering; do not advertise exact timeline pause/resume unless implemented and tested. Changing the preview does not change an entry already printed to the console.

### 7.4 State and storage

Store normalized scene data separately from transient selection, open panels, preview background, and export tab state. Use a reducer with bounded undo/redo history. Do not add a global-state dependency unless component complexity actually warrants it.

Keep drafts in local storage under the current browser origin/profile until replaced, explicitly cleared, or evicted/cleared by the browser. Guard reads, writes, and deletes; report failures visibly while preserving the valid in-memory scene and available JSON export. No server backup or cross-device synchronization is implied. Use this deterministic recovery flow:

1. On client initialization, read, size-check, decode, validate, and normalize any local draft and incoming shared fragment before autosave can write. Automatically resume a valid local draft; do not ask to restore it and do not overwrite it with the default scene during hydration.
2. If a valid shared scene differs from the normalized valid draft/current document, show a confirmation before replacing that work. Retain the current scene while the choice is pending. Equal scenes need no confirmation; a valid shared scene can load directly if there is no valid user work. Cancel keeps current work. Neither path emits a log.
3. Validate file/shared imports fully before applying them. Malformed, future-version, oversized, or unsafe input leaves the current scene and history intact and does not replace a valid stored draft. A corrupt stored draft does not destroy in-memory work; expose retry, JSON export of valid work, and clear-draft recovery without silently deleting the failed stored payload.
4. A successful import into an active editor is one undoable replacement, with a single history entry and cleared redo branch; undo restores the prior document and redo reapplies the imported one. Initial startup restoration/loading establishes the initial history baseline. History remains bounded to 100 committed operations.
5. **Reset** requires confirmation. Cancel changes nothing. Confirm returns to the documented blank/default scene and clears session undo/redo history; it is an explicit discard, not an undoable import. Reset does not imply deletion of a stored draft or exported/shared copies. Explain the separate **Clear local draft** action; resume autosave for a reset scene only after a later committed edit.
6. **Clear local draft** removes only the app's draft key, keeps the current scene/history available, and is safe to repeat. Cancel or drain pending writes and prevent stale autosave callbacks from recreating a successfully cleared draft; resume persistence only after a later committed document edit. Report deletion failure and offer retry without pretending the old draft is gone. Do not call `localStorage.clear()` or remove unrelated origin data. Clearing cannot revoke downloaded/copied files or shared links.

Guard initialization and queued writes so a pending import/conflict decision, reset, or clear-draft action cannot race an older autosave. When storage is unavailable, editing, previews, copying, and JSON export continue in memory. Future schema versions produce the typed unsupported-version result; do not guess migrations.

A share link may encode the document in a URL fragment. Treat it as user-visible, not secret storage. Read and validate its payload client-side; do not auto-emit logs from imported links. Apply encoded and decoded size limits. If the link exceeds the project budget, offer JSON export rather than silently truncating or adding a backend.

### 7.5 Next.js implementation boundaries

Keep the shell and documentation server-renderable/static where practical. Put editor state, clipboard access, storage, media preference, and console actions behind narrow client boundaries [S3]. No route handler, server action, authentication service, or database is needed for the configurator's initial requirements.

The studio's security policy must permit the generated data-image preview. Treat deployment CSP configuration as an explicit test item rather than assuming browser-console behavior and page behavior are identical.

No analytics or remote configuration in the library or exported snippets. Do not add product analytics to the studio as part of this scope.

## 8. React and Next.js integration decision

### 8.1 React package: include as a thin adapter

Provide three small surfaces:

```tsx
const { log } = useConsoleScene(scene, options);
<button onClick={log}>Print banner</button>

<ConsoleBanner scene={scene} enabled={showBanner} />

<ConsolePreview scene={scene} options={options} />
```

`useConsoleScene` must not emit during render or hook initialization. It returns an explicit callback that compiles/emits the current scene/options once per call. `ConsoleBanner` is the opt-in automatic alternative: it defaults to disabled and emits in a client effect on the **first committed enabled state of each mounted instance**, using the scene/options current at that time. An initially disabled banner can emit once when later enabled. Once it has emitted, edits and false/true toggles do not emit again for that instance. Disabled/render/SSR paths stay silent. React's development effect replay must not duplicate the emission [S5].

A genuine unmount/remount is a new instance and may emit again. Fast Refresh, page reloads, and multiple component instances are not an “exactly once forever” guarantee. Do not add hidden global registries or session storage merely to hide these distinctions. A once-per-application registry can be a later explicit feature if requested.

Keep `react` as a peer dependency and do not bundle React. Add and preserve `"use client"` on the adapter's client entry points. The package must be safe to import in a Next.js application without render-time browser-global access [S3]. Use the studio to exercise the same preview and emission adapter consumers receive.

### 8.2 Next.js package: defer

A separate package is not justified merely to re-export the React adapter. Support Next.js through a tested App Router example, root-layout banner guidance, and an optional `instrumentation-client.ts` recipe [S4]. Browser and server output must be explicit; importing browser tooling into server instrumentation must not silently print SVG carrier strings into terminal logs.

Prefer a precompiled/static banner in early startup paths. Document actual behavior when DevTools opens after startup. The existence of instrumentation hooks does not imply that animation timing is controlled by Next.js.

Reconsider `@servrox/console-fx-next` only for a real Next-specific feature, such as build-time precompilation/injection or a tested integration requiring Next APIs. Do not introduce a config wrapper or instrumentation plugin just for branding.

## 9. Safety, accessibility, and resource budgets

The following are initial engineering limits, not measured platform limits or performance claims:

| Resource | Initial engineering bound |
| --- | --- |
| Input JSON | 64 KiB before parsing |
| Total document text | 2,000 Unicode code points |
| Lines / runs | 8 lines; 32 runs total |
| Per-glyph animation | 80 graphemes; otherwise whole-run fallback |
| Effects per run | 4, subject to family compatibility |
| SVG canvas | At most 1,200 × 400 CSS px |
| SVG nodes | At most 1,000 generated elements |
| Motion | Static default; at most 5 seconds when enabled |
| Exported snippet | Warn at 32 KiB; refuse above 128 KiB |
| Undo history | 100 committed editing operations |
| Share fragment | 8 KiB encoded project policy; JSON export above it |

Reject nonfinite numbers, invalid enums/colors, out-of-range parameters, and dangerous property names during untrusted import. Walk only schema-owned fields and avoid merging arbitrary objects into prototypes. Cap work before generating large strings or node arrays. Byte budgets are UTF-8 bytes (1 KiB = 1,024 bytes), including input before JSON parsing and encoded/decoded fragment checks; text and grapheme limits retain their separate units.

For every renderer and import path, reject disallowed text controls with a diagnostic path before emission or generation: U+0000–U+001F except TAB (U+0009), LF (U+000A), and CR (U+000D), plus DEL/C1 U+007F–U+009F. This includes ESC/ANSI sequences; do not silently strip or execute them. Normalize CRLF and bare CR to LF, preserve tabs and valid Unicode, and reject unpaired UTF-16 surrogates so UTF-8/XML serialization cannot silently replace user text. JavaScript serialization still escapes allowed line/control characters and separators. Rejected imports preserve valid work.

Prevent rapid flashes in shipped motion presets. Respect reduced-motion preference in the app, helpers, and motion-aware exporter. Use proper labels, keyboard controls, visible focus, and readable diagnostics in the editor. Console decoration is not the sole delivery channel for important application information.

Accepted ADR-0013 retains WCAG 2.2 AA as the target for studio/documentation interfaces and React preview controls. Validate critical editing, preview, import/export, copy, test, and recovery journeys with automated checks and manual keyboard, focus, zoom/reflow, and reduced-motion checks. Include error states. Representative screen-reader/browser review is recommended nonblocking follow-up, owned by the maintainer and revisited at the next accessibility review or assistive-technology feedback; missing observations do not block launch or publication. Automated scans alone are not conformance proof; any unresolved critical-journey failure blocks promotion unless a bounded maintainer-approved exception is recorded as the ADR requires. This baseline makes no claim about the vendor-owned DevTools interface.

Initial size goals: a simple CSS preset consumer at most 10 KiB gzip and an SVG-capable consumer at most 25 KiB gzip, excluding React/Next. These are proposed bundled-consumer budgets, not existing results. Measure per consumer entry; unused codegen, presets, and React modules must not appear in a basic core consumer.

## 10. npm publication plan

### 10.1 Package contents

Publish compiled ESM JavaScript, TypeScript declarations, source/declaration maps where useful, README, changelog, and the approved MIT license. Use an explicit `exports` map and `files` allowlist. Set `sideEffects: false` only while package import remains side-effect-free. The monorepo root and studio must be `private: true`.

Use TypeScript declaration output [S11]. Node documents package entry-point/export mapping [S7], and npm documents packaged files, dependencies, peer dependencies, and publication metadata [S12]. Do not bundle React/Next or ship editor assets in the core package. Avoid install/postinstall scripts.

Use ESM-only initially under ADR-0008, with a documented support policy. Add CommonJS output only if a concrete consumer requires a reviewed compatibility change. Test plain JavaScript consumption as well as TypeScript; npm users must not need a TS compiler to execute the package.

MIT is the approved license choice for the project and both npm packages. Add the actual license file and consistent package metadata in the authorized implementation phase; verify copyright attribution and asset/dependency redistribution rights before release. No license file is created by this save-only task. npm scope access, package-name availability, rights checks, and publication prerequisites remain release gates; license selection is no longer an unanswered choice.

### 10.2 Release pipeline

Use Changesets for coordinated version/changelog changes. On a release candidate: install the locked toolchain, validate, build, create package tarballs, inspect their contents, and install those tarballs into isolated vanilla/React/Next consumer fixtures. Do not treat workspace import success as package-distribution proof.

Use GitHub-hosted Actions with npm trusted publishing through OIDC rather than a long-lived write token. Configure the authorized repository/workflow per package. npm documents automatic provenance for eligible public-package publications from public repositories through supported OIDC providers [S9]. Confirm first-publication/bootstrap prerequisites before enabling unattended release jobs.

Separate release readiness from publication authority. Initial preview releases use a non-default prerelease tag and accurately name any partial/experimental scope; the full product launch/stable promotion requires all 24 acceptance criteria, including the complete Windows 11 current-stable Chrome/Edge gallery gate, and the package/release checks. Actual publishing, npm scope/account configuration, and deployment require a subsequent explicit task. Hosting is unspecified until that task resolves the target, CSP/runtime checks, and recovery. The target repository already exists; do not create a replacement repository.

### 10.3 Recovery

Do not depend on unpublishing a version as the normal recovery path. Publish a corrective patch or move the default distribution tag to the previous known-good version where appropriate. For visual regressions, remove or downgrade a capability/preset in the next release and preserve readable fallback. Retain JSON schema migrations when configuration formats change.

## 11. Validation and acceptance

### 11.1 Planned scripts

These commands are requirements for the future repository; they do not exist yet and were not run here.

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run test:codegen
pnpm run build
pnpm run check:packages
pnpm run test:consumers
pnpm run test:studio
pnpm run check:bundle-size
```

`check:packages` must inspect both tarballs, export resolution, declaration resolution, peer dependencies, packaged files, and preservation of client directives. `test:consumers` must install the tarballs rather than rely on workspace path aliases.

Inspect actual scripts at bootstrap and make build/pack prerequisites explicit so consumer and production-studio tests use the candidate being checked. Before the first lockfile exists, the authorized bootstrap must resolve pins and install policy and create it; the frozen-install command applies afterward. Add tests for changed observable contracts, not ceremonial document tests. Under ADR-0009, assign each proof obligation one owner, choose checks in proportion to risk, and record source/static, local, CI, package installation, deployment, and external observations separately. Actual DevTools and manual accessibility gates are additional scenarios, not implied by the command list.

### 11.2 Acceptance matrix

| ID | Requirement | Evidence |
| --- | --- | --- |
| AC-01 | Importing any public entry creates no logs, timers, network requests, or page changes | Isolated import tests |
| AC-02 | Fixed scene and options compile to identical arguments, diagnostics, and preview data without mutating input | Unit and frozen-input tests |
| AC-03 | An explicit emission produces exactly one call; compilation produces none | Recording console sink |
| AC-04 | Exported JavaScript has one console.log and matches direct output | AST and isolated execution tests |
| AC-05 | Literal percent specifiers survive Chromium rescanning without consuming other runs' arguments; valid Unicode remains text and forbidden controls fail validation | Section 5.1 adversarial corpus, formatter regressions, direct/export parity, and actual DevTools samples |
| AC-06 | SVG contains no forbidden tags, attributes, or external references | Parsed-SVG structural tests |
| AC-07 | Omitted, reduced, or unknown motion policy chooses static output; explicit system motion only animates on positive no-preference | Exporter branch/default tests and adapter preference/error tests |
| AC-08 | Animation ends within the configured bound and freezes usefully | Actual DevTools observation |
| AC-09 | Unsupported profiles do not silently claim equivalent fancy output | Diagnostic/fallback tests |
| AC-10 | Integrated landing gallery loads the same editable studio silently; edits/imports print nothing and each test click prints once | Production-build desktop/mobile browser journeys |
| AC-11 | JSON round trips preserve materialized scenes; invalid/future imports preserve work; successful active-session imports undo/redo as one operation | Round-trip, failure, and bounded-history fixtures |
| AC-12 | React render/SSR is silent; first-enabled emission uses current scene/options once despite Strict Mode replay or later toggles/edits | React and Next consumer lifecycle tests, including initially disabled banners |
| AC-13 | Real remount/reload behavior matches documentation | Integration scenarios |
| AC-14 | Core consumers do not include React, Next, or codegen accidentally | Bundle inspection |
| AC-15 | npm tarballs work in isolated JS, TS, React, and Next consumers | Package-consumer CI |
| AC-16 | Advertised combinations render without unacceptable clipping; lifecycle, copy, narrow console, and static/motion behavior match recorded claims | Actual DevTools matrix with date, exact Windows/browser builds, candidate, settings, result, and artifacts |
| AC-17 | Resource limits reject excessive payloads before costly generation | Boundary and fuzz tests |
| AC-18 | Critical studio/docs/React-preview journeys meet ADR-0013's WCAG 2.2 AA target, including mobile/reflow, static preview, clipboard/storage failure and recovery | Automated accessibility plus manual keyboard/focus/reflow/motion; screen-reader/browser review is nonblocking follow-up |
| AC-19 | All eight required effect families, both gold/chrome variants, and all four required motions pass actual Windows 11 current-stable Chrome and Edge DevTools before the full launch | Complete section 4.4 fixture-to-browser launch matrix; no missing/failed required row |
| AC-20 | Public effect descriptors are deeply read-only, match core validation/defaults/support metadata, and drive controls without private imports or public registration | Descriptor mutation/consistency tests and public-entry consumer inspection |
| AC-21 | Typed validation failures have diagnostics and no partial scene; structured compiler preview matches resolved output and byte counts use UTF-8 | API type/contract tests, exact SVG URI and CSS segment comparisons, multibyte payload/source-size cases |
| AC-22 | Renderer selection is explicit, omitted options use static text, and unsupported requests error unless deterministic text fallback was requested | Option/default/error/fallback matrix, including invalid input that must never fall back |
| AC-23 | Valid drafts resume automatically; conflicting shared scenes confirm; failures preserve valid work; reset confirms and clear-draft is repeatable without stale-write resurrection | Startup/conflict/cancel, corrupt/quota/unavailable storage, reset/history, deletion retry, and queued-write race tests |
| AC-24 | Core, integrated studio, React adapter, and tested Next.js recipes are delivered with MIT metadata/license and resolved release prerequisites | Delivery checklist, tarball license inspection, rights review, tested recipes, and separately recorded release authority |

Screenshots, snapshots, arguments, runtime behavior, and published artifacts are separate evidence stages. A successful Next build or Playwright console event must not be reported as DevTools animation proof or npm publication success.

## 12. Delivery phases

| Phase | Deliverable | Exit gate |
| --- | --- | --- |
| 0 — Feasibility | Badge/multistyle/static-SVG/motion fixtures and actual Windows 11 Chrome/Edge compatibility record | Record current-stable builds, observations, failures, and static recovery; no full-gallery claim yet |
| 1 — Core vertical slice | Scene/validation model, public descriptors and preview data, CSS/text compiler, neon preset, standalone export | AC-01 through AC-05, AC-20 through AC-22 for the slice; plain JS consumer |
| 2 — Visual studio | Integrated landing/editor, local drafts/recovery, shared-scene confirmation, preview, copy/test | Same public compiler used end-to-end; AC-10/11/18/23 for implemented journeys |
| 3 — SVG and effects | All eight required families and four motions, bounded SVG, static alternatives, full gallery | AC-06 through AC-09/16/17/19 and completed metadata/preview coverage |
| 4 — Integrations | Required thin React package, public preview/emission integration, React and Next recipes/examples | AC-12 through AC-14; related accessibility and lifecycle gates |
| 5 — Release readiness | MIT files/rights, both tarballs, current docs, versioning and planned OIDC workflow | All AC-01 through AC-24, full browser matrix, package checks, and release checklist; publication still separately authorized |

Prioritize a complete first path: **choose neon → edit text/color → inspect preview → copy one console.log → paste into real DevTools**. Do not build every effect before proving this path.

For each authorized phase, record paths/owners, baseline revision and protected work, dependencies, acceptance evidence, stop conditions, and the last reversible point. Keep in-memory valid scenes and exported JSON available through storage/import failures. Fix/downgrade a failed capability in a reviewable candidate while retaining readable fallback; a downgrade of a required launch treatment leaves launch blocked. A completed phase does not authorize the next phase or an external write.

Later implementation must update the root README, visual-direction status notes, compatibility/security documentation, tested integration recipes, and release documentation to match observed behavior. Reconcile setup-era summary wording about unresolved licensing or the original spec baseline in derived governance documentation during an authorized documentation update; preserve the setup receipt as historical evidence and never rewrite Accepted decision intent. Those files are outside this two-document save.

<a id="13-architectural-decisions-proposed-for-implementation"></a>

## 13. Architectural decisions and ADR gate

**ADR required: no new ADR.** All eleven records in the [canonical architecture index](../adrs/README.md) are Accepted, with maintainer approval recorded on September 11, 2026. They govern their covered architecture; acceptance is not evidence that implementation exists or authority to execute later phases. The existing `docs/adrs/NNNN-kebab-title.md` single-file convention remains in force. The legacy section anchor above preserves links from the Accepted records.

| Governing decision | Application in this revision |
| --- | --- |
| [ADR-0001](../adrs/0001-use-repository-native-adr-governance.md) | Accepted local authority, conflict reporting, successor process, bounded save scope |
| [ADR-0002](../adrs/0002-compile-purely-and-emit-exactly-once.md) | Pure compilation, one emission, first-enabled per-instance React behavior |
| [ADR-0003](../adrs/0003-share-one-versioned-scene-model.md) | One normalized model/catalog, immutable public descriptor projection, import compatibility |
| [ADR-0004](../adrs/0004-separate-core-react-adapter-and-studio.md) | Core/React/studio ownership and public-only preview/metadata consumption; Next.js recipes |
| [ADR-0005](../adrs/0005-generate-output-from-validated-data.md) | Percent encoding plus control validation, safe CSS/SVG/JS generation, UTF-8 limits |
| [ADR-0006](../adrs/0006-qualify-renderer-profiles-in-real-devtools.md) | Explicit renderers/fallback, static defaults, actual DevTools evidence and finite motion |
| [ADR-0007](../adrs/0007-keep-studio-documents-local.md) | Local drafts, automatic valid recovery, confirmed conflicts/reset, undoable import, repeatable deletion |
| [ADR-0008](../adrs/0008-own-pnpm-and-typescript-toolchain.md) | pnpm/tsc ownership, bootstrap pin checks, ESM and packed-consumer verification |
| [ADR-0009](../adrs/0009-validate-changed-contracts-with-proportional-evidence.md) | 24 acceptance criteria, proportional checks, separate evidence stages |
| [ADR-0010](../adrs/0010-deliver-reversible-phases-with-publication-gates.md) | Reversible phases, complete launch gate, rights/npm/hosting/publication gates |
| [ADR-0013](../adrs/0013-keep-screen-reader-review-as-nonblocking-follow-up.md) | Supersedes ADR-0011: WCAG 2.2 AA target, required automated/keyboard/focus/reflow/motion checks, static alternatives; screen-reader review is nonblocking follow-up |

These are implementation details within existing decisions: descriptors expose read-only built-in metadata without opening extensibility; percent encoding enforces ADR-0005's literal-text requirement while keeping text arguments separate; the complete gallery/Windows launch requirement narrows product readiness without preventing independently qualified static slices under ADR-0006/0010. No decision is superseded or rewritten. No new ADR draft, status change, or index update is required. The [provider mapping](../adrs/provider-mapping.md) remains provenance/deferred-decision evidence, not binding policy.

Implementation is not blocked on a new ADR. If later repository or platform evidence contradicts Accepted intent, name the conflict, affected scope, impact, and required maintainer/successor decision before changing that implementation.

## 14. Open items and status

The approved review checkpoint confirms repository/package naming, the core plus integrated studio plus required React adapter plus Next.js recipes, MIT licensing, all eight effect families/four motions, the complete Windows 11 current-stable Chrome/Edge DevTools launch gate, and automatic valid-draft recovery with confirmed shared-scene conflicts and preservation of valid work on failure. The supplied save-only plan also approves the formatter, typed API/preview/descriptor, React, import/reset/clear-draft, and governance corrections recorded above. No fresh interview or feature implementation is part of this save.

Assumptions: packages remain intended for public distribution; the editor has no accounts/backend; core behavior is proved before the thin React integration. A separate Next.js package remains deferred. No blocking product choice remains for saving these documents.

Bootstrap gates: select/verify exact compatible patched toolchain/dependency pins, Node baseline support, lint/format ownership, and installation trust settings. Later release gates: current-stable browser builds and complete actual DevTools qualification, application/accessibility/consumer/package/CI evidence, asset and dependency rights, npm scope/name access and publication prerequisites. Hosting, its CSP/runtime evidence, target, and rollback remain unspecified until an authorized deployment task. MIT choice is settled; rights clearance, release authority, and deployment authority are separate gates.

Source challenge: Chromium's formatter rescans `%s` substitution text, so separate raw arguments alone do not preserve literal specifiers. Section 5.1 specifies percent encoding and control validation. Browser image support still does not prove DevTools motion; the full gallery needs actual Windows observations. Public descriptors and structured compiler preview resolve the public-package boundary without exposing implementation hooks. Existing Accepted ADRs already cover these corrections.

Artifact destination: this existing specification, with the [companion execution prompt](console-fx-handover.md). **Persistence status: saved.** The authorized change is documentation only. Revert only these scoped edits if recovery is needed, preserving later/concurrent changes and the Git index. Binding ADR approval was already recorded in the governance setup; this task changes no ADR.

### Documentation-save evidence

Observed on September 11, 2026; owner: the documentation-save agent. Environment: Linux, `nixos` WSL, `/home/servrox/dev/console-fx`; Nix-managed Git 2.54.0, Node 24.20.0, and Python 3.14.7. No project dependency installation or persistent test harness was needed.

| Obligation / subject | Stage | Result and limits |
| --- | --- | --- |
| Repository instructions, current manifests/scripts, and Accepted ADR alignment | source/static | Inspected existing docs/governance; no package scripts or CI exist to run; no new ADR required |
| Chromium formatter and formatting-guide challenge | source/static | Inspected S13 rescan/percent/ANSI behavior and S1 on this save; source behavior is not installed-browser qualification |
| Formatter-loop reproduction | local | Inline Node model reproduced unsafe raw `%s` rescanning and ANSI interpretation; 17 percent-encoding cases preserved text, style order, and argument consumption; no real DevTools or application execution |
| Saved spec/handover integrity and protected state | source/static | Verified with `git diff --check`, inline Python structural/baseline checks, and manual diff/contract review: 24 unique acceptance IDs, 122 local links/anchors across 19 Markdown files (including incoming legacy links), shared requirements, exactly two changed documents, 25 other files plus HEAD/index preserved |
| Application, React/Next, studio accessibility, packed-consumer tests | local | Not run: implementation, manifests, and scripts are pending |
| Actual Windows 11 Chrome/Edge DevTools launch matrix | local | Not run: all required observed browser/build/appearance/motion results remain pending |
| Repository CI | CI | Not run: no workflow or CI execution in this task |
| Package distribution/publication | publication/install | Not run: no artifact installation or publication |
| Hosted studio | deployed/production | Not run: no deployment or hosted runtime observation |
| npm scope/name access | external/third-party | Not run: no npm account/name verification or configuration |

The formatter model is bounded to the challenged loop and corpus, not a reusable proof of the future compiler or stable browser build. Changes to source, documents, link targets, candidate, or environment invalidate the affected observation; do not promote an earlier mockup or setup result into product evidence. Full-product completion requires all 24 criteria and separately authorized release actions.

## 15. Source register

S1 and S13 were checked on September 11, 2026 for this save. S2–S12 and workflow provenance W1/W2 are retained from earlier planning, not fresh compatibility or version checks; revalidate relevant current platform/tooling details at implementation bootstrap. References support platform mechanisms. Planned APIs, budgets, phases, and UX come from the approved product contract under the Accepted local ADRs, not claims of existing implementation. The GitHub HTML view of S13 was unavailable to the reader; its raw source was inspected successfully.

- S1 — Chrome DevTools: Format and style messages in the Console.
- S2 — W3C SVG 2: Conformance Criteria, secure animated image processing.
- S3 — Next.js: Server and Client Components, including library-author guidance.
- S4 — Next.js: instrumentation-client.js/ts convention.
- S5 — React: StrictMode reference.
- S6 — Playwright: ConsoleMessage reference.
- S7 — Node.js: Packages, entry points and exports.
- S8 — pnpm: Workspace documentation.
- S9 — npm: Trusted publishing and provenance prerequisites.
- S10 — WHATWG: Console standard.
- S11 — TypeScript: Declaration output.
- S12 — npm: package.json reference.
- S13 — [Chromium ConsoleFormat.ts](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/panels/console/ConsoleFormat.ts), inspected through the [raw source](https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/main/front_end/panels/console/ConsoleFormat.ts): `%s` substitution rescanning, literal `%%`, and ANSI handling. `main` is mutable; repeat the affected check against qualification-time sources/builds.
- W1 — stark AI Developer: Codex Spec Interviewer and deep specification template, read from the user's agent-skills repository.
- W2 — stark AI Developer: Architecture Compass guidance, read from the same repository.

```text
S1 https://developer.chrome.com/docs/devtools/console/format-style
S2 https://www.w3.org/TR/SVG2/conform.html
S3 https://nextjs.org/docs/app/getting-started/server-and-client-components
S4 https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
S5 https://react.dev/reference/react/StrictMode
S6 https://playwright.dev/docs/api/class-consolemessage
S7 https://nodejs.org/api/packages.html
S8 https://pnpm.io/workspaces
S9 https://docs.npmjs.com/trusted-publishers/
S10 https://console.spec.whatwg.org/
S11 https://www.typescriptlang.org/tsconfig/declaration.html
S12 https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
W1 https://github.com/stark-ai-de/agent-skills/blob/main/skills/codex-operations/codex-spec-interviewer/SKILL.md
W1-template https://github.com/stark-ai-de/agent-skills/blob/main/skills/codex-operations/codex-spec-interviewer/assets/spec-template.deep.md
W2 https://github.com/stark-ai-de/agent-skills/blob/main/skills/engineering-workflows/architecture-compass/SKILL.md
```
