# ConsoleFX architecture decisions

This is the canonical index for repository decisions. Each decision is one `NNNN-kebab-title.md` file, following [specification section 13](../specs/console-fx-spec.md#13-architectural-decisions-proposed-for-implementation). The directory and single-file convention come from that specification; this setup adds the index, provenance mapping, and receipt alongside the decisions.

ADR-0001 through ADR-0010 and ADR-0012 through ADR-0018 are **Accepted**. ADR-0011 is **Superseded** by ADR-0013. The maintainer explicitly approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11. Their accepted status makes them binding architecture intent; it does not grant source implementation authority. The revised specification carries the approved product contract; accepted local ADRs govern the covered architecture. The setup receipt preserves the original governance-stage observations. On 2026-09-12 the maintainer requested implementation of commit `3c42e12`, removed screen-reader review as a launch blocker, and explicitly answered “Approve ADR-0012 and ADR-0013” for the prepared records. The earlier specification save alone did not authorize implementation.

On 2026-09-12 the maintainer also explicitly answered “Approve ADR-0014 and all ten designs” for the prepared card-presentation contract, ordinary scene slots, visual references and Windows font fallbacks. The later all-spec implementation request supplies execution authority; accepted status alone remains separate from runtime and release evidence.

The maintainer also explicitly answered “Approve ADR-0015” on 2026-09-12 for the separated fitting/sizing, optional font measurement and saved-recipe contract, followed by “Approve all ten compact designs” for the separately reviewed [360 px references](../mockups/preset-compact-v1/README.md). Runtime qualification remains separate.

## Decision index

| ID | Decision | Status | Read when | Successor |
| --- | --- | --- | --- | --- |
| ADR-0001 | [Use repository-native ADR governance](0001-use-repository-native-adr-governance.md) | Accepted | Architecture decisions, status, conflicts, agent instructions | None |
| ADR-0002 | [Compile purely and emit exactly once](0002-compile-purely-and-emit-exactly-once.md) | Accepted | Compilation, helpers, logging, standalone exports | None |
| ADR-0003 | [Share one versioned scene model](0003-share-one-versioned-scene-model.md) | Accepted | Scene schema, effects, presets, document compatibility | None |
| ADR-0004 | [Separate the core, React adapter, and studio](0004-separate-core-react-adapter-and-studio.md) | Accepted | Package ownership, imports, exports, framework integration | None |
| ADR-0005 | [Generate output from validated data](0005-generate-output-from-validated-data.md) | Accepted | Untrusted input, CSS/SVG serialization, generated JavaScript, limits | None |
| ADR-0006 | [Qualify renderer profiles in real DevTools](0006-qualify-renderer-profiles-in-real-devtools.md) | Accepted | CSS/SVG support, animation, fallback, preview claims | None |
| ADR-0007 | [Keep studio documents local](0007-keep-studio-documents-local.md) | Accepted | Next.js client boundaries, drafts, import/export, sharing | None |
| ADR-0008 | [Own the pnpm and TypeScript toolchain](0008-own-pnpm-and-typescript-toolchain.md) | Accepted | Dependency installation, compilation, ESM packaging, tool changes | None |
| ADR-0009 | [Validate changed contracts with proportional evidence](0009-validate-changed-contracts-with-proportional-evidence.md) | Accepted | Risk, tests, validation cadence, evidence reuse, completion claims | None |
| ADR-0010 | [Deliver reversible phases with publication gates](0010-deliver-reversible-phases-with-publication-gates.md) | Accepted | Delivery phases, release readiness, promotion, recovery | None |
| ADR-0011 | [Adopt an explicit accessibility baseline](0011-adopt-an-explicit-accessibility-baseline.md) | Superseded | Historical accessibility baseline; follow ADR-0013 | ADR-0013 |
| ADR-0012 | [Use bounded cinematic lettering profiles](0012-use-bounded-cinematic-lettering-profiles.md) | Accepted | Cinematic presets, composite effect/profile contract, original glyphs, and compatibility | None |
| ADR-0013 | [Keep screen-reader review as nonblocking follow-up](0013-keep-screen-reader-review-as-nonblocking-follow-up.md) | Accepted | Accessibility and release readiness; supersedes ADR-0011 | None |
| ADR-0014 | [Use closed preset presentations](0014-use-closed-preset-presentations.md) | Accepted | Useful/artful cards, shared presentation data, slot schemas and comparison baselines | None |
| ADR-0015 | [Separate content fit from output sizing](0015-separate-content-fit-from-output-sizing.md) | Accepted | Fitting, measurements, sizing, recipes and compact layout qualification | ADR-0017 (creation defaults only), ADR-0018 (additive fit/v2) |
| ADR-0016 | [Organize discovery around an example catalogue](0016-organize-discovery-around-an-example-catalogue.md) | Accepted | Separate landing/workbench, category navigation, capability resolution | None |
| ADR-0017 | [Default new workbench examples to automatic SVG sizing](0017-default-new-workbench-examples-to-automatic-svg-sizing.md) | Accepted | New-example defaults; narrow successor to ADR-0015 | ADR-0018 (default algorithm only) |
| ADR-0018 | [Add versioned fitting that preserves readable floors](0018-add-versioned-floor-preserving-fitting.md) | Accepted | Unmeasured all-example fitting, preserved v1 compatibility | None |

The maintainer explicitly approved ADR-0016 and ADR-0017 on 2026-09-14 and
authorized the workbench implementation and updated package publication. ADR-0015
remains binding outside the new-example creation default. See the
[workbench proposal](../specs/workbench-proposal.md) for the category map and
explicit specification conflicts.

On 2026-09-14 the maintainer explicitly approved ADR-0018 and release 0.2.0 under `next`. It adds `fit/v2` without changing `fit/v1`, and narrowly succeeds ADR-0017 for the algorithm used by new examples.

## Status and acceptance

`Proposed` means a pending decision. `Accepted` means the maintainer has approved its recorded content. `Superseded` directs readers to an accepted successor; `Rejected` preserves an option that was not chosen. Status does not imply implementation or validation success.

Acceptance requires review of the concrete records. Record the approval date and source in each accepted record, then update this index, the [provider mapping](provider-mapping.md), and the [setup receipt](setup-receipt.md) together. Partial acceptance is allowed; dependent implementation remains pending where it needs an unaccepted decision. Never infer acceptance from a file's presence, a provider's status, or permission to perform setup.

Keep one durable decision per record. Allocate the next unused four-digit ID without renumbering history. An accepted decision changes through a new accepted successor with reciprocal links; corrections that do not change meaning may be made explicitly. No triplet format, provider IDs as local identities, host-specific lock files, or copied provider library is required.

## Review focus

The accepted decisions carry forward the product's seven architectural proposals and its safety and release requirements. The reviewed decision text is preserved unchanged; wording about proposals records its origin, while the Accepted status and approval metadata establish its current authority. The maintainer also approved the explicit ADR status process, validation ownership, browser-local draft retention/deletion, and WCAG 2.2 AA baseline for the project's web interfaces. Numeric resource bounds come from specification section 9 and remain engineering limits, not measured platform capabilities. The later approved spec settles MIT licensing. Implementation selected the pinned toolchain and the user selected a personal Vercel project; authenticated npm organization ownership has been verified. Publication and public deployment remain separate gates in the [implementation receipt](../specs/console-fx-implementation-evidence.md). These later observations do not change Accepted decision intent.

## Validation and evidence

Application scripts and CI configuration now exist; consult the current package manifest and implementation receipt for their execution status. For governance changes, inspect the diff, run `git diff --check` for tracked changes, and check newly added Markdown for whitespace, unique IDs, required status/owner/succession fields, index/mapping consistency, valid local links, and agreement with the specification. Check changed untracked files explicitly; Git's default diff does not include them. Do not install an application toolchain merely to validate Markdown.

Trace a representative task from [AGENTS.md](../../AGENTS.md) to the applicable decisions, and verify that an intentional conflict would stop the affected implementation. Report this as source/static review unless a real execution harness was used. The setup's validation and protected-state evidence lives in [setup-receipt.md](setup-receipt.md). Later expensive or reusable receipts belong beside the relevant spec or in that task's explicitly selected evidence path; this is not a universal runtime ledger.
