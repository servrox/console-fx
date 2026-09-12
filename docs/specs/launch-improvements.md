# Launch improvement pass — 2026-09-12

Status: all eleven improvements implemented and locally verified. Live registry
installation still requires publication; CI/merge status is recorded separately.
Baseline: merged `main` commit
`3316574868716ac673e1e3ba73e9da272aaa9c30`, tree `b1fe82c9e64110587d6696fc8826f7847d2c78d6`.
The maintainer requested: “look for improvements -> create a list with all -> implement it.”
The following is the complete concrete list from the independent Standards/Spec audits
and native Chrome recovery checks. Each item is within the existing product contracts.

| ID | Improvement and observed problem | Implementation and verification obligation | Status |
| --- | --- | --- | --- |
| IMP-01 | Respect WORD JOINER/no-break boundaries and handle missing `Intl.Segmenter`. `A \u2060B` can split after its space, and unavailable segmentation currently throws raw `TypeError` past fallback. | Preserve joined text across styled runs; retain whole text with a diagnostic when segmentation is unavailable. Test fitting/fallback/standalone parity, native affected samples and unchanged legacy output. | Implemented; verified |
| IMP-02 | Preserve keyboard focus when applying fitting. Keying the entire inspector by settings replaces the focused Apply button and moves focus to the document body. | Synchronize fitting controls with imported/applied/undone settings without replacing the inspector; keep invalid numeric drafts editable. Verify Apply/Remove/Undo and number-field focus. | Implemented; verified |
| IMP-03 | Contain ResizeObserver construction and observation failures. Either can currently remove the editor subtree. | Clean up owned observers/frames and show a truthful unavailable state while editing and export remain usable. Test missing, throwing constructor and throwing observe. | Implemented; verified |
| IMP-04 | Show motion-enabled fitting diagnostics while keeping simulation static. The current static overlay is described as including motion bounds although a finite-wave export can overflow. | Label the static overlay accurately and separately evaluate the complete enabled-motion envelope for the chosen fitting policy. Verify a static-fit/motion-overflow case without starting animation or printing. | Implemented; verified |
| IMP-05 | Align numeric UI limits with the compiler. Padding/Corners offer 80 where validation permits 64. | Restrict sliders to accepted bounds and verify boundary edits. The initially suspected precision issue was withdrawn: the existing two-decimal calculation is correct. | Implemented; verified |
| IMP-06 | Recover the exact blocked clipboard payload. A denied share-link copy only suggests copying unrelated generated code and offers an irrelevant storage-retry button. | Provide selectable captured source or share URL, prevent overlapping copy attempts, and show storage retry only for actual storage failures. Test denied/pending clipboard and successful recovery. | Implemented; verified |
| IMP-07 | Discard obsolete asynchronous file reads. A delayed import currently replaces a later confirmed Reset; old rejected reads can also report errors after a newer action. | Tie completion and errors to the current document/action generation; cancel reads when replacement dialogs open. Preserve edits, presets, Reset and newer imports, including pending-dialog cancellation and Undo. | Implemented; verified |
| IMP-08 | Make availability copy match the implementation. Compact layouts are described as unapproved, and renderer/container notes retain obsolete qualification wording. | Describe approved compact cards and the recorded Windows qualification accurately; keep experimental container readability limits explicit and publication claims truthful. Review affected copy and links. | Implemented; verified |
| IMP-09 | Preserve the exact consumer dependency graph. Consumer receipts omit their generated lockfile and effective configuration, which otherwise live only in a temporary directory. | Archive lockfile/configuration and their hashes, effective manifests, harness inputs and tool versions alongside each consumer receipt. Verify receipt identities locally; CI archives the same files for independent readback. | Implemented; local verified, CI recorded separately |
| IMP-10 | Add the required registry-consumer verification path. The current consumer runner always installs local tarballs with a core override. | Support exact registry versions with independently checked integrity, no local dependency override, and narrow reviewed first-release age exceptions. Reuse JS/TS/React/Next journeys; record registry results only after publication. | Implemented; negative verifier tests pass; registry run pending publication |
| IMP-11 | Honor the requested test browser. The fixture currently always launches Chromium. | Select the configured Playwright browser, retain explicit native Chromium CDP support, and reject incompatible combinations. Exercise Firefox where the available environment supports it; distinguish setup failures from browser results. | Implemented; verified |

## Governance and evidence

ADR-0002 through ADR-0010, ADR-0013 and ADR-0015 govern these corrections; the approved
ADR-0012/0014 visuals remain the comparison references. No new shared schema, renderer,
backend, telemetry, dependency family or accepted ADR change is proposed.

The task worktree is `.worktrees/console-fx-integration`, branch
`feat/console-fx-launch-polish`. The original root checkout and Git index are protected.
The [durable evidence receipt](../evidence/improvements/2026-09-12/README.md) contains
candidate fingerprints, validation logs, native Unicode captures, consumer environment
files and independent review closure. Read-only audits and pre-fix observations are
retained locally under `.artifacts/improvements/`.

The final implementation also cancels pending imports when shared/example/Reset
confirmation opens, so cancellation keeps the work that was visible before the dialog.
Changing export motion preserves staged fitting settings. Font-preflight lookahead now
lives only in the optional preflight resolver, keeping the compiler within the original
25 KiB gzip budget without removing diagnostics or weakening bounds.

Local validation: 260 unit tests; eight release-verifier tests; types, lint, formatting,
build, package and bundle checks; fresh JS/TS/React/Next consumers; 68 full Chrome
journeys followed by 22 final recovery cases and two corrected input-fixture cases;
22 final Edge recovery cases; all 72 Firefox cases covered by 70 initial passes plus
two corrected fixture reruns. Sixteen actual native DevTools rows pass across the
recorded Stable Chrome/Edge builds. 411 output/export/preflight comparisons across
187 unchanged fixtures match the merged baseline. Both independent review axes are
closed. None of these local results claims remote CI, registry installation or deployment.

npm publication and deployment have not been authorized for a refreshed candidate.
The five-developer study, physical mobile, integrated-GPU laptop and Safari observations
remain external promotion items. Screen-reader review stays nonblocking under ADR-0013.
