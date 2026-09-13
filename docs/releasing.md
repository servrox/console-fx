# Release candidate and promotion gates

Current website status: the [architecture/video deployment](evidence/hosting/2026-09-13-video/README.md)
is READY and promoted; making the production domains public remains pending.
The core package has been published; the React package and registry-consumer
verification remain pending. The dated ledgers below retain their original scope.

The first MVP candidate was implemented under ADR-0001 through ADR-0011.
Accepted ADR-0013 now supersedes ADR-0011: missing screen-reader observations are
a nonblocking follow-up. Required automated, keyboard/focus, zoom/reflow and
reduced-motion checks remain. Cinematic presets follow Accepted ADR-0012 and have
a separate [candidate ledger](specs/cinematic-metal-presets-evidence.md); the dated
artifacts below do not qualify that new implementation.
Earlier MVP candidates passed protected hosted verification and merged `main`
CI within the dated scopes below; publication and public promotion remain pending. The approved spec
requires all 24 acceptance criteria before the full launch; local checks alone do
not authorize publication or establish CI or production success.

## Current architecture candidate — 2026-09-12–13

The [architecture improvement receipt](specs/architecture-improvements-evidence.md)
is the current status pointer for six review/fix passes starting at merged PR #10
(`e80f1fc`). It replaces older candidate hashes for readiness decisions. Its source,
local, package and CI observations are identified separately; the earlier approval
for `0bea5491…` remains limited to that historical protected preview. The subsequent
[usage walkthrough](specs/usage-video-evidence.md) belongs to this newer candidate.

The maintainer later explicitly approved the PR #10 core `61672e00…`, React
`eefa4f0b…`, and studio `298aaa32…` packet for npm `next` and an authenticated
preview. That approval selects those preserved bytes, not a replacement build.
The studio upload is READY and its [hosted verification passed](evidence/hosting/2026-09-13/README.md).
Both npm names remain absent after authentication/publication failures; the same
receipt records recovery without changing the approved tarballs. Public production
promotion remains separate. Optional Vercel preview Toolbar injection was disabled
for this project after a served-runtime hash/CSP conflict; authentication stays on
all URLs.

The [prior improvement receipt](specs/launch-improvements.md) records completed
Firefox observations. Missing physical mobile, integrated-GPU laptop, Safari and
five-developer observations remain explicit promotion items. Screen-reader review
is nonblocking under ADR-0013. No new candidate is published or deployed by these
architecture passes.

`pnpm run prepare:vercel` verifies existing output against its ownership receipt,
stages a complete replacement, and retains prior output and receipts in the
reported `.vercel/.console-fx-preparation-*` recovery directory. It restores them
if a normal replacement fails. Changed/unowned output is preserved and rejected.
An interrupted preparation or failed restoration leaves
`.vercel/console-fx-preparation.lock/recovery.json` and recovery files; inspect and
reconcile those before removing the lock. This is exception recovery, not an
atomic multi-file transaction across process termination or filesystem failure.
Legacy ownership receipts verify all file/configuration hashes; new receipts also
record directory membership. Legacy recovery copies retain empty directories.

## Historical fitting integration candidate — 2026-09-12

The [fitting/compact receipt](evidence/fitting/2026-09-12/README.md) and
[website receipt](evidence/website/2026-09-12/README.md) supersede older pending
statements for the new implementation. ADR-0014/0015 and all ten compact references
are accepted. Independent product/harness reviews, 257 units, fifty final studio
checks, package/consumer checks and recorded Stable Windows native qualification
are complete within their documented scopes. Exact-head integration/main CI remains
pending; older CI below does not qualify the new source.

| Artifact | Version / SHA-256 |
| --- | --- |
| Core tarball | `0.1.0` / `bea698087b6148bbf55fc8022bd48af35a67e0f8e951202cbca494a7b5b1d8e0` |
| React tarball | `0.1.0` / `eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c` |
| Prepared studio manifest | `aa7a9211c35610a25848d0d974a0d1315408d61d264fd5f601259eb2a2f6c781` |

The packages retain MIT rights, no new runtime dependency, system fonts and original
artwork. The final studio includes its generated notices. Package names/access
must be rechecked immediately before publication. The tested packages and prepared
studio have not been published or deployed. The earlier approval for studio artifact
`0bea5491…` does not approve this newer upload.

Current Vercel preflight confirms `servroxs-projects/console-fx`, configured root
`apps/studio`, with authentication covering all URLs. Two recent Git-triggered
production attempts failed; neither is the reviewed upload. The project-root
[Git deployment setting](../apps/studio/vercel.json) disables automatic deployments
in accordance with the explicit artifact/promotion boundary. Manual prepared-output
upload remains available after exact-artifact approval; hosted checks precede any
production promotion. Keep authentication on all URLs until public launch is approved.

