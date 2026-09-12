# ADR governance setup receipt

Date: 2026-09-11
Workflow: setup
Coverage: recommended
Architecture decision status: approved
Execution status: completed — the maintainer-approved ADR governance is recorded and its source/static checks passed.

## Intent and scope

Available workflows: `setup | audit | refactor | plan-refactor | plan-run-refactor`. The user selected setup and then explicitly approved ADR-0001 through ADR-0011 as written. Recommended coverage uses the existing product evidence.

Authorized governance paths: root `AGENTS.md`, the eleven numbered `docs/adrs/NNNN-kebab-title.md` records, `docs/adrs/README.md`, `docs/adrs/provider-mapping.md`, and this receipt. Expected artifacts: accepted local decisions, discovery instructions, index, provider dispositions, and source/static validation evidence. No application, dependency, global configuration, Git-index, commit, publication, or deployment mutation is part of this setup.

Planning capability: Not applicable — setup is not a Plan workflow; the host is in Default mode.
Read-only enforcement: not applicable — the selected workflow permits bounded governance writes. Inspections used non-mutating commands; no read-only sandbox claim is made.
Persistence: `docs/adrs/` is selected by specification section 13; its single-file format is retained. Supporting index/mapping/receipt files belong with this governance collection.
Host adapter: root `AGENTS.md`, supported by the current Codex/user instruction contract and included in setup scope. No foreign-host or global instruction file is created. Future-turn loader behavior is not runtime-tested.

## Inspected evidence and protected state

- Repository: `servrox/console-fx`; local branch `main`, HEAD `50e63c11f48912bfe2e66686c43fbba8eb12f2c3`.
- Environment: Linux, NixOS in the intended `nixos` WSL distribution; checkout on the native Linux filesystem. Git, Codex, Node, Bun, and Python resolved to Nix-managed Linux executables.
- Initial Git state: 12 tracked files; no staged, unstaged, untracked, or ignored files; one worktree. Git index and existing tracked content are protected.
- Initial index-entry SHA-256: `7bea64654e5a47b4acf637b9a7391ddf9d44b4bf749c8f846bd788981761478b`. Both initial staged and unstaged diffs were empty.
- Read: root README, the 592-line implementation specification, implementation handover, mockup notes, and the exploratory console example. Mockup image appearance was not revalidated.
- No project `AGENTS.md`, override, `CLAUDE.md`, `CLAUDE.local.md`, Claude/Cursor rules, `.cursorrules`, `.codex/config.toml`, ADR/index, package manifest, lockfile, CI workflow, or validation script existed. `CONTEXT.md` was absent.
- Existing design-validation prose is historical evidence only. It was not reused as current runtime or DevTools proof.
- External state was not probed or changed. No npm access, package-name availability, hosted runtime, license approval, or publication evidence was obtained.
- Consulted official pnpm workspace, TypeScript declaration, Node package-entrypoint, and WCAG 2.2 documentation for the proposal mechanisms. This does not qualify dependency versions or a product artifact.

## Coverage and decision result

The [provider matrix](provider-mapping.md) records all 39 eligible entries exactly once: 13 accepted adaptations and 26 deferrals, with owners and reopen triggers. Catalog SHA-256: `71f200a769602add8f3c9e4e2697da94cde9cca8105ef3ef3e824a5013b1094e`. Runtime and superseded target decisions remain outside adoption.

The maintainer replied “yes” to the explicit request to accept ADR-0001 through ADR-0011 as written and finish setup, in the setup conversation on 2026-09-11. All eleven are now Accepted. Only each ADR's Status and Approval metadata changed; the reviewed decision text was preserved byte-for-byte. The index and selected provider rows record that acceptance. No previously accepted decision was rewritten. The original specification retains its historical planning status; the accepted local ADRs now govern their covered architecture. The stable-public-skill selector rule is not applicable to this product.

The accepted records make four details explicit beyond carrying forward the spec: ADR status/succession, validation ownership/cadence, browser-local retention and clear-draft behavior, and WCAG 2.2 AA for project-owned web interfaces. Numeric resource bounds are the spec's initial engineering limits. Exact dependency versions, tool trust settings, license, npm access, supported browser matrix, animation qualification, production host, and release automation remain future decisions or proof obligations.

