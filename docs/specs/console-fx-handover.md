# ConsoleFX — implementation handover for servrox/console-fx

Target repository: `servrox/console-fx`. Core package: `@servrox/console-fx`. React adapter: `@servrox/console-fx-react`. The maintainer selected these names and requested persistence of the initial spec on September 11, 2026.

This prompt is for a subsequent implementation task. Adding this handover does not itself authorize implementation, deployment, or npm publication. A separate `@servrox/console-fx-next` package remains deferred until justified by a real Next.js-specific feature.

## Copy-ready task

Work in `servrox/console-fx`. Read `docs/specs/console-fx-spec.md`. Treat its APIs and implementation paths as planned product contracts, not existing code. The repository was empty before the initial planning documents were added; inspect its current state rather than assuming it is still empty.

Goal: build a publishable TypeScript console-effects library and a Next.js visual configurator. The configurator must export complete JavaScript that performs exactly one `console.log(...)` and requires no package installation at execution time. Include a thin React adapter after the core works; document Next.js integration without creating a redundant Next.js package.

Before implementation, inspect the repository's instructions, package manager, existing architecture decisions, licensing, and scripts. Review the architectural proposals in section 13 before relying on them and record accepted durable decisions using the repository's convention. Reconcile the spec with applicable accepted decisions. Use `@servrox/console-fx` and `@servrox/console-fx-react` consistently in package manifests, exports, documentation, examples, and release configuration. Verify npm access and name availability before publication; do not silently rename the packages or claim this planning document grants publication authority.

Start with Phase 0: qualify a badge, multistyle text, static SVG, and bounded declarative SVG animation inside actual Chrome/Edge DevTools. Record exact versions and outcomes. Browser page screenshots and Playwright console argument events are not sufficient evidence that DevTools rendered an animated image. When DevTools testing is unavailable, mark animation experimental and continue the CSS/plain-text slice without claiming it was verified.

Then implement one end-to-end vertical slice: select a neon preset, edit text/color, preview it, copy a standalone console.log, and test it in the actual console. Follow the remaining phases in the specification only within the implementation task's authorized scope.

Maintain these invariants:

1. Pure scene compilation: no logging, globals accessed at import time, timers, network calls, or page changes. Explicit emission alone calls a console sink once.
2. Shared typed/versioned scene schema and effect metadata for library, editor, preview, and exporter. Do not duplicate rendering logic in the editor.
3. Controlled CSS text rendering, internally generated SVG image rendering, and explicit readable fallback. Never clear existing logs or fake animation through repeated logging.
4. User text remains data. Use controlled format strings, XML escaping, strict value validation, and JavaScript string serialization. No raw SVG/HTML/CSS/JS execution from imported documents.
5. SVG has no scripts, foreignObject, event attributes, or external resources. Use bounded filters, dimensions, text length, elements, and motion.
6. Generated source is complete and inspectable. AST and execution tests prove one console.log, matching arguments, no additional side effects, and static output for reduced/unknown motion preference.
7. React is a peer dependency. No render-time or server-side emission. Test Strict Mode mount replay, real remounts, and preservation of use-client directives in published output.
8. Studio editing is silent; each Test in console click emits once. Preview support and actual DevTools support are labeled separately. No backend, accounts, analytics, or remote font fetching.
9. npm packages include built JS and declarations with explicit exports. Test the packed tarballs in isolated JS/TS/React/Next consumers, not only workspace imports.
10. No external writes, package publishing, deployment, or paid service setup without a separately authorized action and exact target.

Create repository scripts corresponding to the validation plan. Report commands actually run, evidence actually observed, and any skipped tests. Do not describe a successful build as browser-animation proof or a tarball check as npm publication.

At completion of each authorized phase, summarize implemented contracts, changed paths, validation results, remaining limitations, and the next unimplemented phase. Preserve readable static functionality when experimental effects fail qualification.
