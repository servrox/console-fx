# Architecture Compass provider mapping

This is a non-normative setup record. Local ADR content and its status control architecture; a provider's own Accepted status does not accept its adaptation in ConsoleFX. The maintainer explicitly approved ADR-0001 through ADR-0011 as written on 2026-09-11. All 13 selected adaptations below are active through those Accepted local decisions.

Coverage: `setup/recommended`. Source: installed architecture-compass version 0.6.8, `references/adr-catalog.md`, inspected 2026-09-11. Catalog SHA-256: `71f200a769602add8f3c9e4e2697da94cde9cca8105ef3ef3e824a5013b1094e`.

The current catalog contains **39 Accepted, adoptable target-repository decisions**. Every eligible entry is triaged exactly once: **13 adapt, 26 defer, 0 adopt, 0 reject; 13 + 26 = 39**. Selected Long decisions were read and adapted to target evidence. This recommended triage does not claim complete adoption or a full technical audit of deferred providers. The repository is an early product with substantial architecture evidence, so the evidence-empty seven-decision foundation was not applied mechanically.

## Adoption matrix

| Provider | Disposition | Local mapping | Target evidence and adaptation | Status or deferred owner/trigger |
| --- | --- | --- | --- | --- |
| AC-ADR-005 | adapt | [ADR-0001](0001-use-repository-native-adr-governance.md) | Spec §13 names single-file local ADRs; none were accepted at the setup baseline. Local index, statuses, conflict stops, and reciprocal successors; no provider triplets. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-006 | adapt | [ADR-0004](0004-separate-core-react-adapter-and-studio.md) | Spec §3 defines two public packages and one studio. Ownership follows core, React adapter, studio, and consumers; no speculative folders. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-007 | adapt | [ADR-0004](0004-separate-core-react-adapter-and-studio.md) | Spec §§3, 8, 10 require public subpaths and framework isolation. Browser-safe/core and client-adapter entrypoints; no trusted-server tree is introduced. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-008 | adapt | [ADR-0007](0007-keep-studio-documents-local.md) | Spec §7 requires a Next.js shell with browser-owned editing. Thin routes and narrow client state/storage boundaries; no data-fetch/cache/controller scaffolding. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-009 | defer | — | No remote/trusted reads or freshness requirement; documents stay browser-local. | ConsoleFX maintainer: Before introducing remote reads, client caching, or realtime freshness. |
| AC-ADR-010 | defer | — | No trusted server writes, webhooks, or command API; local import safety is covered by ADR-0005/0007. | ConsoleFX maintainer: Before introducing server-side writes or an authenticated command surface. |
| AC-ADR-011 | defer | — | No worker, backend process, service registry, or DI lifecycle. | ConsoleFX maintainer: Before introducing a long-running backend/service. |
| AC-ADR-012 | defer | — | No runtime/environment configuration exists; no configuration framework is needed for this setup. | ConsoleFX maintainer: Before the first deployable environment/configuration boundary is implemented. |
| AC-ADR-013 | adapt | [ADR-0008](0008-own-pnpm-and-typescript-toolchain.md) | Spec §§3, 10, 11 proposes pnpm, strict TypeScript, tsc, and ESM. One package owner; framework-native builds; exact versions, supply-chain settings, and lint tools await bootstrap. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-014 | defer | — | No lockfile, production artifact, or hosting/operations matrix exists. | ConsoleFX maintainer: Before selecting the studio's production runtime/host or adding a delivery target. |
| AC-ADR-015 | defer | — | No component implementation or demonstrated third-party UI/state/form need exists. | ConsoleFX maintainer: At the first UI dependency choice, based on actual editor needs. |
| AC-ADR-016 | defer | — | Model calls and product agent orchestration are outside the initial product. | ConsoleFX maintainer: Before any explicitly requested AI capability or provider data flow. |
| AC-ADR-017 | defer | — | No database, ORM, cache, queue, or remote transport is needed for local drafts. | ConsoleFX maintainer: Before introducing service-backed persistence or shared/realtime state. |
| AC-ADR-018 | adapt | [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md), [ADR-0009](0009-validate-changed-contracts-with-proportional-evidence.md) | Spec §§2 and 11 separates DevTools, calls, generated source, studio, and tarballs. Owning-boundary proof with staged claims; gradual automation, no invented current scripts. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-019 | adapt | [ADR-0005](0005-generate-output-from-validated-data.md) | Spec §§5, 6, 9 defines untrusted text, scenes, CSS/SVG, and generated JavaScript. Schema validation, output serialization, no raw execution/resources, and bounded work; no irrelevant identity service. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-020 | adapt | [ADR-0007](0007-keep-studio-documents-local.md) | Spec §7.4 defines drafts, downloads, and URL fragments. Browser-user ownership and explicit local retention/clear behavior; exported copies remain user-controlled; no tenancy/backend. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-021 | adapt | [ADR-0003](0003-share-one-versioned-scene-model.md) | Spec §§4, 7, 10 requires versioned JSON and public package contracts. Supported old/new fixtures, explicit schema/API migration and deprecation, no fabricated backfill job. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-022 | adapt | [ADR-0010](0010-deliver-reversible-phases-with-publication-gates.md) | Spec §§10–12 defines phases, package readiness, and later external actions. Bounded phases, current candidate identity, separate promotion authority, and package/data-aware recovery. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-023 | defer | — | The core is deliberately pure and there is no deployed process or integration to operate. | ConsoleFX maintainer: Before adding a deployed runtime lifecycle, job, or critical remote dependency. |
| AC-ADR-024 | adapt | [ADR-0011](0011-adopt-an-explicit-accessibility-baseline.md) | Spec §9 and mockup notes require keyboard/focus/readable/static behavior. Adopts WCAG 2.2 AA for project-owned web interfaces; adds a named baseline, not a DevTools conformance claim. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-025 | adapt | [ADR-0005](0005-generate-output-from-validated-data.md), [ADR-0008](0008-own-pnpm-and-typescript-toolchain.md) | Spec §9 proposes input/rendering limits and two bundled-consumer goals. Local engineering limits and reproducible bundle fixtures; no measured results, universal latency budget, or field analytics. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-027 | defer | — | This is a console-effects product, not a public Agent Skills repository. | ConsoleFX maintainer: If a public skill becomes an explicitly requested deliverable. |
| AC-ADR-028 | defer | — | There is no skill candidate or promoted skill catalog. | ConsoleFX maintainer: Before creating a candidate/public skill catalog. |
| AC-ADR-029 | defer | — | No public skill is being promoted. | ConsoleFX maintainer: Before promoting an actual public skill. |
| AC-ADR-030 | defer | — | The provider's Apache-2.0 default applies to public skill repositories. ConsoleFX licensing was unresolved at setup; the later approved spec selects MIT for this product. | ConsoleFX maintainer: Reassess skill-specific licensing only if skills become a deliverable. |
| AC-ADR-031 | defer | — | There is no distributed skill runtime or skill evaluation payload. | ConsoleFX maintainer: Before adding distributable skills and their evaluation evidence. |
| AC-ADR-032 | defer | — | No maintainer helper installation or host link/lock state is part of setup. | ConsoleFX maintainer: Before adding maintainer-local agent helper state. |
| AC-ADR-033 | defer | — | No executable public-skill helper exists or is requested. | ConsoleFX maintainer: Before choosing a runtime/dependency boundary for an actual skill helper. |
| AC-ADR-035 | defer | — | No host-specific public skill variant is published. | ConsoleFX maintainer: Before naming or splitting a public skill across hosts. |
| AC-ADR-037 | defer | — | No skill execution-host routing or model gateway is part of this product. | ConsoleFX maintainer: Before a requested skill/gateway extraction changes its target contract. |
| AC-ADR-038 | defer | — | No optional provider/tool capability inside a public skill is being installed or configured. | ConsoleFX maintainer: Before exposing such a public-skill capability; current task authority still governs tools. |
| AC-ADR-040 | defer | — | This is not a new public skill repository; its product spec supplies the stack proposal. | ConsoleFX maintainer: If a public skill repository/profile is explicitly introduced. |
| AC-ADR-041 | defer | — | npm libraries and a studio are planned; Skills CLI distribution is not a deliverable. | ConsoleFX maintainer: Before choosing discovery/installation for an actual public skill. |
| AC-ADR-049 | adapt | [ADR-0009](0009-validate-changed-contracts-with-proportional-evidence.md) | Spec §11 requires honest, separately staged acceptance evidence. Risk/cadence/receipt policy with Preview-first proof and bounded separately authorized production observation. | Accepted; maintainer approved 2026-09-11 |
| AC-ADR-054 | defer | — | No local external-worktree policy is accepted. The inherited contract separates concurrent writers; this setup has one writer in a clean checkout. | ConsoleFX maintainer: Before adopting/enforcing a broader canonical-checkout policy or starting concurrent writers; select an authorized native-Linux location. |
| AC-ADR-055 | defer | — | There is no generated public-skill release pipeline. The spec's Changesets plan is not implementation evidence. | ConsoleFX maintainer: Before selecting release-preparation automation for real packages; adapt from actual release needs. |
| AC-ADR-056 | defer | — | No validated release candidate or protected-history retry exists. | ConsoleFX maintainer: When a validated release waits across branch advancement or retry. |
| AC-ADR-057 | defer | — | No published release metadata or installable artifact needs recovery. | ConsoleFX maintainer: When a real released artifact/metadata incident requires exact provenance. |
| AC-ADR-058 | defer | — | The spec proposes a Node baseline with separate Bun consumption checks; no Bun-first execution compatibility proof exists. | ConsoleFX maintainer: Before changing script execution to Bun-first; qualify the actual toolchain and obtain the local decision. |

