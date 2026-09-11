# ADR-0002: Compile purely and emit exactly once

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Public imports, scene compilation, browser/React emission, or standalone code export.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The product designs one expressive console entry and exports it without a runtime package dependency. Hidden logging or repeated redraw would violate its central contract and disrupt existing developer logs.

## Decision

Public imports and compilation are side-effect-free. Fixed scene data and explicit options produce deterministic arguments and diagnostics without mutating the input. The compiler does not read browser state or log. Diagnostics are returned values, including errors; they never cause hidden warnings or error emissions.

An explicit emission invokes its console sink exactly once. Complete standalone output contains exactly one `console.log(...)` call and needs no imports or package installation. System-motion selection may choose between precompiled argument arrays before that single call. DevTools displaying an expression's return value is outside the library's emission count.

Do not clear or replace console methods, repeatedly log animation frames, start animation timers, poll, fetch, or alter the page. Explicit preview/editor rendering is the UI exception and stays silent. Every studio **Test in console** click emits once; editing and importing emit nothing.

React rendering and SSR stay silent. An explicit hook callback emits only when called. An enabled mount banner emits once per mounted client component instance, including development effect replay; a real unmount/remount creates a new instance. Do not conceal remounts with a global registry. This is not a once-per-application or once-forever guarantee.

## Consequences

Compilation and generated code can share deterministic fixtures. Live progress, updating an existing log, and clear/redraw animation require a separately approved product contract.

## Validation

Use isolated import tests, frozen-input compilation tests, a recording sink, and generated-source AST plus isolated execution checks. Verify both motion branches and React render/SSR, effect replay, disabled state, genuine remounts, and multiple instances. These tests prove call behavior, not actual DevTools rendering.

## Sources and lineage

- Repository-specific decision from [specification sections 1, 4, 6, and 8](../specs/console-fx-spec.md) and the [handover invariants](../specs/console-fx-handover.md).
- Related decisions: [ADR-0004](0004-separate-core-react-adapter-and-studio.md), [ADR-0005](0005-generate-output-from-validated-data.md), and [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md).
