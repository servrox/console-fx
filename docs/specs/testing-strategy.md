# ConsoleFX testing strategy

**Test contracts once. Use browsers for interactions. Run checks at milestones.**

Status: active strategy, 2026-09-13. The test maintenance is merged in
[PR #22](https://github.com/servrox/console-fx/pull/22). This applies
[ADR-0009](../adrs/0009-validate-changed-contracts-with-proportional-evidence.md)
and the maintainer's request to simplify tests and use Vitest 4. It does not
approve the proposed workbench or change release qualification requirements.

## 1. Choose the smallest useful proof

| What can break? | Proof owner | Scope |
| --- | --- | --- |
| Parsing, literal text, compilation, fitting, export, public APIs | Vitest 4: core contracts | Table-driven valid/invalid behavior; include every supported profile where its data differs. |
| Example recipes and capability resolution | Vitest 4: catalogue contracts | Every registered recipe; shared validation, round-trip and output/export agreement. Capability resolution will be added with the approved feature. |
| History, draft recovery, import failures, clipboard preparation | Vitest 4: session/persistence contracts | Observable transitions and preserved data, including asynchronous races. |
| Artifact integrity, provenance, path safety, recovery | Vitest 4: release integration project | Real temporary files and existing trust-boundary regressions. No registry writes or deployment. |
| Browser wiring, navigation, focus, clipboard, animation controls, CSP | Playwright | One representative per distinct interaction, plus desktop/narrow layouts where behavior differs. |

**Separate external evidence:** real Chrome/Edge DevTools qualify renderer
output. Physical devices and Safari establish their own observations. A unit
test, DOM screenshot or CI browser does not substitute for those checks.

## 2. Keep a test when it protects behavior

- Keep security, data-loss, compatibility and release-integrity regressions.
- Keep distinct paths: named fields, cinematic constraints, ordinary scenes,
  and transient motion have different editor behavior.
- Use the complete catalogue in fast contract tests. New recipes join that
  matrix automatically; they do not each need a browser script.
- Test public results and user-visible state. Avoid private helper snapshots,
  exact incidental copy, and repeating the same flow for every visual style.
- Remove a duplicate only after naming its remaining proof owner below.

Specific input is useful when it reproduces a real failure. “Generalized” does
not mean deleting percent-formatter, Unicode, fitting-limit or recovery cases.
There is no target test-count reduction and no new coverage-percentage gate.

## 3. Current cleanup ledger

Baseline: main `4f93269`; its successful CI run `34772158302` recorded 312 unit
cases, 29 release/artifact cases, 86 studio browser cases and three packed Next
consumer cases. Those are prior-candidate observations, not results for this
change.

The resulting main checkpoint is `e2fdc128a13b3ac0c2965edbfd73868ed3f112ba`.
Its [CI run](https://github.com/servrox/console-fx/actions/runs/34778964221)
passed 342 Vitest cases, 82 studio browser cases and three packed-consumer
journeys. These results cover the merged maintenance; proposed catalogue and
page behavior still requires implementation and its own milestone checks.

| Repetition removed | Remaining proof |
| --- | --- |
| Browser visits to all ten card styles with identical select/preview assertions | `card-presets.test.ts` covers every profile and field contract; `cards.spec.ts` retains one named-field card journey, field edits, restrictions, export, detach/Undo and accessibility. |
| Browser visits to all four cinematic styles before the same editor journey | `cinematic-presets.test.ts` and `cinematic-svg.test.ts` cover every profile; `cinematic.spec.ts` retains cinematic controls, glyph bounds, profile switching, import, export and recovery. Native appearance evidence remains separate. |
| Fourteen repetitions of reference selection/export/Undo and duplicate gallery URI comparisons | `reference-examples.test.ts` validates every recipe and exact export; browser checks keep one selection/Undo journey, complete gallery availability/loading, and motion transfer/draft recovery. |
| Two equivalent reference motion-control journeys | Contract tests retain both motion recipes; one browser journey verifies Play → Show static without changing exported code. |
| Three featured card comparison/export/Undo journeys | `landing/examples.test.ts` checks every authored recipe and export; one representative browser journey retains gallery, hero editing, comparison, transfer and Undo. |

No formatter, persistence, import-race, fitting, adapter or artifact-integrity
cases are removed. Browser cases outside the repeated catalogue tours remain.

The later [amicro selection](workbench-interactions.md) reuses these proof
owners: copy success/failure, keyboard tabs, reduced-motion behavior and
cleanup. Add only the newly introduced interaction obligations at their
implementation milestone; do not test each animation style or timing value.

### Prepared-artifact browser checks

The [second architecture round](architecture-round-2.md) records the findings,
separate fixes and candidate evidence for this ownership cleanup.

- Studio Playwright runs use [the local server](../../scripts/serve-studio.py)
  to serve `.vercel/output/static` and its generated global response headers.
  Run `pnpm run build:vercel` first; missing or incompatible preparation fails
  startup instead of silently dropping the security policy.
- Every studio context receives those headers, including JavaScript-disabled
  pages, workers and assets. The hydration journey checks the actual HTTP
  headers; hydration and font-measurement journeys retain CSP-violation checks.
- The two per-test CSP interceptions are removed. Policy belongs to the server
  interface, so new journeys inherit it without copying setup.
- The JavaScript-disabled journey uses the shared page fixture with a scoped
  browser option. Its trace retention and context cleanup follow the same owner
  as other journeys, including failures during native CDP runs.
- Packed Next consumers retain their own server and generic browser fixture.
  Vercel routing, redirects, caching, deployment protection and CDN behavior
  remain separate hosted checks; this server does not emulate them.

## 4. Use Vitest 4 where it fits

- **Vitest 4.1.11** is pinned in the existing pnpm workspace and lockfile.
- `pnpm test`: run both Vitest projects once.
- `pnpm run test:unit`: core, React and app contracts.
- `pnpm run test:release`: filesystem/artifact integration contracts.
- Keep Playwright for actual browser and installed-consumer journeys.

The release tests retain their assertions and real temporary-file fixtures;
only their runner and cleanup hook change. CI calls `pnpm test` once, avoiding a
second execution of the release project.

Vitest 4 supports the pinned Node 24 toolchain. Inline projects must explicitly
inherit shared configuration with `extends: true`.
[Official migration guide](https://v4.vitest.dev/guide/migration),
[project configuration](https://v4.vitest.dev/guide/projects).

## 5. Run at milestones

1. **Proposal ready:** inspect the source inventory, coverage ledger, Markdown
   links and ADR conflicts. Reuse the dated main baseline; do not rerun the app
   while drafting documents.
2. **Test cleanup complete:** build once, then run formatting, lint, types,
   both Vitest projects and the changed browser journeys as one validation
   batch. Record the actual result in the companion receipt.
3. **Catalogue implementation complete, after approval:** run its contract
   matrix and the affected session tests. Add tests for new behavior, not for
   each metadata row.
4. **Page integration complete, after approval:** freeze the candidate and run
   the required aggregate checks once. Run native qualification only when its
   renderer/profile/output obligations changed.
5. **A check fails:** fix the finding, run its smallest useful proof, then run
   the affected final gate. Do not restart unrelated checks without a reason.

Local, CI, native, package and live-site results stay distinct. This test-only
maintenance does not create a new package release or change the deployed UI.
