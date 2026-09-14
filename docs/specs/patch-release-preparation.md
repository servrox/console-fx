# ConsoleFX 0.1.1 release preparation

**Historical preparation of the first 0.1.1 candidate; these bytes are not a
current release selection.**

The later [second architecture round](architecture-round-2.md) changes the core
archive with another fitting correction. Its
[verification receipt](architecture-round-2-verification.json) identifies those
bytes. Use the [completion audit](mvp-completion-audit.md#source-and-release-identity)
for the dated merged checkpoint. The original observations below remain scoped
to this earlier candidate; they do not approve or validate its replacement.

Prepared: September 13, 2026. Owner: ConsoleFX corrective-release task.
Input main: `4f9326934e86f0d2bd7dedc378c2baecce377c6d`.
Worktree: `.worktrees/console-fx-0.1.1`; branch: `release/console-fx-0.1.1`.
This receipt records local preparation before versioned source CI.

## What changes

- **Core 0.1.1** includes the three fixes already merged in PR #21: fatal fitting
  limits/invalid sizing under fallback, complete container captions on the next
  line, and explicit rejection or lossless text fallback for SVG-unrepresentable
  run text. See the [core changelog](../../packages/console-fx/CHANGELOG.md#011).
- **React 0.1.1** raises its packed core dependency to `^0.1.1`. Its runtime and
  declarations are byte-identical to published React 0.1.0; React remains a
  `^19.0.0` peer. Only package metadata and the changelog differ.
- The Next.js consumer example pins both packages to 0.1.1. The core retains
  zero dependencies and the existing public export map.
- The previously reviewed test maintenance moves all unit/artifact tests to
  Vitest 4.1.11 and consolidates repeated browser tours. Its twelve source files
  are copied unchanged from the separately verified workbench preparation.

No library implementation changes were added on top of the input main commit.
The workbench/page split, amicro adaptations and new-example sizing default
remain separate pending design work. This release changes no Accepted ADR.

## Reconcile the first release

Three feature changesets were still pending even though their capabilities
already shipped in 0.1.0: cinematic presets, Useful/Artful cards and explicit
fitting. Their published declarations and archive bytes were inspected; fresh
exact-version npm metadata matches the archived SHA-512 integrity. The
[published-pair receipt](../evidence/packages/2026-09-13/README.md) separately
records executed 0.1.0 consumer behavior.

Those three obsolete changesets are consumed without announcing the same
features as a new minor release. The remaining core correction and a React
dependency-floor patch were applied with `pnpm run changeset version`. Both
changelogs now accurately identify 0.1.0 as published. Changesets owns this update.

The reproducible local verifier and receipt are
`.artifacts/release/verify-published-baseline.py` and `published-baseline.json`.
They record source hashes, exact registry endpoints, command, environment,
owner, scope and invalidators. They do not claim a new registry consumer install.

## Candidate bytes

| Package                     | Version | SHA-256                                                            |
| --------------------------- | ------- | ------------------------------------------------------------------ |
| `@servrox/console-fx`       | 0.1.1   | `c9f14cb089f0a02bd58e412f4df55477da13bcb63fb65562b8d755f1437162e0` |
| `@servrox/console-fx-react` | 0.1.1   | `f0bcd68d78886a11b013826a5f6394058cca33ebed0baac71a3f81b57b779aed` |

Tarballs and `candidate.json` live under `.artifacts/packages/`. The lockfile
SHA-256 is `32406f94aa7538deeb34f7d84e309fd9b11ac530f89c005781729bc4423327c4`.
Changing package source, packed documentation, versioning inputs or lockfile
requires reconciling the affected candidate evidence before release.

## Verification

| Obligation                                                  | Stage               | Result                                                                                                         |
| ----------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Package and static-studio build                             | local               | Passed; 50 static files prepared, with no upload                                                               |
| Formatting, lint and types                                  | local               | Passed                                                                                                         |
| Unit, integration and artifact contracts                    | local               | 342 tests passed across 21 Vitest 4 files                                                                      |
| Packed files, declarations, export maps, licenses and peers | local               | Passed; 152 core files and 8 adapter files                                                                     |
| Bundle budgets                                              | local               | CSS 9,754 / 10,240 gzip bytes; complete compiler 25,596 / 25,600                                               |
| Recorded native output parity                               | local               | All 34 archived fixture output objects, complete exports and code hashes match the packed 0.1.1 compiler       |
| Isolated packed JS/TS/React/Next consumers                  | local               | Passed; public entrypoints, types, SSR/lifecycle, website recipes, production build and three browser journeys |
| Versioned source CI                                         | CI                  | Not run at this local preparation checkpoint                                                                   |
| 0.1.1 registry installation                                 | publication/install | Not run; version 0.1.1 is not published                                                                        |

The native fixture comparison reuses the exact
[recorded Chrome/Edge evidence](../evidence/website/2026-09-13-reference/README.md).
It is not a new DevTools observation or general behavioral parity with defective
0.1.0 output. The new core also includes the earlier motion-owner refactor.

The packed-consumer check ran with Node 24.20.0 and pnpm 12.3.4 in NixOS WSL2.
Its three web journeys used Windows Chrome 153.0.8010.36 in an isolated
**headless** profile; the receipt is `.artifacts/packages/consumers.json`.
This proves the web consumer scenarios, not native DevTools rendering. An
earlier owned Edge launch exposed no CDP endpoint and was closed; it supplies
no passing consumer observation.

Independent Standards and Spec reviews report zero remaining actionable
findings after correcting the consumed-changeset link and completing the
published-baseline verifier's provenance. These are bounded source reviews.

Raw logs, fixture comparison, package-member diff and source/ownership receipts
remain local under `.artifacts/release/`. Original root/index and workbench
preparation must remain protected. No npm credential, private browser profile,
raw participant data or automatic publishing permission is part of this packet.

## Remaining release steps

1. Review and validate the versioned source through GitHub CI. Reconcile the
   resulting tarball hashes with this local candidate before requesting release.
2. Obtain approval for the exact 0.1.1 artifacts and distribution tag, then use
   the [publishing procedure](../publishing.md). Do not republish 0.1.0 or change
   registry tags as part of preparation.
3. Verify registry bytes and fresh consumers after publication; update current
   package-availability wording and the release ledger from actual observations.

Full-goal completion still requires the pending workbench implementation and
the [external validation packet](../validation/mvp-external-review.md).
Screen-reader review remains nonblocking under ADR-0013.

Governing decisions: ADR-0004, ADR-0008, ADR-0009 and ADR-0010. Existing
renderer/fitting evidence retains ADR-0006/0015's recorded limits.
