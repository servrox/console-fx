---
title: "ConsoleFX — TypeScript framework and visual console configurator"
status: "initial specification; implementation pending"
created: "2026-09-10"
updated: "2026-09-11"
artifact_path: "docs/specs/console-fx-spec.md"
mode: "deep"
repository: "servrox/console-fx"
package_names: ["@servrox/console-fx", "@servrox/console-fx-react"]
npm_scope: "@servrox"
npm_publish_access: "unverified; confirm before release"
requested_scope: "persist the initial specification and implementation handover only"
---

# ConsoleFX
## Initial implementation specification

**Outcome:** a publishable TypeScript library for composing a styled console message, a Next.js visual configurator that exports a self-contained `console.log(...)`, and an optional React integration. The product name is ConsoleFX. This initial specification targets `servrox/console-fx` and the `@servrox` npm scope selected by the maintainer on September 11, 2026. This documentation change does not implement the framework, create a release workflow, deploy the studio, or publish an npm package.

**Recommended shape:** two npm packages, one Next.js application, and no separate Next.js runtime package initially.

| Deliverable | Name | Responsibility |
| --- | --- | --- |
| Framework | `@servrox/console-fx` | Typed scene model, validation, compilation, presets, standalone export |
| React adapter | `@servrox/console-fx-react` | Explicit event logging, opt-in mount banner, reusable preview |
| Visual configurator | `apps/studio` | Next.js application consuming the public package APIs |
| Next.js integration | Example and documentation | Client component integration and optional startup instrumentation |

The repository and package naming are selected, not placeholders. npm scope access and name availability have not been independently verified; check them before publication. Paths and commands describing implementation remain planned work. The repository was empty when inspected on September 11, 2026; this change adds only `docs/specs/console-fx-spec.md` and its adjacent `console-fx-handover.md`.

## 1. Requirements and boundaries

### 1.1 The core contract

A scene describes one message. Compilation produces zero console emissions. Explicit emission produces exactly one call to a console sink. A standalone export contains exactly one `console.log(...)` invocation and does not require the npm package at execution time.

“One message” can occupy several visual lines inside one console entry. It does not imply one physical line of JavaScript or one visual text line. DevTools may additionally display a pasted expression's return value; that is not a second library emission. The Console standard describes this distinction [S10].

Core compilation, emission, and exported snippets must not clear existing logs, replace global console methods, poll, create animation timers, fetch remote resources, or modify the application's DOM. Explicitly rendered preview/editor components are the intended UI exception; they must not make hidden console emissions. Editing the configurator must not automatically print messages. The studio's explicit **Test in console** button emits once for each user click.

Decorative animation describes precomputed motion. It is not live application state. A moving indicator must not be described as real deployment progress or a changing live metric.

### 1.2 In scope

The initial product includes typed and serializable scene configuration, static styled text, a bounded SVG graphics renderer, experimental declarative animation, plain-text fallback, presets, safe standalone code generation, import/export, npm packaging, framework integration examples, and a Next.js editor.

### 1.3 Non-goals

Do not build a terminal emulator, transport logger, observability platform, animation engine for general web pages, browser extension, or replacement for Pino/Winston. Do not add server-log forwarding to the browser, arbitrary JavaScript execution, arbitrary HTML/SVG/CSS upload, custom font fetching, cloud accounts, databases, paid services, or remote preset execution.

Do not promise arbitrary CSS support, identical typography across operating systems, automatic knowledge of the DevTools theme, or reliable detection of whether DevTools is open. Do not offer an update, pause, resume, or delete handle for an already emitted log entry. Those capabilities are outside the selected Console API contract [S10].

## 2. Evidence and feasibility gate

### 2.1 Verified platform foundations

Chrome documents `%c` styling, ANSI SGR styles, and `data:` URLs for CSS image references in console messages. It restricts URL-based console styling to data URLs [S1]. SVG's image processing model allows declarative animation without script execution or external references [S2].

These two facts support investigating animated SVG as a console background; they do **not** prove that every animation/filter behaves correctly in every DevTools version. The earlier chat demonstration is exploratory context, not a release qualification result.

