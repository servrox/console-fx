# ADR-0003: Share one versioned scene model

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Scene schemas, effect metadata, presets, renderers, editor documents, or schema/API migrations change.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

Independent editor, preview, and export models would drift. Persisted documents also need stable meaning when preset defaults or package versions change.

## Decision

One normalized, typed, JSON-compatible scene schema and one internal effect metadata catalog serve the core, editor, preview, and exporter. The core owns validation and normalization. Editor controls derive parameter defaults, bounds, scopes, renderer support, and motion classification from the same metadata; they do not implement a competing compiler.

Documents contain an explicit schema version, readable label, ordered text runs, and bounded settings. They contain no functions, class instances, DOM nodes, or executable fields. Preset factories return ordinary data; selecting a preset materializes it into the document rather than persisting a live reference to mutable defaults. Schema versions evolve independently from npm versions.

Unknown future versions fail with a clear unsupported-version result and leave the current document intact. Do not guess migrations. A schema, public API, or export change identifies producers, consumers, supported old/new combinations, migration owner, compatibility direction, recovery, and any deprecation window before implementation. Add compatible readers or explicit translators before removing supported forms; test old and new fixtures before the removal gate. Destructive conversion needs separate authority and recoverability evidence.

Keep effect extensibility internal until a real external extension requirement justifies an accepted decision. The initial fixed composition order and supported effect combinations follow the specification and receive fixtures.

## Consequences

The same document feeds every output path and remains independent of changing presets. Schema evolution costs explicit compatibility work; a general plugin system is deferred.

## Validation

Test normalization without input mutation, JSON round trips, preservation of materialized presets, malformed/future versions, effect conflicts, and supported combinations. Migration proof names the old/new matrix and does not claim adoption by published or external consumers.

## Sources and lineage

- [Specification sections 3, 4, 7, and 13](../specs/console-fx-spec.md).
- Adapts AC-ADR-021 to scene documents and public package consumers; see [provider mapping](provider-mapping.md).
