# Cinematic metal presets — implementation evidence

Status: Implementation and local feature qualification passed on 2026-09-12; independent review fixes are verified below. Documentation and protected-state reconciliation passed. This candidate has not been committed, submitted to CI, published or deployed.

## Scope, authority and architecture

The maintainer requested implementation of commit `3c42e12d705b044809c05579f762bcb8c137890a`, approved all four designs shown in native Chrome captures, and explicitly answered **“Approve ADR-0012 and ADR-0013”** for the prepared records. Accepted ADR-0012 governs the bounded static cinematic profiles. Accepted ADR-0013 supersedes ADR-0011: the deferred Narrator/NVDA observation is **not run, nonblocking follow-up**. Other accessibility requirements remain in force.

Architecture Compass workflow: `setup/recommended`, then bounded `refactor`; planning capability: Not applicable (concrete specification and approved policy change; Default mode). The public workflow set is setup, audit, refactor, plan-refactor, plan-run-refactor. The target publishes libraries and a studio, so the stable-public-skill workflow selector rule is not applicable. Canonical governance paths remain `docs/adrs/` and `docs/specs/`; later evidence lives in the task-specific `docs/evidence/` directories linked below.

Material governing decisions: ADR-0002 through ADR-0010, ADR-0012 and ADR-0013. These cover pure compilation and one emission, immutable V1 data, package boundaries, validated bounded output, native renderer qualification, local drafts, owned toolchains, proportional evidence and separate release authority. ADR-0001 governs approval and succession. ADR-0011's historical body is preserved; its status and successor link direct readers to ADR-0013.

Work is isolated in `.worktrees/console-fx-cinematic`, branch `feat/console-fx-cinematic-presets`, based on the requested `3c42e12` commit. The original checkout/index and older worktrees are protected. Risk is high at renderer/export and draft-recovery boundaries; validation was checkpointed at each owning boundary. The final gate reuses unchanged results only after output/artifact reconciliation. The later maintainer request authorizes reviewed source commits, PRs and merges. Publication and deployment remain their own exact-candidate gates.

## Result

The existing presets entry point now exposes `lightningMetal`, `iceCathedral`, `liquidChrome` and `moltenGold`, plus dispatcher/catalog entries. Each produces ordinary frozen V1 scene data with one `cinematicMetal` effect and explicit parameters. The closed `-v1` profiles use original repository-authored angular paths or documented local serif stacks, bounded reflections/extrusion/glow and optional original ornaments. No font file, copied logo, external asset, runtime dependency, package or entry point was added.

The existing SVG compiler owns rendering and structured capability diagnostics. Unsupported angular glyphs, long/multiline titles, CSS requests and motion combinations fail explicitly; exact text remains available under explicit fallback. Static defaults, reset-styled captions, complete one-call exports, old limits and the one-static-effect guard remain intact. Nine pre-feature normalized scenes and their exact argument/SVG/generated-code hashes are unchanged. Twelve pre-feature public descriptors also retain their exact data.

Both studio entry points expose a Cinematic Metal group through the real compiler preview. Stable memoized samples avoid recompiling the gallery for every keystroke. Profile controls explain applicable font/weight/color settings and disable cinematic motion. Load, import, restore, shared-link acceptance, undo and redo select an appropriate renderer; a later explicit CSS choice stays visible as an error until the user selects SVG.

The new shared-link journey exposed an existing gap: navigating to a new scene fragment on the already-open studio did not process it. A scoped `hashchange` listener now confirms conflicting scenes and preserves valid work. The dialog's temporary storage hold restores its prior state, so accepting/canceling a share cannot release a hold protecting corrupt or unavailable storage. Editing, selection, import and copying remain silent; only explicit Test emits.

## Artifact identity and local validation

Canonical execution: NixOS inside WSL2 (`Linux`, distribution `nixos`), native Linux worktree and Nix-managed executables. Pinned Node 24.20.0, pnpm 12.3.4, TypeScript 6.0.3, React 19.3.0, Next.js 16.3.4, Vitest 5.0.0 and Playwright 1.63.0 were inspected. Existing Bun 1.4.2 was used only as a runtime consumer. The frozen lockfile is unchanged.

| Candidate                   | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| Core `0.1.0` local tarball  | `1d1bfbcce41cc4880d582db9cb4e4f6590ed87f806bfe43cbd5ca369bd994649` |
| React `0.1.0` local tarball | `51a2f2dd752718e8905a1955db7a83486125c469a6247ac2b29b1a7a04f2017a` |
| Frozen lockfile             | `a9aeac3691f826646112a9e7ba3ecc45e0fac8e5d0c3a90a0c46bda7a13c0497` |

These are local candidate versions, not publication claims. The [package receipt](../evidence/packages/2026-09-12-cinematic/review-fixes/candidate.json) records all 64 core and eight React package files. The final installed [consumer receipt](../evidence/packages/2026-09-12-cinematic/review-fixes/consumers.json), [bundle receipt](../evidence/packages/2026-09-12-cinematic/review-fixes/bundles.json), [Bun receipt](../evidence/packages/2026-09-12-cinematic/bun-smoke.json) and [older-reader check](../evidence/packages/2026-09-12-cinematic/older-reader.json) identify their actual artifacts.

