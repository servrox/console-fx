# ConsoleFX repository instructions

Read the [architecture index](docs/adrs/README.md) before architecture-affecting work. Load only the decisions relevant to the task and follow their recorded status and successors. Applicable `Accepted` ADRs are binding; `Proposed` records are pending choices and do not authorize implementation.

Read the [implementation specification](docs/specs/console-fx-spec.md) for product requirements and planned APIs. The [visual direction](docs/mockups/README.md) supplements it. Mockups, planned paths, example metrics, and the exploratory console script are not evidence of an implemented or released package.

Before changing a durable boundary, identify the affected local ADRs. Report conflicts with accepted decisions before changing the affected implementation; name the conflict, impact, and required maintainer decision. Change accepted intent through an approved successor instead of rewriting its history. Do not mark a proposed ADR accepted without recorded maintainer approval.

Use the [provider mapping](docs/adrs/provider-mapping.md) for provenance and deferred decisions, not as a second source of binding policy. Report the local ADR IDs that materially governed completed work.

Inspect current package manifests and scripts before running validation. At setup there are no package scripts or CI workflows; commands in the specification describe future work. Record governance checks in the [setup receipt](docs/adrs/setup-receipt.md); place later implementation evidence alongside the governing spec or in its explicitly chosen evidence path. Keep source/static, local, CI, package installation, deployment, and external observations distinct.

Preserve unrelated work and the Git index. A specification, ADR, or successful check does not grant permission to implement another phase, commit, publish packages, deploy, or change external systems. Follow the active task's scope and the inherited environment contract.