Every deferred item is owned by the ConsoleFX maintainer. Resume its evaluation before the named trigger is implemented; deferral is neither a rejection nor approval to bypass existing task, security, or product requirements. No rejection rationale has been fabricated.

## Repository-specific decisions and exclusions

[ADR-0002](0002-compile-purely-and-emit-exactly-once.md) is the product-specific pure-compilation/single-emission decision from specification sections 1 and 13. [ADR-0003](0003-share-one-versioned-scene-model.md) also carries the product-specific shared scene/effect model. These decisions are not invented provider mappings.

Skill-runtime controls AC-ADR-001–004, 026, 036, 039, 043–046, 048, and 050–053 are excluded from target adoption. Superseded target decisions AC-ADR-034, 042, and 047 are excluded. Internal provider mechanics are never copied or assigned local adoption rows. References to AC-ADR-047 resolve to its accepted provider successor AC-ADR-049.

The stable-public-skill workflow-selector rule is **not applicable**: the tracked README, specification, mockups, and example describe TypeScript libraries and a Next.js product, and no public skill is present. No finite-skill-workflow instruction was added to the product.

The spec's Node baseline and optional Bun consumer lane remain visible; a Bun-first rule was not silently substituted. Existing single-file ADR conventions were preserved. No hosting, database, AI stack, public-skill license, or external-worktree mandate was imported.