Next.js supports client component boundaries and advises library authors to preserve `"use client"` on client entry points [S3]. Its `instrumentation-client.ts` convention provides a possible startup integration [S4]. React Strict Mode reruns render/effect work during development, so render-time logging and naive mount effects need explicit testing [S5].

### 2.2 Mandatory Phase 0 experiment

Before building the full editor, create a small internal fixture with one badge, a multi-style text line, a static SVG, and an animated SVG. Execute generated code in actual Chrome DevTools and Edge DevTools. Record exact browser/build, operating system, theme, zoom, console width, test case, outcome, and evidence path.

Observe text clipping, escaping, background visibility, SVG filter bounds, motion start and stop, logging before DevTools opens, closing/reopening DevTools, offscreen entries, repeated identical snippets, narrow consoles, and copied text.

A normal browser `<img>` screenshot is useful rendering evidence but is not DevTools UI evidence. Playwright console events can validate emitted arguments and counts [S6]; they do not by themselves establish that the DevTools frontend painted or animated the entry correctly.

**Gate result:** ship CSS/plain-text functionality independently. Keep `svgAnimated` experimental until real DevTools evidence exists. If static SVG succeeds but animation fails, retain static SVG export and disable unsupported animation controls for that profile. Do not replace failed single-entry animation with clear-and-redraw loops.

No browser rendering or runtime tests were performed for this planning deliverable.

## 3. Product architecture

### 3.0 Repository baseline

Target repository: `servrox/console-fx` (public), default branch: `main`. At the initial inspection on September 11, 2026, GitHub reported the repository as empty. There were no existing source files, `AGENTS.md`, README, package scripts, license file, CI workflows, spec directory, or ADR convention to preserve. Recheck the repository before implementation because later work may introduce these. This initial documentation-only addition does not choose a license or authorize package publication.

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

Proposed explicit subpath exports:

| Import | Public contents |
| --- | --- |
| `@servrox/console-fx` | Scene types, `defineScene`, `parseScene`, diagnostic types |
| `@servrox/console-fx/browser` | `compileConsole`, optional browser emission helper |
| `@servrox/console-fx/presets` | Individually exported preset factories |
| `@servrox/console-fx/codegen` | Standalone exporter and source serializers |

The root import must not import React, Next.js, editor components, or code generation. Browser code must not import Node built-ins. Preset factories must not register themselves globally. Subpath exports provide explicit package entry points [S7]; tests must verify the actual published export map.

A static ANSI compiler is a follow-on option, not a prerequisite. Chrome already supports ANSI styles [S1], but full ANSI parsing and cursor manipulation are separate work. Never interpret arbitrary incoming terminal control sequences as part of this initial release.

### 3.3 Proposed monorepo

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

Use pnpm workspaces [S8], strict TypeScript, a Next.js App Router studio, and React. Use `tsc` for initial ESM library output and declarations, avoiding a package bundler unless measured distribution needs justify one. Use Vitest for library tests and Playwright for studio interaction tests. Select and pin compatible, patched versions when the implementation repository is initialized. Proposed tooling baseline: Node 24; smoke-test Bun consumption separately. No Turborepo, backend service, database, or generic plugin platform is required initially.

## 4. Public API proposal

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

export interface Diagnostic {
  readonly code: string;
  readonly severity: "info" | "warning" | "error";
  readonly path: readonly (string | number)[];
  readonly message: string;
}

