# ADR-0017: Default new workbench examples to automatic SVG sizing

Status: Accepted
Date: 2026-09-13
Owner: ConsoleFX maintainer
Applies when: Creation defaults for workbench examples and conversion of existing work change.
Supersedes: ADR-0015 only for new workbench example sizing defaults, all other ADR-0015 rules remain binding.
Superseded by: ADR-0018 for the algorithm used by new examples only.
Approval: The maintainer explicitly approved ADR-0016/0017 on 2026-09-14 and instructed: "finish 1. and 2. now!" This accepts the linked workbench contract and authorizes its implementation and updated package publication.

## Context

The maintainer wants every example to start with responsive sizing enabled.
ADR-0015 intentionally separates content fitting from output-carrier sizing
and currently makes the experimental carrier opt-in. Merely scaling the
website preview would not meet the requested console-output default.

## Decision

- Every newly materialized catalogue example in the workbench starts as a
  Chromium SVG recipe with an explicit bounded `fit/v1` request and
  `container-experimental` sizing. Initial catalogue qualification must cover
  all entries; do not silently exempt a category or profile.
- Show **Automatic width · experimental in DevTools**. Retain complete
  native-text captions, experimental/unknown-readability diagnostics and an
  explicit fixed/text alternative. This is not a generic responsive-layout
  or arbitrary-width readability guarantee.
- Keep fitting width and carrier width separate. Simulated preview resizing
  never changes the recipe, export, history or storage. Changing the export
  frame is an explicit edit using the existing fitting controls.
- Imported recipes, raw-scene conversion, saved drafts and public compiler
  defaults retain their existing behavior. Converting existing work or
  removing incompatible sizing during a renderer change is explicit and
  undoable; saved recipes materialize all chosen options.
- Preserve pure compilation, single-call output, no guessed DevTools width,
  no listeners/relogging, no implicit font measurement, approved compact
  variants, readable fitting floors, bounded resources and explicit failure.

## Scope of succession

This record changes **only the app creation default** from opt-in to enabled
for newly opened catalogue examples. On acceptance (recorded 2026-09-14), add a reciprocal narrow
successor note to ADR-0015 and update the fitting specification's opt-in and
studio-default wording. Its technical contract remains authoritative.

It does not graduate experimental carrier sizing, change `SceneV1` or
`RenderRecipeV1`, alter core factory defaults, add live console resizing, enable
static-profile motion or replace an explicit saved preference with new policy.
The workbench catalogue structure is separately accepted in
[ADR-0016](0016-organize-discovery-around-an-example-catalogue.md).

## Alternatives considered

| Alternative | Assessment |
| --- | --- |
| Only make the page preview responsive | Does not implement the requested output default |
| Guess console width or redraw after resize | Violates pure compilation and exactly-one-emission boundaries |
| Automatically migrate all saved recipes | Changes valid work and exported meaning unexpectedly |
| Default new workbench examples to explicit experimental SVG options | Recommended, with truthful limits and preserved existing work |

## Validation

The catalogue matrix proves explicit defaults and no lost text for every entry.
Session tests prove saved-choice stability, conversion/Undo and resize
simulation that leaves exports unchanged. Real Chrome/Edge DevTools checks
cover newly selected default combinations and their caption/geometry behavior;
page screenshots do not establish that evidence. Impossible or unreadable
requests retain diagnostics and recoverable data.

See [workbench contract §4](../specs/workbench-contract.md#4-make-automatic-sizing-explicit)
and the [testing strategy](../specs/testing-strategy.md). This decision record
reports no new runtime support or qualification.

## Versioned algorithm successor

Accepted [ADR-0018](0018-add-versioned-floor-preserving-fitting.md) selects `fit/v2` for new examples after the all-example matrix exposed v1 limitations. All other defaults, import preservation and experimental-status requirements remain binding.