## Changed files

| Paths | Change | Purpose |
| --- | --- | --- |
| `AGENTS.md` | Added | Route architecture work to local statuses, sources, and evidence |
| Eleven numbered files linked in the [index](README.md) | Added | One durable accepted decision per record |
| `docs/adrs/README.md` | Added | Canonical local index, status process, review and validation guidance |
| `docs/adrs/provider-mapping.md` | Added | Provider dispositions, adaptations, exclusions, and deferred triggers |
| `docs/adrs/setup-receipt.md` | Added | This bounded setup's scope, evidence, and acceptance state |

The original 12 tracked files are outside the write scope. Governance drafts are reversible additions; any cleanup must preserve later edits and concurrent work rather than blindly deleting a directory.

## Validation ledger

Risk: moderate for activating repository governance at one document/instruction boundary. The accepted decision content is unchanged from the reviewed set; no application/runtime/public API/trust/data behavior is implemented or changed. This rating does not classify future product implementation.
Cadence: checkpointed — compare the reviewed candidate and protected state before acceptance, then run one final governance gate after metadata/index/mapping changes.
Environment path: none — no Preview or production observation is needed for Markdown governance.
Receipt owner: lead setup agent for the checks below.
Reuse: the prior spec-to-decision semantic review was reconciled against unchanged approved ADR bodies. Status-sensitive metadata, discovery, index, mapping, and protected-state checks were rerun. Historical visual/runtime prose is not current product proof.
Final aggregate gate: one focused governance review and structural check after acceptance metadata, index, and mapping updates; no application gate exists yet.

Acceptance validation observed: 2026-09-11, checked before the 11:53:23 UTC receipt update. Toolchain: Python 3.14.7 standard library and Git 2.54.0 on the verified NixOS/WSL environment. No project dependencies, fixtures, lockfile, or runtime harness were installed. Checks used an inline, session-only structural scanner and manual source review; no permanent test suite was added.

Candidate: the 14 new governance files other than this receipt. Each fingerprint below is SHA-256 over sorted lines of `<file SHA-256>  <repository-relative path>\n`; the receipt is excluded from its subject fingerprint to avoid self-reference. Its links, whitespace, and reported results are checked separately after recording the result.

- Accepted governance candidate: `5888fa5b38a691f54d295d51f61a30d7948957ad279094f2537d7bf9c3f78e30`.
- Reviewed proposal candidate, preserved as approval provenance: `3a0cd51ba0b736c646723fb7103bbc2b056114640aa2e136fc5ab5c043f9d371`. Its initial static checks preceded acceptance; it is not substituted for the accepted candidate's checks.
- Original 12 tracked files: `669b39d572779ac003b43d322232c0608c9ba36fe5b1736afbf18517dd139f99`.
- The 13 selected provider Long files, using provider-relative filenames in the same format: `f54da3482b424ecca7cacd2a0fb1f3267bba09aa6f408b31adfb8c9f1f9cfd6b`.

Each GOV obligation below has one owner, the lead setup agent, with `moderate` risk and `checkpointed` cadence for this acceptance slice. GOV-03 reconciles the prior semantic review against byte-identical decision bodies and freshly traces the Accepted statuses; all other listed checks are fresh. Each is one component of the final governance gate; application acceptance tests are not part of this gate.

