# ADR-0016: Organize discovery around an example catalogue

Status: Proposed
Date: 2026-09-13
Owner: ConsoleFX maintainer
Applies when: Website page ownership, example discovery, category routing or editor capability resolution changes.
Supersedes: None
Superseded by: None
Approval: Pending review of this concrete record and its linked proposal. The maintainer requested design documents before product implementation; test cleanup is separately authorized.

## Context

The long landing combines marketing, overlapping galleries, editing and
integration guidance. Its three inventories contain 43 entries, including
variants of the same developer job. Separate category lists and ad hoc feature
flags would make new examples expensive to integrate and easy to misrepresent.

## Proposed decision

- Use six job categories: Brand & signatures; Debugging & diagnostics; Runtime
  & environment; Builds & releases; Guides & onboarding; Easter eggs &
  celebrations. Each example has one primary category and optional search/style
  tags; related recipes can share a discovery family.
- Give `/` a short cinematic introduction, `/studio/` persistent discovery and
  editing, and `/docs/` integration guidance and the usage video. Keep old
  entry links, shared scenes, drafts and undoable loads recoverable.
- Create one app-owned catalogue for hero, sidebar and picker. Resolve editor
  capabilities from the current validated recipe, public core descriptors,
  and shared editor policy. Each example exposes the derived feature set;
  categories confer no support.
- Keep availability, experimental status and explicit user choices distinct.
  Recompute controls after edits/imports; do not trust catalogue provenance as
  saved document meaning. Persist materialized existing render recipes.
- Keep the session and preview/export owners separate. Catalogue resolution is
  pure and silent; no new backend, plugin API, compiler or storage schema.

The concrete category map, small interface, navigation/error rules, cinematic
hero interaction and acceptance matrix are in the
[workbench proposal](../specs/workbench-proposal.md),
[catalogue](../specs/workbench-catalogue.md) and
[internal contract](../specs/workbench-contract.md).

The maintainer subsequently requested amicro. The
[selected source adaptations](../specs/workbench-interactions.md) cover app UI
feedback and transitions within the same ownership boundary. This selects a
source direction; it does not accept this still-Proposed architectural record.

## Alternatives considered

| Alternative | Assessment |
| --- | --- |
| Keep integrated landing and add more galleries | More duplication and scrolling; conflicts with requested page split |
| Minimal catalogue with category-inherited features | Simple discovery, but category moves can accidentally change capabilities |
| One workbench controller owning catalogue, history, routing and compilation | Convenient caller, excessive responsibility and harder isolated changes |
| App catalogue plus existing session/export owners | Recommended: centralized discovery/support policy with stable document boundaries |

## Consequences and existing intent

On acceptance, replace the integrated-landing requirement in base spec
§7.1/7.2 and AC-10, and the affected website narrative requirements. Retain
their usable editing, complete examples, truthful output, accessibility and
recovery obligations. A short landing still introduces every category.

ADR-0002/0003/0004/0005/0007 retain their compiler, model, package, validation
and persistence boundaries. ADR-0012/0014 keep cinematic/card profiles static.
Future motion support must follow those decisions' successor process.

Automatic creation defaults are a separate decision in
[Proposed ADR-0017](0017-default-new-workbench-examples-to-automatic-svg-sizing.md).
Accepting this record alone does not approve that default change.

## Validation

Follow WB-01 through WB-12 in the internal contract and
[ADR-0009](0009-validate-changed-contracts-with-proportional-evidence.md).
Catalogue contracts cover every entry; browsers cover representative navigation,
editing, reveal, clipboard, accessibility and recovery behavior. This record
contains no application, native, CI or deployment result.