At this historical checkpoint, the five-developer study, physical mobile,
integrated-GPU laptop, Safari and Firefox observations were unperformed and required explicit consideration before public
promotion. Narrator/NVDA review is already nonblocking under ADR-0013. No exception
for the other missing observations is inferred from the compact-design approval.
There is no prior qualified public release to roll back to: retain the protected
candidate and the tested ability to pause/protect the project. Published-package
recovery uses a corrective version or explicitly approved dist-tag change.

The remainder of this ledger is dated historical evidence for the earlier MVP.

## Identified candidate — 2026-09-11

| Artifact | Version / SHA-256 |
| --- | --- |
| `@servrox/console-fx` | `0.1.0` / `5740c25432bf5e88abf6c0b65560383a6daeeb27694a59c85432b680c20350e1` |
| `@servrox/console-fx-react` | `0.1.0` / `51a2f2dd752718e8905a1955db7a83486125c469a6247ac2b29b1a7a04f2017a` |
| Prepared studio manifest | `0bea5491f11323f4234d065d6d1207fcdba6e14841a1872efb0a4584dabfa3f1` |

The studio fingerprint hashes canonical JSON containing the ordered static-file
hashes and routing-config hash. Its inspected upload contains 36 static files,
routing config and an empty Next build-ID directory. Local credentials, source,
Git data and evidence are excluded. The exact tarballs, consumer and bundle
receipts live under `.artifacts/packages/`; deployment inputs live under
`.artifacts/deployment/`. Repack or rebuild after changes to an affected artifact.

The [Bun 1.4.2 smoke receipt](evidence/packages/2026-09-11/bun-smoke.json) separately
verifies packed core consumption with the existing Nix-managed runtime. Node and
Bun both reject private subpath imports, using their recorded runtime error codes.

Both tarballs pass file/export/declaration/license/peer checks and fresh isolated
JavaScript, TypeScript, React and production Next consumers. Both measured browser
entry consumers are 7,201 gzip bytes, below the 10,240-byte CSS and 25,600-byte SVG
budgets, with no React, Next, codegen or presets accidentally included.

## Acceptance ledger