| Check ID / obligation | Subject and scenario | Stage | Status and result | Limitation / invalidator |
| --- | --- | --- | --- | --- |
| GOV-01: document integrity | Candidate plus receipt; Python metadata, ID, title/index/status, local path/anchor, newline, whitespace, and conflict-marker inspection | source/static | verified: 11 unique ADRs; 15 governance files; 78 local links resolve; all eleven statuses and approval records agree on acceptance | File, link-target, schema, or instruction changes invalidate affected checks; no remote-link or runtime proof |
| GOV-02: adoption accounting | Mapping plus current provider catalog/Long inventory; compare eligible sets, local mappings, dispositions, owners, and triggers | source/static | verified: 39 unique eligible IDs; 13 adapt + 26 defer = 39; zero missing, duplicate, runtime, or superseded rows | Provider/catalog or mapping changes invalidate accounting; accepted local decisions govern; the mapping remains non-normative |
| GOV-03: architecture and authority | Manual comparison with spec §§1–14, handover, and visual notes; root instruction discovery and deliberate conflict trace | source/static | verified: all seven spec architecture proposals have accepted local coverage; decision bodies exactly match the reviewed proposal; new details and remaining choices are disclosed; authority and conflict traces use Accepted statuses | Static review of the written contract, not a host-loader, agent execution, security, or browser test; decision/spec changes invalidate it |
| GOV-04: protected state | Baseline HEAD, index entries, tracked SHA-256 values, staged/unstaged diffs, and untracked/ignored inventory; Git diff/numstat review | source/static | verified: HEAD/index and all 12 original files unchanged; exactly 15 new allowed governance files; `git diff --check` passed and new files were checked explicitly | A concurrent file/index/HEAD change requires reconciliation; default Git diff alone does not inspect untracked additions |

The static discovery scenario routes a future authorized React/Next integration change from `AGENTS.md` through the index to the now-Accepted ADR-0002/0004 under ADR-0001. The deliberate conflict scenario requests render-time logging or a Next.js dependency in the core: the accepted rules stop the affected implementation and require an approved successor or withdrawal of the conflict. This source/static trace does not grant implementation authority, and no code was executed to simulate agent behavior.

| Later obligation | Stage | Status | Reason and owner |
| --- | --- | --- | --- |
| Core, exporter, React, studio, and packed-consumer tests | local | unavailable | No implemented packages, manifest, or validation scripts; future implementation owner must create and run the applicable spec gates |
| Actual DevTools rendering/animation qualification | local | not run | No renderer was implemented or changed; future feasibility owner must record real DevTools observations |
| Repository CI | CI | not run | No workflow exists and no commit/push was requested |
| Published/installed npm artifact | publication/install | not run | No artifact publication/install or npm account action was authorized |
| Hosted studio | deployed/production | not run | No deployment or production observation was authorized |
| npm account/name or third-party integration verification | external/third-party | not run | Outside governance setup; requires the relevant release task |

Final aggregate gate: passed for the accepted governance candidate. This completes the authorized setup and records binding architecture intent; it does not prove application behavior, CI, package publication, or deployment. Future changes to decision content or relevant inputs require fresh affected checks and the applicable successor process.

## Remaining work and next authorized action

Setup is complete. All 26 provider deferrals retain their original owners and triggers. Implementation, dependency/bootstrap decisions, feasibility qualification, licensing, npm access, and release/deployment work remain separate future tasks. No further approval is needed for this completed governance slice.

Future architecture review can use: “Use architecture-compass audit to assess this repository without changing files.” A subsequent implementation task must separately authorize its bounded phase and satisfy the relevant accepted decisions and feasibility gates.


## Accepted follow-up — 2026-09-12

The maintainer explicitly answered “Approve ADR-0012 and ADR-0013” after reviewing the prepared records. [ADR-0012](0012-use-bounded-cinematic-lettering-profiles.md) is Accepted and introduces bounded static cinematic profiles without superseding an earlier record. [ADR-0013](0013-keep-screen-reader-review-as-nonblocking-follow-up.md) is Accepted and supersedes ADR-0011, retaining its accessibility target and other required checks while making unperformed screen-reader observation nonblocking follow-up. ADR-0011 retains its historical body with a reciprocal successor link.

The canonical [index](README.md) and [provider mapping](provider-mapping.md) record this approval together. No provider adoption or new application authority follows from accepting an ADR. Implementation authority separately comes from the request to implement commit `3c42e12`; appearance approval separately covers all four native Chrome design captures. Earlier setup observations above remain dated history. Later implementation and final governance validation are recorded in the [cinematic feature evidence](../specs/cinematic-metal-presets-evidence.md).