export interface CompiledConsole {
  readonly args: ConsoleArgs;
  readonly renderer: "css" | "svg" | "text";
  readonly text: string;
  readonly animated: boolean;
  readonly byteLength: number;
  readonly diagnostics: readonly Diagnostic[];
}
```

`defineScene` validates trusted developer input and throws a typed validation error for invalid configuration. `parseScene(unknown)` returns a discriminated success/failure result for JSON and other untrusted data. `compileConsole` rejects structurally invalid scenes; unsupported capabilities follow an explicit `unsupported: "error" | "fallback"` policy. Default to `error` for an explicitly requested unsupported renderer; permit deterministic fallback when requested.

Return diagnostics as values. Never add hidden `console.warn` or `console.error` emissions. Unexpected internal failures must not be silently reported as successful compilation.

### 4.3 Stable scene and effect contracts

`SceneV1` contains a schema version, readable label, optional surface, ordered lines, styled text runs, and bounded motion settings. Configuration is JSON-compatible: no functions, class instances, DOM nodes, symbols, or executable strings.

An effect is a discriminated union with typed parameters. Its manifest supplies display name, parameter metadata, defaults, limits, supported scope, supported renderer profiles, and motion classification. Both validation and editor controls use this metadata. Keep this catalog internal until a real external extension use case exists.

Use a fixed application order for composable families: background, fill, outline, extrusion/shadow, glow, then motion. Reject conflicting effects within a mutually exclusive family rather than relying on accidental array order. The first release need not support arbitrary effect combinations; each supported combination must have a fixture.

### 4.4 Presets

Preset factories return ordinary scene data. Editing a preset materializes that data into the document. Saved documents therefore retain their appearance when a future library release changes preset defaults. JSON schema versioning is independent of npm versioning.

Initial gallery candidates are badge, neon, RGB split, extruded text, holographic panel, gold/chrome-style fill, CRT, and rainbow text. Motion candidates are glow pulse, gradient drift, gentle wave, and moving border/indicator. Ship only the combinations qualified by the compatibility gate; other candidates remain visible as development backlog, not supported features.

## 5. Renderers and compatibility policy

### 5.1 Native CSS text

Build the format string from library-controlled `%c` and `%s` tokens. Pass user text separately as substitution arguments. Add an explicit final style reset. Never concatenate untrusted text into the format template.

Maintain a conservative internal property/value allowlist, limited to the properties actually used by qualified presets. Do not accept arbitrary CSS strings in initial public APIs. Test literal `%c`, `%s`, `%o`, percent signs, emoji, combining marks, quotes, newlines, and empty runs. The full generated sequence must preserve user text without consuming another run's styling arguments.

CSS output remains native text. Browser-dependent text layout, font fallback, zoom, and wrapping must be documented. There is no arbitrary CSS keyframe animation mode on this renderer.

### 5.2 SVG image output

Generate SVG exclusively from validated scene data and internal templates. Serialize UTF-8 safely into a data URL without requiring Node's `Buffer` in browser bundles. Keep paint-server and filter identifiers stable for the same scene/options.

Use a `%c` background-image carrier with bounded dimensions. Include a visible plain-text caption, reset-styled and supplied through `%s`, in the same log call. The image's lettering itself is not selectable; the caption provides readable and searchable content.

Declarative animation must have a bounded total duration and a useful static frame. Proposed initial default and maximum: 5 seconds. Longer or infinite animation is deferred. Static output is the safe default when motion preference is reduced or unknown.

System fonts are permitted; external font requests and font embedding are not initial features. For per-letter motion, preserve grapheme boundaries. When segmentation is unavailable or separate glyph placement would break text shaping, keep the affected run intact and return an approximation diagnostic.

Allow only internal fragment references such as `url(#gradient-id)`. No scripts, event-handler attributes, `foreignObject`, external URLs, nested external assets, or user-authored SVG markup. Protect dimensions, filters, blur ranges, text length, and element counts against excessive rendering cost.

### 5.3 Motion preferences and repeated output

The pure compiler receives `motion: "allow" | "reduce"`; it never reads browser state itself. Browser and React helpers resolve a system preference explicitly at emission time. Unknown preference selects static output.

A standalone animated export should contain precompiled static and animated argument arrays and select one at execution time using `matchMedia`, still within a single `console.log(...)`. This selection adds no timers, imports, or writes. It cannot retroactively change a previously emitted entry when the operating-system preference changes.

Repeated identical image URLs may have browser-specific animation lifecycle behavior. Record this in Phase 0. A future explicit `instanceId` option may generate a distinct image identity when needed; it must be an input to compilation, not hidden randomness. Do not promise independent restarts without observing that behavior in DevTools.

### 5.4 Compatibility matrix

| Profile | Initial contract |
| --- | --- |
| Chrome DevTools | CSS and static SVG qualification target; animation experimental until observed |
| Edge DevTools | Separately qualified; do not infer success only from Chromium ancestry |
| Firefox DevTools | Plain text guaranteed by project tests; CSS subset qualified independently |
| Safari Web Inspector | Plain text first; richer support only after an actual Safari test |
| Node/Bun | Import/compile safety and plain text; do not emit browser SVG styles to a terminal automatically |
| SSR / server components | Pure compilation permitted; no automatic browser emission |

“Guaranteed” here is a proposed project support contract conditional on passing tests, not a test result from this document.

Do not choose capabilities solely from user-agent sniffing or `CSS.supports()`. Page CSS support is not the same as DevTools style handling. Default an unknown target to plain text. A developer can explicitly choose the documented Chromium profile.

## 6. Standalone export

### 6.1 Primary output

The main action is **Copy console.log**. For a static scene the output is a single JavaScript expression statement with literal arguments:

```js
console.log("%c%s%c", "color:#22d3ee;font-weight:900", "starkAI", "");
```

For SVG, the literal style contains the generated data URL. There must be no `...` placeholders in exported source, no imports, CDN scripts, helper declaration, top-level await, IIFE, or required library installation.

For motion-aware export, a single log statement may spread a conditional choice between precompiled argument arrays. Count console emissions, not every function call: a read-only media-preference check is permitted.

Proposed exporter API:

```ts
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const exported = exportConsoleLog(scene, {
  target: "chromium",
  renderer: "svg",
  motion: "system",
});

// exported.code is complete standalone JavaScript.
// exported.byteLength includes any static/animated alternatives.
// exported.diagnostics is data, not extra console output.
```

The exporter accepts `motion: "system" | "reduce"`. `system` builds a guarded runtime choice only when the scene has qualified motion; `reduce` exports static arguments alone. Its return value contains `code`, `byteLength`, and `diagnostics`. The pure compiler's separate `motion: "allow" | "reduce"` option represents an already-resolved policy.

### 6.2 Source generation safety

Use a dedicated JavaScript string serializer, including quotes, backslashes, control characters, `<`, and Unicode line separators. Never interpolate raw text into a template literal or executable expression. Avoid execution of exported code in the editor: the test button sends already compiled arguments directly to `console.log`.

Test generated source with a parser. Assert exactly one `console.log` call, no unexpected executable nodes, and no imports, writes, timers, network APIs, or dynamic code evaluation. Execute the source in an isolated test harness with a recording console and both media-preference outcomes. Assert equality with direct compilation and preservation of malicious-looking input as text.

### 6.3 Export variants

Provide standalone JavaScript, TypeScript package usage, React component/hook usage, Next.js startup/client-component recipes, and versioned JSON. JSON export is the durable editable format. A compiled snippet is a frozen output, not the editable source of truth.

Display snippet byte size and renderer support status before copying. The byte count must include both branches of a motion-aware export.

## 7. Next.js visual configurator

### 7.1 Main user journey

Choose a preset or blank message; edit text and styling; choose a target renderer; inspect the preview and diagnostics; test one entry in the real console; copy the self-contained log statement or export another integration format.

### 7.2 Screen layout

Use a desktop three-area editor with a stacked narrow-screen arrangement. The left area contains presets, lines, and run selection. The center contains the bounded preview and preview background selection. The right area contains typography, color, effects, dimensions, and motion controls. An export panel below shows the current code, byte size, compatibility status, and primary copy action.

Primary actions: **Copy console.log**, **Test in console**, and **Export JSON**. Secondary actions include import, undo/redo, reset, and copy a shareable configuration link when it fits the size budget.

Do not auto-scroll or focus DevTools, clear logs, print on each keystroke, or show notifications by printing extra console messages. Report editor errors in the UI.

### 7.3 Preview honesty

Label CSS preview **Approximate browser preview**. Render it from the same compiled style/text segments but do not imply that ordinary page layout perfectly reproduces DevTools.

For SVG, render the compiler's exact generated image URI through an `<img>`, with a meaningful text alternative. Do not insert imported SVG with `dangerouslySetInnerHTML`. The SVG preview is still not proof of DevTools compatibility.

Provide **Play**, **Replay**, and **Show static** actions for the editor preview. Show static replaces the preview with a static rendering; do not advertise exact timeline pause/resume unless implemented and tested. Changing the preview does not change an entry already printed to the console.

### 7.4 State and storage

Store normalized scene data separately from transient selection, open panels, preview background, and export tab state. Use a reducer with bounded undo/redo history. Do not add a global-state dependency unless component complexity actually warrants it.

Keep drafts in local storage with guarded reads/writes and recovery from corrupt or unavailable storage. File import validates before replacing the current document. Future schema versions must produce a clear unsupported-version error; do not guess at migrations.

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

`useConsoleScene` must not emit during render or hook initialization. It returns an explicit callback. `ConsoleBanner` is the opt-in automatic alternative: one emission per mounted component instance, after client mount. It must not print on the server or when disabled. React's development effect replay must not duplicate that mount emission [S5].

A genuine unmount/remount is a new instance and may emit again. Fast Refresh, page reloads, and multiple component instances are not an “exactly once forever” guarantee. Do not add hidden global registries or session storage merely to hide these distinctions. A once-per-application registry can be a later explicit feature if requested.

Keep `react` as a peer dependency and do not bundle React. Add and preserve `"use client"` on the adapter's client entry points. The package must be safe to import in a Next.js application without render-time browser-global access [S3]. Use the studio to exercise the same preview and emission adapter consumers receive.

### 8.2 Next.js package: defer

A separate package is not justified merely to re-export the React adapter. Support Next.js through a tested App Router example, root-layout banner guidance, and an optional `instrumentation-client.ts` recipe [S4]. Browser and server output must be explicit; importing browser tooling into server instrumentation must not silently print SVG carrier strings into terminal logs.

Prefer a precompiled/static banner in early startup paths. Document actual behavior when DevTools opens after startup. The existence of instrumentation hooks does not imply that animation timing is controlled by Next.js.

Reconsider `@servrox/console-fx-next` only for a real Next-specific feature, such as build-time precompilation/injection or a tested integration requiring Next APIs. Do not introduce a config wrapper or instrumentation plugin just for branding.

## 9. Safety, accessibility, and resource budgets

The following are initial engineering limits, not measured platform limits or performance claims:

| Resource | Proposed initial bound |
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

Reject nonfinite numbers, invalid enums/colors, out-of-range parameters, and dangerous property names during untrusted import. Walk only schema-owned fields and avoid merging arbitrary objects into prototypes. Cap work before generating large strings or node arrays.

Prevent rapid flashes in shipped motion presets. Respect reduced-motion preference in the app, helpers, and motion-aware exporter. Use proper labels, keyboard controls, visible focus, and readable diagnostics in the editor. Console decoration is not the sole delivery channel for important application information.

Initial size goals: a simple CSS preset consumer at most 10 KiB gzip and an SVG-capable consumer at most 25 KiB gzip, excluding React/Next. These are proposed bundled-consumer budgets, not existing results. Measure per consumer entry; unused codegen, presets, and React modules must not appear in a basic core consumer.

## 10. npm publication plan

### 10.1 Package contents

Publish compiled ESM JavaScript, TypeScript declarations, source/declaration maps where useful, README, changelog, and the chosen license. Use an explicit `exports` map and `files` allowlist. Set `sideEffects: false` only while package import remains side-effect-free. The monorepo root and studio must be `private: true`.

Use TypeScript declaration output [S11]. Node documents package entry-point/export mapping [S7], and npm documents packaged files, dependencies, peer dependencies, and publication metadata [S12]. Do not bundle React/Next or ship editor assets in the core package. Avoid install/postinstall scripts.

Recommend ESM-only initially, with a documented support policy. Add CommonJS output only if a concrete consumer requires it. Test plain JavaScript consumption as well as TypeScript; npm users must not need a TS compiler to execute the package.

Propose MIT licensing, subject to maintainer approval and asset/dependency checks. The maintainer selected the public repository `servrox/console-fx` and package names `@servrox/console-fx` and `@servrox/console-fx-react`. Verification of npm scope access, package-name availability, and license choice remain release blockers, not reasons to block architectural planning.

### 10.2 Release pipeline

Use Changesets for coordinated version/changelog changes. On a release candidate: install the locked toolchain, validate, build, create package tarballs, inspect their contents, and install those tarballs into isolated vanilla/React/Next consumer fixtures. Do not treat workspace import success as package-distribution proof.

Use GitHub-hosted Actions with npm trusted publishing through OIDC rather than a long-lived write token. Configure the authorized repository/workflow per package. npm documents automatic provenance for eligible public-package publications from public repositories through supported OIDC providers [S9]. Confirm first-publication/bootstrap prerequisites before enabling unattended release jobs.

Separate release readiness from publication authority. Initial preview releases use a non-default prerelease tag; stable promotion follows compatibility and package checks. Actual publishing, npm scope/account configuration, and deployment require a subsequent explicit task. The target repository already exists; do not create a replacement repository.

### 10.3 Recovery

Do not depend on unpublishing a version as the normal recovery path. Publish a corrective patch or move the default distribution tag to the previous known-good version where appropriate. For visual regressions, remove or downgrade a capability/preset in the next release and preserve readable fallback. Retain JSON schema migrations when configuration formats change.

## 11. Validation and acceptance

### 11.1 Proposed scripts

These commands are requirements for the future repository; they do not exist yet and were not run here.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:codegen
pnpm test:consumers
pnpm test:studio
pnpm build
pnpm check:packages
pnpm check:bundle-size
```

`check:packages` must inspect both tarballs, export resolution, declaration resolution, peer dependencies, packaged files, and preservation of client directives. `test:consumers` must install the tarballs rather than rely on workspace path aliases.

### 11.2 Acceptance matrix

| ID | Requirement | Evidence |
| --- | --- | --- |
| AC-01 | Importing any public entry creates no logs, timers, network requests, or page changes | Isolated import tests |
| AC-02 | Fixed scene and options compile to identical output without mutating input | Unit and frozen-input tests |
| AC-03 | An explicit emission produces exactly one call; compilation produces none | Recording console sink |
| AC-04 | Exported JavaScript has one console.log and matches direct output | AST and isolated execution tests |
| AC-05 | Quotes, percent specifiers, Unicode, and malicious-looking strings remain data | Adversarial corpus; real-browser samples |
| AC-06 | SVG contains no forbidden tags, attributes, or external references | Parsed-SVG structural tests |
| AC-07 | Reduced or unknown motion preference chooses static output | Both exporter branches and adapter tests |
| AC-08 | Animation ends within the configured bound and freezes usefully | Actual DevTools observation |
| AC-09 | Unsupported profiles do not silently claim equivalent fancy output | Diagnostic/fallback tests |
| AC-10 | Studio edits print nothing; each test click prints once | Production-build browser tests |
| AC-11 | JSON import/export preserves documents; corrupt/future schemas fail safely | Round-trip and migration fixtures |
| AC-12 | React render/SSR is silent; Strict Mode does not duplicate a mount banner | React and Next consumer tests |
| AC-13 | Real remount/reload behavior matches documentation | Integration scenarios |
| AC-14 | Core consumers do not include React, Next, or codegen accidentally | Bundle inspection |
| AC-15 | npm tarballs work in isolated JS, TS, React, and Next consumers | Package-consumer CI |
| AC-16 | Supported presets render in named DevTools versions without unacceptable clipping | Versioned manual evidence matrix |
| AC-17 | Resource limits reject excessive payloads before costly generation | Boundary and fuzz tests |
| AC-18 | Keyboard controls, static preview, clipboard failure, and unavailable storage work | Studio accessibility and failure tests |

Screenshots, snapshots, arguments, runtime behavior, and published artifacts are separate evidence stages. A successful Next build or Playwright console event must not be reported as DevTools animation proof or npm publication success.

## 12. Delivery phases

| Phase | Deliverable | Exit gate |
| --- | --- | --- |
| 0 — Feasibility | Real-console CSS/SVG/motion fixtures and compatibility record | Keep only supported claims; classify animation |
| 1 — Core vertical slice | Scene model, CSS/text compiler, one preset, one standalone export | AC-01 through AC-05; plain JS consumer |
| 2 — Visual studio | Next editor for that same preset, local draft, preview, copy, test | Same compiler used end-to-end; AC-10/11/18 |
| 3 — SVG and effects | Qualified static SVG, bounded motion, effect manifests, gallery | AC-06 through AC-09/16/17 |
| 4 — Integrations | Thin React package; React and Next examples | AC-12 through AC-14 |
| 5 — Release readiness | Tarball checks, documentation, versioning and OIDC workflow | AC-15 plus recorded release checklist |

Prioritize a complete first path: **choose neon → edit text/color → inspect preview → copy one console.log → paste into real DevTools**. Do not build every effect before proving this path.

## 13. Architectural decisions proposed for implementation

These are proposed decisions for `servrox/console-fx`, not accepted ADRs. The maintainer authorized persistence of the initial spec and confirmed repository/package naming; this does not claim separate acceptance of binding architecture records. No existing ADRs or numbering convention were present in the empty repository.

| Proposed decision | Rationale | Revisit trigger |
| --- | --- | --- |
| Pure scene compiler with explicit emission | Reproducible export, testability, no hidden side effects | A genuine streaming/logger requirement |
| One schema shared by studio and library | Avoid preview/export drift | Separate document products emerge |
| CSS text and isolated SVG image renderers | Different capabilities and fidelity need explicit boundaries | New qualified rendering mechanism |
| Single-emission contract; no console clearing | Preserve developer logs and predictable output | Separate explicitly requested terminal/live mode |
| Two packages; Next.js supported through recipes | Useful React behavior without redundant Next dependency | Real build-time or framework-specific integration |
| Client-only editor data; no backend | Meets current persistence/sharing requirements | Accounts or server-saved projects are requested |
| ESM package and tarball consumer tests | Keep initial distribution narrow and verifiable | A concrete CommonJS consumer |

When implementation is authorized, review these decisions before depending on them and record durable accepted decisions under `docs/adrs/NNNN-kebab-title.md`, one decision per record, unless a repository convention has since been established. No separate ADR files or ADR index are added by this initial spec-only change. Do not copy governance identifiers or unrelated architecture from the skills repository into this product.

## 14. Open items and status

Confirmed on September 11, 2026: use `servrox/console-fx` and publish under the `@servrox` scope, with core package `@servrox/console-fx` and React adapter `@servrox/console-fx-react`. A dedicated `@servrox/console-fx-next` package remains deferred. Persistence of the initial spec was explicitly requested.

Planning assumptions retained from the draft: npm packages are intended to be public; the editor needs no accounts or backend; React support follows the core rather than replacing it; rich rendering is Chrome-first.

Must resolve before stable release: npm publish permissions and package-name availability, license, exact supported browser versions, animation qualification, exact dependency/toolchain versions, and explicit release authority. Repository identity and package naming are no longer open questions.

The source challenge changed the plan in three ways: SVG animation is an evidence-gated feature rather than a blanket browser promise; the primary product uses single emission rather than clear-and-redraw; Next.js support does not require a separate npm package.

Artifact destination: `docs/specs/console-fx-spec.md` in `servrox/console-fx`, with companion implementation prompt at `docs/specs/console-fx-handover.md`. This is the initial documentation baseline. Binding ADR approval: not performed. Implementation, application/runtime tests, CI execution, deployment, npm registration, and publication: not performed by this documentation change.

## 15. Source register

Source register retained from the planning draft dated September 10, 2026. External platform sources were not revalidated during this repository-persistence task. References support platform facts; package boundaries, budgets, API names, phases, and UX are design proposals. Repository baseline and maintainer naming selections were checked separately on September 11, 2026.

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
