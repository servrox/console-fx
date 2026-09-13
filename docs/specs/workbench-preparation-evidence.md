# Workbench proposal and test-maintenance receipt

**The proposal is ready for review. Test maintenance is merged; the proposed
product UI is not implemented.**

The documentation now follows main checkpoint
`e2fdc128a13b3ac0c2965edbfd73868ed3f112ba`, which merged
[PR #22](https://github.com/servrox/console-fx/pull/22). Its
[CI run](https://github.com/servrox/console-fx/actions/runs/34778964221) passed
342 Vitest cases, 82 studio browser checks and three packed-consumer journeys.
The twelve test-maintenance files match the originally reviewed subject below.
The technology inventory now describes the 0.1.1 source manifests; those
versions remain unpublished at this checkpoint.

This integration carries documentation only, using
`.worktrees/console-fx-docs-integration` on
`docs/console-fx-workbench-and-technology`. ADR-0016/0017 remain Proposed.
The original workbench draft, root worktree and their Git indexes are preserved.

## Original preparation checkpoint

Observed: 2026-09-13. Owner: ConsoleFX preparation task.
Base: `4f9326934e86f0d2bd7dedc378c2baecce377c6d`.
Worktree: `.worktrees/console-fx-workbench-plan`.
Branch: `docs/console-fx-workbench-model`; changes remain uncommitted.

## Scope and decisions

- Wrote the [proposal](workbench-proposal.md), complete
  [43-entry map](workbench-catalogue.md), [internal contract](workbench-contract.md)
  and [testing strategy](testing-strategy.md), including two diagrams.
- Prepared ADR-0016 and ADR-0017 as **Proposed**. No acceptance, public API,
  saved-document migration, UI implementation or default change is implied.
- Pinned Vitest **4.1.11**; migrated the 29 existing artifact/release cases to
  its release project without removing their assertions. CI runs both Vitest
  projects through one `pnpm test` invocation.
- Consolidated repeated browser tours in four suites. All recipe/profile
  contracts remain; added a useful-example presentation contract and stricter
  recipe round-trip checks. No security, recovery or compatibility cases removed.
- Governing Accepted ADRs: 0003/0004/0007 for the proposed ownership and saved
  data constraints; 0008/0009 for executed test maintenance; 0012/0014/0015 for
  capability and sizing limits. ADR-0013 retains nonblocking screen-reader review.

## Executed milestone

| Obligation | Stage | Result | Evidence / limits |
| --- | --- | --- | --- |
| Build the unchanged product with the new test dependency graph | local | Verified | `pnpm run build:vercel`; packages and static app built; 50 prepared files. No upload. |
| Formatting, lint and types | local | Verified | `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`; final changed assertion file formatting checked separately. |
| Core, React, app and artifact contracts | local | Verified | `pnpm test`: **342 passed** across 21 files: 313 unit cases plus 29 release cases. Vitest 4.1.11. |
| Changed browser interactions | local | Verified | Four changed suites: **32 passed**, zero failed/skipped/flaky, desktop and narrow configurations. Native Edge 153.0.4234.32 through an isolated CDP profile. |
| Complete category inventory | source/static | Verified | Source-derived comparison matches 43 unique IDs; counts 27/3/2/5/4/2 in the proposed category order. |
| Proposal consistency, added links and protected checkout | source/static | Verified | 12 changed/new Markdown files; 39 added local links; accepted ADR bodies and base front matter unchanged; root HEAD/index and 205 protected files unchanged. |

Browser command:

```sh
CONSOLE_FX_CDP_PORT=9430 CONSOLE_FX_STUDIO_PORT=4330 \
  pnpm exec playwright test \
  tests/studio/cards.spec.ts tests/studio/cinematic.spec.ts \
  tests/studio/reference-examples.spec.ts tests/studio/website.spec.ts \
  --reporter=json
```

Environment: Linux / NixOS WSL2 (`nixos`), Node 24.20.0, pnpm 12.3.4,
TypeScript 6.0.3, Playwright 1.63.0. Native Edge is the browser observation
environment; all repository mutation and development commands ran in Linux.
The isolated browser was closed after validation; existing profiles were
preserved. Narrow emulation is not a physical-phone or Safari observation.

## Findings fixed during the milestone

| Finding | Resolution |
| --- | --- |
| New exact round-trip assertion omitted the parser's `diagnostics` member | Included the complete successful result; final Vitest run passed. |
| Gallery loading check could succeed with zero images | Require the complete image population and load completion, plus one exact representative URI. |
| Initial sandbox denied child processes in 15 import/release cases | Reran with normal child-process access; all passed. No assertions or production code were weakened. |
| Three sample/category mismatches and ambiguous optional restriction lifetime | Corrected the map; removed the unused restriction mechanism; derive capabilities from current data. |
| Disabled-control semantics and a misplaced proposal notice | Preserve valid data/export choices explicitly; keep the notice outside existing YAML front matter. |

Two-axis source review: **zero remaining Standards findings; zero remaining
test-Spec findings** after corrections. Focused category/contract re-review also
reported zero remaining actionable findings. These are bounded source reviews,
not a claim that every possible future implementation issue has been found.

The initial Windows launch receipt also needed explicit PowerShell invocation
and tolerant decoding of localized progress output. Browser ownership was
recovered and checked before cleanup. This affected the observation harness,
not the application or test expectations.

## Evidence boundaries

- Local logs and machine-readable reports live under
  `.artifacts/workbench-plan/` in this worktree. They are not published.
- The baseline main CI run `34772158302` is historical evidence for `4f93269`.
  No new CI run, commit, push, package release or deployment was performed.
- Package installation consumers, unchanged browser suites and native
  DevTools profile qualification were not rerun for this test-only change.
  The renderer, app behavior, package source and published package contracts
  are unchanged; local browser tests are not new renderer qualification.
- Participant sessions, physical-device performance and real Safari checks
  remain external follow-ups from the broader project. This proposal does not
  mark them complete or change their requirements.
- Receipts become stale for affected obligations when source, lockfile,
  fixtures, configuration or observed environment changes.

## Final document check

Verified at 2026-09-13 18:22 UTC: 12 changed/new Markdown files and 39 added
local links/anchors; two unique Proposed ADRs and consistent index references;
unchanged accepted ADR bodies and base-spec front matter; root HEAD/index and
all 205 protected files unchanged. `git diff --check` passed. New files were
checked explicitly as well.

Initial proposal candidate SHA-256: `f5ef1572d16957757806b0e395fe8c61968c0671ad63bf7784eefd0272917820`.
Test-maintenance subject SHA-256: `6f483398055c2d1a0406a0d9789a87326b5e88a3b77b2410642b5b76b66415f3`.

Fingerprints hash sorted `<file SHA-256>  <repository-relative path>\n` records.
The initial candidate covers 23 changed/new files and excludes this receipt to
avoid self-reference; the test subject covers its 12 non-document files.
The local `candidate.json` lists individual source and evidence hashes. These
identify the reviewed uncommitted worktree, not a release or deployed artifact.

## amicro follow-up — 2026-09-13

The maintainer requested amicro as an additional interaction source. The
[selected adaptations](workbench-interactions.md) specify directional CTA
feedback, truthful copy/check state, active-tab treatment and restrained panel
transitions. Public source was inspected at
`86b55340bfb939b8e93bb53aa46ba017c3449f1c` with its MIT notice. A separate isolated
browser observation confirmed the demo reports “Copied” on hover; the contract
requires success from the actual clipboard operation. The session was closed.

Stage `external/third-party`: source selection and public-demo observation only.
No upstream runtime/source was installed in the app and no dependency or
application/test file changed. The existing 342 Vitest and 32 browser results
retain their exact non-document subject. No application suite was rerun for
this documentation-only extension.

Stage `source/static`: verified 13 changed/new Markdown files and 45 added
local links/anchors. Pinned source hashes, the observed demo behavior and this
check are retained under `.artifacts/workbench-plan/amicro/` and
`doc-check-amicro.json`.

amicro-stage proposal candidate SHA-256: `146c8cafff72f9d566f163b501debb7013f58cfa62a814bd1ec5adb7903d910f`.
It covers 24 files excluding this receipt. The previous candidate record is
retained as `candidate-before-amicro.json`; the test subject fingerprint is
unchanged. ADR-0016/0017 still await the existing review checkpoint.

## Technology documentation follow-up — 2026-09-13

Added a dedicated [technology and dependencies section](../technology/README.md),
linked from the root README and workbench proposal. It covers the five active
manifests, all 22 direct third-party packages, framework/package ownership, host
tools, CI actions, external services and selected UI sources. Its diagram follows
ADR-0004; tool ownership and documentation-only validation follow ADR-0008/0009.

The searchable JSON index contains all 583 package/version entries from both
root lockfile YAML documents: 574 workspace entries and 9 pnpm toolchain entries.
It retains 116 platform-constrained entries and seven source hashes. Dependency
edges and integrity metadata remain in the canonical lockfile; vendored Next.js
components are covered by the existing generated-notice workflow. The index is
not evidence that every listed package ships in the browser.

Stage `source/static`: direct package names/versions match every active manifest;
all lockfile entries, constraints, counts and source hashes match. Verified 16
changed/new Markdown files and 84 added local links/anchors. Targeted Prettier
and `git diff --check` passed. Root HEAD/index and all 205 protected files remain
unchanged. Final check: `.artifacts/workbench-plan/doc-check-technology.json`.

No application/dependency/test subject changed in this follow-up; the earlier
342 Vitest and 32 browser results keep the same subject fingerprint. No application
suite, CI, publication or deployment was rerun for these documentation additions.
amicro/Aceternity remain selected sources pending product integration.

Technology-stage proposal candidate SHA-256: `e07b0c766dcf7904d81565a5da2e0bd733567eb92afaaec0f970de84f448d3da`.
It covers 28 changed/new files excluding this receipt. The previous candidate is
retained as `candidate-before-technology.json`; the test-maintenance subject
remains `6f483398055c2d1a0406a0d9789a87326b5e88a3b77b2410642b5b76b66415f3`.

## Completion-audit reconciliation — 2026-09-13

Corrected the [completion audit](mvp-completion-audit.md) to include the pending
workbench request and stop applying the older package-parity comparison to the
three subsequent compiler corrections. Fresh GitHub readback found no open PRs
and successful main validation `34772158302` at `4f93269`. Fresh npm metadata
still lists only 0.1.0 for both packages; both `next` and `latest` point to it.
These source/CI and registry-metadata checks do not reverify hosted behavior or
package installation. Raw results are summarized in the local
`completion-state.json`; document checks are in `doc-check-goal.json`.

Current proposal candidate SHA-256: `9b4148e887320c295859e13df47890c8192db8c7ace5049c04e8a7e47d8a012a`.
It covers 29 changed/new files excluding this receipt. The prior candidate is
retained as `candidate-before-goal-continuation.json`. The test subject is
unchanged; no application suite was repeated. The full goal remains open.

**Next:** review the [short proposal](workbench-proposal.md) before product
implementation. This is the checkpoint requested by the maintainer.

## Complete the tool and workflow inventory — 2026-09-13

Added the publishing workflow's `actions/download-artifact` 8.0.1 to the
technology section and recorded the dated actionlint 1.7.12 workflow validator.
Its five action/version rows now match every `uses:` entry
in both current workflows. The text distinguishes prepared publishing
automation from configured trusted publishing and observed releases.

Stage `source/static`: rechecked all 22 direct packages across five manifests,
all 583 entries in both lockfile documents, seven inventory source hashes and
35 technology-section local links/anchors. Targeted formatting and
`git diff --check` passed. Root HEAD/index and all 205 protected files remain
unchanged; no application suite was repeated for this documentation correction.
The local receipt is `.artifacts/workbench-plan/doc-check-ci-actions.json`.

Current proposal candidate SHA-256: `1b43c0e1b97ee27eb2e9f4018a4300851f0a7e17a9d67428f89ff3c314f8e557`.
It covers the same 29 files excluding this receipt. The prior candidate is
retained as `candidate-before-ci-action-doc.json`; the twelve-file test subject
is unchanged. ADR-0016/0017 remain Proposed.

## Documentation integration with current main — 2026-09-13

Owner: ConsoleFX documentation integration. Input:
`e2fdc128a13b3ac0c2965edbfd73868ed3f112ba`. This carries the prepared documents
into an isolated branch while retaining PR #22's package/release corrections.
The original draft and its receipts remain untouched in their prior worktree.

Stage `source/static`, verified at 20:17 UTC: 18 documentation files, including
17 Markdown files and 222 local links/anchors; six categories and all 43 mapped
examples; twelve workbench acceptance criteria; five active manifests, all 22
direct packages, 583 locked versions and five workflow actions. The seven
inventory source hashes match the current manifests and unchanged lockfile.
Targeted technology-document formatting and `git diff --check` passed.

The full link check recognizes existing explicit HTML anchors as well as
generated heading IDs and rejects duplicate explicit IDs. The specification's
existing section-13 compatibility anchor remains unchanged.
Accepted ADR bodies and base-spec front matter remain unchanged. ADR-0016/0017
remain Proposed; no product behavior or creation default changed.

Root HEAD/index and all 205 protected files, the release and draft HEAD/index,
and nineteen protected draft documents/receipt files remain unchanged. Local
verification uses `python3 .artifacts/docs-integration/verify-docs.py`; the
machine-readable candidate records its harness, environment, per-file hashes
and invalidators. No application suite or browser qualification was rerun for
this documentation-only integration.

Integration candidate SHA-256:
`56295efa0dcc2fcba8b51e2ed11f342a3819f69a57addc8568e577e859ab1c63`.
It covers seventeen changed files, excluding this receipt to avoid self-reference.
The source/static review and pre-existing main CI are distinct observations;
merging documentation does not accept the proposed decisions or implement them.