CI below includes [main run 34684403898](https://github.com/servrox/console-fx/actions/runs/34684403898)
for merge commit `347e7cea6196f9995e7c25b3ee1a5e209e24b02c`, whose tree matches
the approved snapshot and earlier successful PR run. The later local
release-workflow, Bun fixture and evidence update still needs its own final CI run.

| Criteria | Available evidence | Remaining gate |
| --- | --- | --- |
| AC-01–06 | Silent imports/compilation, exactly one emission, standalone parity, adversarial percent corpus, SVG structure; local/CI unit checks and native samples | None for the approved snapshot |
| AC-07–09 | Static defaults/fallbacks and preference/error tests locally and in CI; native static samples and finite motion frame comparisons | Retain the recorded native browser scope |
| AC-10–11 | Sixteen desktop/mobile production journeys locally and in CI; silent editing, import/history and recovery | None for the approved snapshot; screen-reader follow-up is nonblocking |
| AC-12–13 | Local/CI React SSR, first-enabled behavior, Strict Mode, toggles and true remount; packed Next startup/banner consumer | None for the approved snapshot |
| AC-14–15 | Local/CI tarball inspection, bundle input graphs and fresh isolated JS/TS/React/Next installs; CI tarballs match local hashes | Post-publication registry install |
| AC-16 / AC-19 | [Native Windows matrix](evidence/devtools/2026-09-11/README.md), all required families and motions, 100 combinations, sampled visual review, copying/lifecycle/narrow behavior; [final scope audit](evidence/devtools/2026-09-11/release-review.json) passed | Retain the recorded browser, theme, timing and fixture scope; requalify affected changes |
| AC-17 | Resource boundaries, invalid-data and generated-source tests in the local/CI 101-test suite | None for the approved snapshot |
| AC-18 | Automated accessibility, focus/reduced-motion checks, 320 CSS-pixel reflow, native 200%/400% zoom and recovery journeys | None for the recorded required observations; [screen-reader follow-up](accessibility.md) is nonblocking |
| AC-20–22 | Local/CI immutable descriptors, typed validation/preview, UTF-8 sizes and explicit renderer/default/error/fallback contracts | None for the approved snapshot |
| AC-23 | Local/CI draft/resume/conflict, corrupt/quota/unavailable storage, reset, repeatable clear and queued-write regressions | Screen-reader follow-up is nonblocking |
| AC-24 | Core, studio, adapter, Next recipes, MIT files, generated notices, npm ownership, initial CI and protected hosted checks | Final addendum CI, release authority, publication and public promotion |

## Rights, accounts and automation

ConsoleFX source and both package manifests/licenses use the approved MIT choice.
The core has no runtime dependencies; the React adapter depends on that core and
declares React as a peer. Studio visuals use system fonts, generated CSS/SVG and
source UI elements. Design mockups and Windows browser binaries are not deployed
or packed. The static studio includes complete React/Next and vendored notices,
including build-only components. No paid assets or external fonts were added.

Authenticated npm inspection confirmed `servrox1337` as an owner of the `servrox`
organization. Both requested names returned 404; they are not reserved by this
check. Recheck identity, exact names and versions before publication. npm's current
[trusted-publisher prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
require an existing package, write access and account 2FA. The first publish needs
an explicitly approved bootstrap; subsequent releases should use the authorized
GitHub workflow and OIDC under the spec. No long-lived publishing token, trust
configuration, placeholder package or unattended publishing workflow was created.

Changesets is configured and its status command succeeds. The read-only
`validate.yml` workflow builds, checks, packs, tests and uploads candidate evidence.
The user approved branch creation, pushing and a draft PR
for source snapshot `89b267022e830c751316ac58ce75f4211373e483e8dc75671bee6dfad0ddea4c`.
That exact snapshot is committed as `736afaf55402846a053e86549282a3acdba1dab7`
on `feat/console-fx-mvp` in an isolated worktree. The existing Linux SSH connection
successfully pushed it. [PR #1](https://github.com/servrox/console-fx/pull/1)
was merged on 2026-09-12 as `347e7cea6196f9995e7c25b3ee1a5e209e24b02c`.
No login refresh is needed. The original worktree and index were preserved.
The [first CI receipt](evidence/ci/2026-09-11/initial-pr.json) records passing build,
format, lint, types, 101 unit tests, 16 studio journeys, package inspection,
bundle budgets and all five isolated consumer checks. The tested PR merge tree
matches the approved head tree. Both downloaded tarballs exactly match the
qualified local hashes above. CI produced a separate studio build; it was not
deployed and does not replace the qualified protected-preview artifact.
The subsequent [main CI receipt](evidence/ci/2026-09-12/main.json) records another
successful complete validation and the same qualified tarball hashes. The prepared
release verifier also accepted that real main-run metadata and downloaded packages
in a local verification-only check. Its manual publishing job has not run.
Later evidence and release-workflow additions remain outside the merged snapshot
and are prepared for a separate follow-up PR.
A manual [OIDC workflow and verifier](publishing.md) are now prepared locally as
part of that later update. Seven focused verifier tests and checks against the
actual tarballs pass. The workflow requires successful validation of the same
`main` commit and checks independently approved hashes before publishing those
tarballs. Remote execution, protected-environment setup and per-package trust
configuration remain unperformed. A partially qualified preview
release must use a non-default prerelease tag and accurately describe its scope.

## Studio target and recovery

The user approved and creation/readback confirmed the personal Vercel project
`servroxs-projects/console-fx`, ID `prj_1l26eTv5TAxawo3B7gvcBXl4l5CN`.
The user subsequently approved uploading the exact artifact to a protected preview.
Vercel unexpectedly classified the first explicit preview upload as production and
served the app publicly on `console-fx.vercel.app`. The project was paused immediately
after that was detected; all three existing URLs were verified to return 503.
Authentication was then strengthened to cover **all** URLs, verified through the API,
and the project resumed. All assigned and deployment URLs were verified to redirect
unauthenticated requests to Vercel sign-in. The [containment receipt](evidence/hosting/2026-09-11/first-upload-containment.json)
records this deviation; third-party access during the public interval was not investigated.

The completed replacement is [protected preview `dpl_4g7hUC5pNBh7bnGbTGNrTrRThmGB`](https://console-h1txxfsea-servroxs-projects.vercel.app),
with target `preview` and state `READY`. Its [hosted receipt](evidence/hosting/2026-09-11/preview.json)
verifies all 36 static-file hashes, redirects, 404 handling, license delivery,
security headers, immutable asset caching, hydration, exact SVG loading, copying,
import/history, reset, draft recovery, client navigation and mobile reflow.
No application exception or CSP violation occurred. The default browser request
for `/favicon.ico` returns 404. Managed Chromium 147 performed these hosted checks;
the separate native Windows Chrome/Edge matrix remains the renderer qualification.
Public promotion follows completed launch gates and exact-target authority;
prefer promoting the same artifact without rebuilding. Retain authentication on
all URLs until that step is explicitly authorized.

There is no prior qualified public release or published package to roll back to.
The unintended first production deployment remains protected and is not an approved
launch. The reversible point is the protected candidate with its source/artifact
receipts; pausing the project was exercised and verified. A failed preview remains
unpromoted. After publication,
use a corrective package version or an explicitly authorized dist-tag rollback;
do not rely on unpublishing. After a later deployment, retain the prior verified
deployment for rollback. Draft JSON and readable text fallback remain available
independently of decorative renderer changes.
