# ConsoleFX — implementation handover for servrox/console-fx

**Persistence status: saved.** This handover and the [approved implementation specification](console-fx-spec.md) record the approved review checkpoint and save-only revisions. That original save changed documentation only. Later authorized implementation is recorded in the [base evidence](console-fx-implementation-evidence.md) and [cinematic feature evidence](cinematic-metal-presets-evidence.md); this historical execution prompt does not replace the current task or its evidence. Commit, npm publication and studio deployment remain separately authorized actions.

Target repository: `servrox/console-fx`. Core package: `@servrox/console-fx`. Required React adapter: `@servrox/console-fx-react`. The product includes an integrated Next.js landing page/studio and tested Next.js recipes. MIT is approved; asset/dependency rights, npm access, hosting, and publication remain later gates. A separate `@servrox/console-fx-next` package remains deferred.

## Copy-ready execution prompt

```text
Implement the authorized ConsoleFX phase in /home/servrox/dev/console-fx using
docs/specs/console-fx-spec.md as the product contract and this handover as its
execution guide.

Read current AGENTS.md/overrides, the architecture index, relevant Accepted
ADRs, and the current visual direction before changing files. Verify Linux,
the nixos WSL distribution, a native Linux repository/worktree path, and
Nix-owned tools. Inspect current manifests, scripts, Git state, and concurrent
work. Preserve unrelated files and the Git index.

ADR-0001 through ADR-0010, ADR-0012 and ADR-0013 are Accepted. ADR-0012 governs
the separate cinematic extension; ADR-0013 supersedes ADR-0011. No additional
ADR is required for the approved specification. Report a conflict and the required maintainer decision
before implementing anything that would change Accepted intent. Do not rewrite
Accepted records or accept a new proposal implicitly.

Follow the authorized delivery phase only. If this prompt is invoked without
a narrower phase, start with Phase 0, record its feasibility evidence and
limitations, and stop at that phase boundary. Before each slice, record its
paths, baseline, owner, dependencies, acceptance evidence, stop conditions,
last reversible point, and recovery. Maintain a short implementation plan.

Build toward the required core library, integrated landing page/studio, thin
React adapter, and tested Next.js recipes under MIT. APIs and paths in the
spec are planned contracts, not proof that packages or an application exist.
At bootstrap, verify/pin compatible patched dependencies and the Node baseline,
resolve install trust and lint/format choices, and use pnpm/tsc ownership from
ADR-0008. Do not install duplicate global tools.

Phase 0 qualifies a badge, multistyle text, static SVG, and finite SVG motion
in actual Windows 11 Chrome AND Edge DevTools on recorded current-stable builds.
Record date, exact browser/Windows builds, candidate, renderer/options, theme,
zoom, console width, scenario, result, and artifacts. Missing DevTools access
leaves that observation pending; it is not a pass. Qualified static slices may
progress only within authorization. The full launch requires every effect and
motion listed below to qualify in both browsers.

When the core/studio phases are authorized, prioritize one complete path:
choose neon, edit text/color, inspect the compiler preview, copy one complete
console.log, and paste it into actual DevTools. Use public package APIs and
the same normalized model, metadata, compiler, and React preview throughout.

Implement the contracts and all 24 acceptance criteria in the spec as their
owning phases become authorized. Inspect real scripts before running them;
build/pack the candidate before consumer and production-studio checks. Use
proportional tests and report actual commands, results, evidence stage, and
missing gates. Review the final diff and preserve concurrent work.

At the end of the authorized phase, return changed contracts/files, governing
local ADRs, validation evidence and limitations, conflicts, recovery, remaining
launch/release gates, and the next unimplemented phase. Do not commit, publish,
deploy, configure accounts, or proceed to another phase without task authority.
```

## Contracts the execution prompt must preserve