## Acceptance and reconciliation

The [index](README.md) exposes the eleven Accepted local records. The maintainer's 2026-09-11 approval was applied to the reviewed decision text without changing its content. The [setup receipt](setup-receipt.md) records the approval, protected-state recheck, and current validation. Deferred entries and unresolved release/toolchain choices remain unchanged. Later durable changes follow the accepted local successor process; local IDs never inherit authority from their provider ID.

## Maintainer-approved follow-up on 2026-09-12

[ADR-0012](0012-use-bounded-cinematic-lettering-profiles.md) is the accepted local cinematic contract requested for implementation in commit `3c42e12`; no new provider adoption is implied. [ADR-0013](0013-keep-screen-reader-review-as-nonblocking-follow-up.md) succeeds ADR-0011 at the maintainer's explicit request: the AC-ADR-024-derived accessibility target remains, while unperformed screen-reader review becomes nonblocking follow-up. The maintainer explicitly answered “Approve ADR-0012 and ADR-0013” for the prepared records. The original setup mapping and approval history above are retained.

## Accepted card presentation contract — 2026-09-12

The maintainer explicitly answered “Approve ADR-0014 and all ten designs” for [ADR-0014](0014-use-closed-preset-presentations.md), the ten original card references, ordinary scene slots and Windows local-font fallbacks. This is a local extension under ADR-0002 through ADR-0007; no provider record was imported and no accepted identity was overwritten. Runtime implementation and qualification follow the [collection specification](../specs/useful-artful-presets-spec.md). Earlier setup observations remain dated history.

## Accepted fitting contract — 2026-09-12

The maintainer explicitly answered “Approve ADR-0015” for [ADR-0015](0015-separate-content-fit-from-output-sizing.md), covering deterministic layout, separate output sizing, optional explicit font measurements and a validated recipe wrapper. This local extension preserves ADR-0014 standard card profiles and the ADR-0013 nonblocking screen-reader follow-up. The subsequent explicit answer “Approve all ten compact designs” accepts the separately captured [360 px references](../mockups/preset-compact-v1/README.md); runtime and release evidence remain separate. Source/probe validation is not runtime or native qualification; later implementation follows the [fitting specification](../specs/responsive-fitting-spec.md). No provider record or accepted history was replaced.