| Owning check                                                            | Stage                        | Observed result                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`, `pnpm lint`, `pnpm format:check`                      | source/static                | Passed for final source                                                                                                                                                                |
| `pnpm test`                                                             | local                        | 146 tests in 11 files passed; includes adversarial serialization, compatibility, bounds, one-call exports and recovery                                                                 |
| `pnpm test:release`                                                     | local                        | Seven release-artifact tests passed; no release action performed                                                                                                                       |
| `pnpm build`                                                            | local                        | Packages and production static studio built successfully                                                                                                                               |
| `CONSOLE_FX_STUDIO_PORT=4185 CONSOLE_FX_CDP_PORT=9343 pnpm test:studio` | local, actual Windows Chrome | All 20 desktop/mobile journeys passed, including new gallery/import/share/recovery cases, clipboard denial, reduced motion, focus and axe scans                                        |
| `pnpm check:packages`                                                   | installed package/static     | Allowed contents, public exports, declarations, MIT files and dependency boundaries passed                                                                                             |
| `pnpm check:bundle-size`                                                | installed package/build      | CSS 10,226 / 10,240 gzip bytes; SVG 10,225 / 25,600. Browser consumer excludes React, Next, codegen and presets. Data-only root import excludes renderer/glyph/preset/exporter modules |
| `CONSOLE_FX_CDP_PORT=9343 pnpm test:consumers`                          | installed package/local      | JavaScript, TypeScript, React SSR/first-enabled/Strict Mode/remount, Next production build and actual Chrome browser lifecycle passed for final tarballs                               |
| `bun checks/vanilla/check.mjs` in the installed consumer                | installed package/local      | Existing public imports and four cinematic factories/round trips passed                                                                                                                |
| `pnpm changeset status`                                                 | source/static                | Core minor and dependent React patch planned; no version bump or publication performed                                                                                                 |
| `pnpm prepare:vercel`                                                   | local preparation            | 36 static files, five hashed inline scripts and 480-byte CSP prepared; prepared artifact passed studio CSP/hydration checks; no deployment                                             |

The CSS entry has fourteen gzip bytes of budget headroom. Compact original geometry, shared SVG value serialization and equivalent concise diagnostics kept the existing budget; future core changes need the same size check. Static root consumers do not pull in cinematic artwork. Local-serif metrics and rasterization can vary by platform; the API reports that limitation.

Initial new browser tests found incorrect test locators and then the shared-fragment gap; the final owning suite passed after correction. A subsequent run was stopped when the dedicated browser connection disappeared; its orphaned task server was removed and the isolated browser restored before the successful full run. Sandbox subprocess failures were retried in the approved Linux execution context. Those failures/setup probes are not passing product evidence. Final tarballs were repacked after source-map formatting and reinstalled; prior tarball hashes are not substituted for the final consumer result.

## Independent review corrections

Standards review found that advances underestimated several glyph ink bounds; Spec review reproduced a bloom filter clipping a valid H with glow 0.25, depth 0 and ornaments disabled. Both defects have regression coverage. The compiler now considers authored ink bounds and derives the bloom filter from the same ascent/descent envelope. Duplicate/intermediate collinear glyph vertices were removed without changing any polygon boundary, independently checked by both reviewers. The strict property allowlist still rejects every non-schema key, including prototype-related names; its redundant secondary blacklist was removed. All 146 unit tests, typechecking, lint, formatting, production build and package checks passed after these changes.

The [corrected native record](../evidence/devtools/2026-09-12-cinematic/review-fixes/README.md) replaces earlier-candidate output identity: **64 observations**, including all four profiles in actual **424-pixel DevTools consoles** in each browser. Fixed-width artwork crops with horizontal scrolling there; the complete caption remains readable and native-copyable. All sixteen full-image captures and eight narrow contexts were inspected. The exact final tarballs were reinstalled and passed JavaScript, TypeScript, React and Next production/browser consumer checks. Earlier source-only/visual receipts below remain historical where their identity differs.

## Visual, native console and accessibility evidence

The [native DevTools bundle](../evidence/devtools/2026-09-12-cinematic/README.md) contains 56 cinematic observations: four profiles at 840 × 270 and adjusted 480 × 270 in each browser, then generated-code/native-copy, before-open, reopen and two repeated-snippet cases per profile/browser. All recorded one exact emission and complete caption. The final package's image URI, lifecycle arguments and generated code were reconciled byte for byte. All sixteen default/480-pixel captures were visually inspected, and the maintainer approved the four default Chrome designs. Lifecycle pixel comparison and one separately inspected three-pixel variation are recorded without claiming cross-browser pixel equality.

Actual hosts were Windows 11 Pro Insider Preview 25H2 build 26220.9223, Chrome for Testing 153.0.8010.36 and portable Edge 153.0.4234.32, checked against recorded current-stable feeds. Dedicated DevTools used light theme, 100% zoom and 1,384 CSS-pixel console width. These observations qualify the recorded static fixtures; arbitrary text, other font installations, themes, future builds and cinematic motion are outside that claim. Existing effects/motions retain their separately dated baseline evidence and exact old-output regressions.

The [native zoom receipt and eight captures](../evidence/accessibility/2026-09-12-cinematic/native-zoom.json) cover the final studio artifact at actual Chrome 200% and 400% zoom on `/`, `/studio/` and `/docs/`. The 1,264-pixel content viewport became 632 and 316 CSS pixels; document widths stayed within it. The new gallery sample/name, labels, focused editing field and scrollable Reset choices remained readable in the inspected captures. Keyboard editing retained the text; Enter opened Reset, Tab kept focus in the dialog, and Escape returned focus to Reset. The dedicated browser was restored to 100%.

Automated scans, reduced-motion/static tests and these sampled keyboard/zoom observations do not establish full WCAG conformance. Narrator/NVDA is **not observed, nonblocking follow-up**, owned by the maintainer under ADR-0013. No repeated request or invented pass is required.

## Acceptance-criteria reconciliation

| Feature criterion           | Result and owning evidence                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 Catalog/API           | Passed: four factories, named/dispatcher imports, typed options and metadata; old names/defaults retained                                                        |
| AC-02 Ordinary data         | Passed: frozen normalized V1 JSON, no browser/network/import emission; core and packed consumers                                                                 |
| AC-03 Distinct results      | Passed: original angular/local-serif treatments; native captures inspected; explicit maintainer appearance approval                                              |
| AC-04 One composite effect  | Passed: guard preserved, all cinematic motion combinations rejected including reduced requests; old combinations still tested                                    |
| AC-05 Text fidelity         | Passed: preserved captions/source, display-only capitals with diagnostic; percent/Unicode/quote/control regression corpus                                        |
| AC-06 Fallback              | Passed: structured capability errors, explicit exact static-text fallback, unknown-profile validation failure                                                    |
| AC-07 Layout                | Passed after review fixes: authored ink/filter bounds, empty/space-only titles, limits, native full-image captures and actual 424-pixel caption/copy checks                                        |
| AC-08 Security/resources    | Passed: parsed safe SVG/internal references, bounded blur/depth/element work, complete export byte limits and adversarial keys                                   |
| AC-09 Determinism           | Passed: byte-identical recompilation, unique multi-run IDs, nine pre-feature output fixtures unchanged                                                           |
| AC-10 Editor                | Passed: both entry points, exact previews, controls, CSS error recovery, import/history/draft/share handling and explicit emission only                          |
| AC-11 Standalone export     | Passed: AST and isolated execution, one complete call, reset-styled exact caption; clipboard and native prompt checks                                            |
| AC-12 Framework/package     | Passed: final installed Node/Bun/TS/React/Next consumers, unchanged package boundaries and data-only root import                                                 |
| AC-13 Qualification         | Passed: all four profiles in actual current-stable Windows Chrome/Edge builds, with required native lifecycle/copy observations                                  |
| AC-14 Documentation/release | Usage, glyph/title limits, local fonts, diagnostics, original artwork/no endorsement and static status documented; Changeset prepared; documentation gate passed |

## Governance, recovery and remaining stages

The canonical index, provider mapping and setup receipt record explicit acceptance and reciprocal succession. Active spec/handover/accessibility/release documents treat the unperformed screen-reader check as follow-up; original dated observations remain historical evidence. The original base specification retains its 24 acceptance criteria; the cinematic specification has 14.

Final documentation validation checks local Markdown paths/anchors, status/ID/index consistency, preserved historical ADR bodies, whitespace/conflict markers and both tracked/untracked changes. Protected-state comparison covers the original 205 files, HEAD, index and older worktree heads. The [original validation receipt](../evidence/cinematic/2026-09-12/validation.json) and [review validation](../evidence/cinematic/2026-09-12/review-validation.json) records a clean result: 19 changed Markdown documents, all local paths/anchors checked, 13 unique ADRs with consistent status, 24 base and 14 cinematic criteria, unchanged historical ADR bodies and all 205 original files/index/heads preserved. The corrected source fingerprint is `17385a871150f9948fb4ad8aa8bc2eb8932b609141cefe57a91fb46610721dc8`.

The source/static discovery trace is `AGENTS.md` → canonical index → ADR-0012 for cinematic data and ADR-0005 for its renderer. A request to accept raw paths, external fonts or arbitrary SVG would still conflict with those decisions and stop the affected change pending an approved successor; no host/agent simulation is claimed.

Recovery: retain the isolated uncommitted work and the previous qualified candidate. Old readers reject cinematic scenes, so preserve exported JSON/local drafts for a compatible reader during a rollback. No storage migration or destructive downgrade occurs.

New-candidate CI, commit/PR, npm publication and hosted promotion are not performed by this slice. Earlier approvals and earlier CI/deployment receipts belong to their earlier snapshots. The source, evidence and Changeset are prepared for review; release/version choice and external actions remain separate authorized work. Screen-reader follow-up does not block launch or publication.