1. **Complete deliverables and gallery.** Deliver the core, integrated hero/gallery/editor, required React adapter, and Next.js recipes. Required effects: **badge, neon, RGB split, extruded text, holographic, gold/chrome, CRT, and rainbow**, including gold and chrome variants. Required motions: **glow pulse, gradient drift, gentle wave, and a decorative moving indicator**. Each has an editable fixture and useful static alternative. All required treatments and advertised combinations must pass actual Windows 11 current-stable Chrome and Edge DevTools before the full product launches. Unqualified required treatments remain launch blockers.
2. **Pure compilation and one emission.** Imports, compilation, editing, and importing are silent. Explicit emission and each Test in console click call the sink once. Standalone output contains exactly one complete `console.log(...)` and needs no installed package. No clearing, global replacement, repeated logging, timers, network calls, or hidden DOM changes. Preview/editor rendering is the explicit UI exception.
3. **Typed public data contracts.** Use the shared versioned normalized scene, discriminated validation results, typed diagnostic errors, public deeply read-only built-in effect descriptors, and structured CSS/SVG/text compiler preview from spec section 4. Descriptors derive from the internal catalog; they expose no registration or rendering callbacks. Studio/adapters use public entrypoints, with no private imports, parsing of console arguments, or duplicated effect rendering.
4. **Safe text and serialization.** Chromium rescans raw `%s` substitutions. For its formatted text/caption arguments, encode each literal percent as `%%` exactly once; keep the scene/preview text literal and do not encode controlled templates, CSS styles, or image URLs. Plain text is one unformatted literal argument. Validate controls before rendering, normalize permitted newlines, reject ESC/ANSI, disallowed controls, and unpaired surrogates. Preserve literal specifiers and style argument order with section 5.1 regressions. Use XML escaping, allowlisted CSS, bounded internally generated SVG, and dedicated JavaScript string serialization. Never execute imported markup or generated source in the editor.
5. **Explicit rendering, motion, and bytes.** Default to unknown target, text renderer, reduced/static motion, and unsupported-error policy. Text rendering accepts any valid scene as a readable projection with diagnostics for omitted decoration. Rich rendering is explicit; requested unsupported features fail unless deterministic static text fallback was requested. Invalid/unsafe/oversized input never falls back to success. Compiler results describe the resolved renderer and preview. Argument payload size and complete exported source size use their separate UTF-8 byte definitions; code size includes both motion branches. Motion is finite decoration, at most five seconds. Unknown/reduced preference is static; the compiler never reads browser state.
6. **Honest preview and exporter.** CSS preview is labeled Approximate browser preview; SVG preview uses the exact compiler image URI through an image element with its caption as alternative text. Preview controls cannot change a printed entry. AST and isolated execution checks cover the single log expression, literal data, direct/export equality, and system/static preference cases. A source-model test, page screenshot, or console argument event is not actual DevTools appearance/motion proof.
7. **React first-enabled behavior.** The explicit hook emits the current scene only when its callback is invoked. ConsoleBanner defaults disabled and emits once in a client effect on the first committed enabled state for that mounted instance, using current scene/options. Initial disabled-to-enabled works; subsequent scene edits or false/true toggles do not emit again. Render/SSR is silent and Strict Mode effect replay does not duplicate emission. Real remounts are new instances. React is an unbundled peer and built client entrypoints retain use-client directives.
8. **Recoverable local documents.** Automatically resume valid local drafts before autosave starts. Validate incoming shares; confirm a different shared scene before replacing valid draft/current work. Equal scenes need no confirmation. Preserve valid work/history on invalid, future, oversized imports or storage failures. A successful active-session import is one undoable replacement; startup restoration sets the baseline. Reset requires confirmation, returns to blank/default, and clears session history; it does not delete stored drafts. Clear local draft removes only the owned key, preserves the current scene/history, is repeatable, and visibly reports deletion failure/retry. Prevent pending writes from restoring cleared data and resume autosave after reset/clear only on a later committed edit. No backend or sync; downloads/shared copies cannot be revoked by deletion.
9. **Accessibility and product scope.** Use the restrained dark/cyan visual direction and the integrated landing page/editor workflow. Apply ADR-0013's WCAG 2.2 AA target with automated and manual critical-journey checks, including keyboard/focus/reflow, reduced motion, clipboard errors, and draft recovery. Screen-reader/browser review remains nonblocking follow-up; missing observations do not block launch or publication. No accounts, analytics, remote fonts, raw uploads, or invented metrics/compatibility claims.
10. **Package and release evidence.** Use built ESM, declarations, explicit exports/files, and MIT metadata/license. Inspect and install both packed tarballs into isolated JS/TS/React/Next consumers; workspace imports are not distribution proof. Verify asset/dependency rights, npm access/names, publishing prerequisites, supported builds, exact release artifact/tag, and explicit authority before publication. Resolve host, CSP/runtime checks, target, and rollback before deployment. Partial static delivery does not satisfy the full launch gate.

## Validation and governance handoff

The spec contains **24 acceptance criteria, AC-01 through AC-24**. Their owning phase gates are in section 12. Planned script commands are in section 11.1; they are not currently available or claimed as run. Actual DevTools qualification and manual accessibility checks require their own recorded observations.

All Accepted local ADRs materially govern this handover:

| Decisions | Responsibility |
| --- | --- |
| ADR-0001 | Authority, conflict handling, and successor process |
| ADR-0002 / ADR-0003 / ADR-0004 | Single emission, shared model/catalog, package/public API boundaries |
| ADR-0005 / ADR-0006 | Validated serialization, rendering, fallback, and DevTools qualification |
| ADR-0007 / ADR-0013 | Local data recovery/deletion and accessibility |
| ADR-0008 / ADR-0009 / ADR-0010 | Toolchain ownership, evidence, reversible phases and release gates |

Consult the [ADR index](../adrs/README.md) and [specification's ADR mapping](console-fx-spec.md#13-architectural-decisions-and-adr-gate). **ADR required: no new ADR.** Read-only descriptor access leaves registration internal; formatter encoding implements the existing literal-text requirement; the complete launch gate permits separately qualified static phase work. No Accepted intent changes.

For this save, repository/source inspection and a bounded local formatter-loop reproduction were performed. The model reproduced raw substitution rescanning and ANSI interpretation; 17 encoded-percent cases preserved text, style order, and argument consumption. Saved-document validation checks whitespace/diff, links/anchors, all 24 IDs, spec/handover agreement, and protected state. See the [save evidence and pending gates](console-fx-spec.md#documentation-save-evidence).

Application/React/Next tests, actual DevTools qualification, accessibility, package validation/installation, and CI remain pending. Source/static, local, CI, publication/install, deployment, and external observations must stay distinct. Exact toolchain pins are a bootstrap gate; asset rights, npm access, hosting, and publication remain later gates. The MIT choice and existing ADR acceptance are settled.

Update README/status, visual notes, compatibility/security docs, integration recipes, and release instructions alongside their authorized implementation phase. This save changes only the two approved documents. Preserve the existing governance records, historical setup receipt, mockups, exploratory script, concurrent work, and index.
