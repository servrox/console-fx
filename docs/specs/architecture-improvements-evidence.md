# Architecture improvement evidence

Baseline: `e80f1fc51ab4eec7543039c6a957da48ac8587fd`.
Worktree: `.worktrees/console-fx-integration`.
Branch: `feat/console-fx-architecture-passes`.
Scope: the [six review/fix passes](architecture-improvements.md), with each
finding handled separately. The original checkout and index remain protected.

The focused checks pass: three clipboard, six export-preparation, ten session,
28 persistence, 32 generated-source/grammar and 25 release/artifact checks.
These are overlapping contract groups, not an aggregate unique-test count.
The final aggregate build/browser/package gate is in progress. CI for this new
candidate has not run. Older merged CI remains historical evidence.

Re-preparation of the existing 46-file studio retained exact content and routing/
CSP hashes. The shared candidate reader verified the historical downloaded main-CI
tarballs from run `34716690235` without changing their receipt. These checks prove
the new tooling against existing artifacts; they do not qualify old artifacts as
the new source. Local detailed receipts are under `.artifacts/architecture/`.

Package publication, registry installation and deployment of this candidate have
not occurred. The five-developer study, physical mobile, integrated-GPU laptop
and Safari remain external follow-ups before public promotion. Narrator/NVDA
review stays nonblocking under Accepted ADR-0013. Previous Firefox observations
remain dated evidence in the [prior improvement receipt](launch-improvements.md).
