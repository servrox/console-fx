# ConsoleFX implementation and launch evidence

Latest improvement addendum (2026-09-12): the [complete improvement list](launch-improvements.md)
and [verification receipt](../evidence/improvements/2026-09-12/README.md) cover eleven
implemented recovery, fitting, Unicode and release-verification corrections. They
supersede older pending statements only for their stated scope, including Firefox
studio coverage. Publication, hosted checks and promotion remain separate.

Current integration addendum (2026-09-12): the [fitting receipt](responsive-fitting-implementation-evidence.md),
[website value receipt](website-value-implementation-evidence.md) and
[website experience receipt](website-experience-implementation-evidence.md) supersede
older pending statements for those slices. They record compact design approval,
implementation, exact package identities, local checks and actual Stable DevTools
qualification. Earlier dated CI/deployment observations below retain their original
scope; they do not qualify this newer integration or imply publication.

Current accessibility policy (2026-09-12): Accepted [ADR-0013](../adrs/0013-keep-screen-reader-review-as-nonblocking-follow-up.md) supersedes ADR-0011. Representative screen-reader/browser review is unperformed, nonblocking follow-up; required automated, keyboard/focus, zoom/reflow and reduced-motion checks remain. Dated receipts below retain their original evidence scope. The new [cinematic candidate](cinematic-metal-presets-evidence.md) requires its own affected-contract checks.


Objective: finish implementation and launch the first MVP under the approved
[specification](console-fx-spec.md). The active goal authorizes implementation
across the delivery phases; publication and deployment still require resolved
exact targets and their mandatory qualification gates. Owner: the implementation
agent in the NixOS `nixos` WSL worktree.

## Baseline and recovery

Started 2026-09-11 at Git revision
`50e63c11f48912bfe2e66686c43fbba8eb12f2c3`. Existing spec/handover modifications,
untracked instructions and eleven Accepted ADRs are protected. The baseline file
hashes and index fingerprint were captured in the session's temporary evidence.
No implementation packages or scripts existed. New work belongs to the owners
defined by ADR-0004. No other agent is editing this worktree.

Keep new implementation changes reviewable and leave the Git index intact.
Before external actions, freeze the exact candidate and satisfy its checks.
Recovery before publication is a scoped reversal of implementation changes,
preserving prior/concurrent work. Package and deployment recovery follow ADR-0010.

## Execution plan

1. Bootstrap the pinned pnpm/TypeScript workspace and compiler; prepare the badge,
   multistyle, static SVG, and finite-motion feasibility fixtures. Observe actual
   Windows 11 Chrome and Edge DevTools before building the full editor.
2. Prove the pure scene, descriptor, preview, safe text/code generation, and
   resource-limit contracts. Implement every required effect and motion with
   static alternatives, without claiming unobserved browser qualification.
3. Build the integrated landing/studio and thin React adapter through public
   package APIs. Prove editing, copying, import/history, local draft recovery,
   conflict confirmation, reset/deletion, and React lifecycle behavior.
4. Finish Next.js recipes, packed-consumer checks, accessibility, CI, all 24
   acceptance criteria, and the complete actual Windows browser matrix.
5. Verify rights, npm names/access and release prerequisites, select the studio
   host, then launch the qualified candidate and inspect the public result.

## Bootstrap decisions and observations

- Environment verified: Linux, `WSL_DISTRO_NAME=nixos`, repository on the native
  Linux filesystem. Git, Node 24.20.0, pnpm 12.3.4, Bun, and Python resolve through
  the Nix-managed Linux toolchain.
- Registry metadata checked on 2026-09-11: Next 16.3.4 and React 19.3.0 have
  compatible peers and support the installed Node. TypeScript 7.0.2 is newer than
  the current typescript-eslint supported range (`<6.1.0`); choose a compatible
  patched TypeScript 6 release. Installation, builds and local tests now pass as
  recorded below; these observations do not imply publication or CI success.
- Selected TypeScript 6.0.3 and Node 24 types 24.13.4 from current registry
  metadata. The first install exposed ESLint 10 peer incompatibilities in Next's
  React/import/accessibility plugins; selected ESLint/@eslint-js 9.39.5 instead
  of weakening peer checks. That older ESLint line is marked deprecated upstream;
  replace it when those plugins support ESLint 10. The corrected install passed
  strict peers with dependency install scripts disabled.
- Use one pnpm lockfile, strict `tsc` ESM/declaration output, ESLint and Prettier,
  Vitest, and Playwright. esbuild is only a test/consumer-size measurement tool,
  not the library distribution compiler.
- Dependency install scripts are denied unless reviewed explicitly. pnpm's
  current `allowBuilds` and `verifyDepsBeforeRun: error` settings avoid implicit
  trust or automatic installs during tests. Pin direct dependencies; apply a
  one-day release-age floor and document any necessary exact-version exception.
- Native Windows browsers were launched in dedicated temporary profiles without
  changing installed user browsers. Chrome for Testing 153.0.8010.36 and a
  signature-verified portable Microsoft Edge 153.0.4234.32 run on Windows 11 25H2
  build 26220.9223. Official stable feeds were checked on 2026-09-11. The Edge
  profile uses Guest mode; no real user profile is used for qualification.
- The default execution sandbox swallowed nested Node subprocess output and exit
  status, producing a misleading Next TypeScript configuration failure. A bounded
  reproduction distinguished this from application failure. Authorized execution
  outside that sandbox made the same build succeed; no application workaround was
  introduced. Loopback and Windows interop checks use that execution context too.
- A separate Chrome profile without automatically opened DevTools is used for
  production studio tests. Native DevTools can override media emulation; isolating
  the studio test profile resolved that test-environment interference.

## Implemented candidate and current checks — 2026-09-11

- `packages/console-fx` owns validation, immutable public descriptors, pure
  CSS/SVG/text compilation, safe literal-percent substitution, finite SVG motion,
  presets and standalone export. `packages/console-fx-react` owns the public
  preview, explicit hook and first-enabled banner. Both are ESM with declarations,
  MIT licenses, README/changelog and explicit export/file allowlists.
- `apps/studio` is a static Next App Router landing page with integrated gallery
  and editor, focused `/studio/`, and `/docs/`. It uses public package APIs. Drafts,
  import/history, conflicts, reset, repeatable clear and failures are local. A
  navigation test found a pending-autosave loss; queued valid edits now flush on
  unmount, page hide and backgrounding while protected/held revisions stay blocked.
- First-release rich composition is one static style effect plus one optional
  motion per run. Unsupported multi-style documents stay valid and exportable as
  JSON/text; rich compilation gives `unsupported-combination`. This applies the
  approved section 4.3 allowance for bounded composition, without changing an ADR
  or dropping a required family/motion. Fifty SVG combination fixtures cover nine
  preset variants plus plain lettering, each static and with each of four motions.
- The full unit suite passes 101 tests, including the navigation regression.
  Application, package and test-file type checks pass. The production build passes
  and generates 98 distinct third-party license/notice texts for the static studio.
  Lint passed for implementation; the new native lifecycle harness received a
  targeted lint correction and passes its own lint check. The formatter check passed over owned source,
  examples, configuration and workflow files.
- Sixteen production desktop/mobile browser journeys passed for editing, silent
  imports, explicit logging, exact clipboard export, history, recovery, reset,
  reduced motion, keyboard focus, automated WCAG 2.2 AA checks and reflow. The complete suite was rerun after the navigation fix and latest build.
  Screenshots: `.artifacts/studio-desktop.png` and `studio-mobile.png`. This is
  automated and visual/keyboard evidence, not a completed screen-reader audit.
- Isolated tarballs passed vanilla JavaScript, TypeScript declarations, React SSR,
  first-enabled/Strict Mode/remount behavior, a production Next build, and real
  Next browser startup/banner/remount tests. Source examples live under `examples/`.
  The adapter's unpublished core dependency is explicitly overridden to the same
  inspected tarball in the temporary consumer; its real semver range is checked
  separately. The exact current tarballs were rechecked in a fresh isolated consumer after
  the CSS/composition/indicator changes; all five consumer checks passed.
- Updated tarballs pass file/export/declaration/peer/license/client-directive
  checks. Each measured CSS and SVG browser consumer is 7,201 gzip bytes; budgets
  are 10,240 and 25,600 bytes respectively. Neither includes React, Next, codegen
  or presets. `.artifacts/packages/` records exact hashes and module inputs.
- The durable [native DevTools evidence bundle](../evidence/devtools/2026-09-11/README.md)
  contains 150 selected observations and 617 original artifacts. Actual native
  observations cover the initial four feasibility fixtures,
  all nine gallery entries and all four motions in both browsers. Chrome's extended
  fifty-combination matrix is observed; four previously cached rainbow images
  retained their finished frames. Fresh rainbow fixtures changed and settled in a
  separate run. This confirms the documented lack of a guaranteed identical-image
  restart. Edge's full matrix also passes the numerical motion checks. All 100 combination
  terminal states were visually reviewed through 53 distinct bitmaps. Generated
  literal-percent snippets, native CSS/caption copying, logging before open,
  reopen, identical output, narrow consoles and offscreen return were observed
  in both browsers. Additional generated default/system-reduce samples pass in both native
  browsers. All four motion-family moving frames and all twenty style/plain wave
frames were also visually inspected without content clipping in those samples.
  The subsequent [scope audit](../evidence/devtools/2026-09-11/release-review.json)
  reconciles all selected native rows and current compiler inputs. These results
  qualify the recorded browser/fixture scope; full public release remains pending.
- Native CSS paint containment clipped glow/shadow edges. Padding was added for
  neon, RGB split and extrusion; the corrected Chrome gallery has been observed.
  The badge indicator also received a dark outline after a cyan-on-cyan visibility
  failure; its corrected Chrome and Edge samples visibly move and settle.
  Only those three initial fixture payloads changed; other initial argument arrays
  were compared and remain identical after the newline and composition corrections.
  Old fixture inputs and observation directories are retained under
  `.artifacts/devtools/` rather than overwritten.
- `.github/workflows/validate.yml` pins official Actions commits and installs the
  locked toolchain, builds, validates, packs, measures and tests isolated consumers
  and the studio. It uploads the exact candidate/evidence and has read-only repository
  permissions. Its first GitHub run passed for the approved source snapshot, as
  recorded below. Changesets is configured for public packages,
  `main`, patch internal-dependency updates and no automatic commits. No publishing
  or deployment workflow has run. A later local update prepares the manual OIDC
  workflow described below.

## Protected hosted verification and release authority

The user selected Vercel and requested creating or using a ConsoleFX project.
Read-only inspection found no existing ConsoleFX project in either available
account. The existing Linux CLI is signed in as `servrox`. It reports a global
pnpm lockfile parsing warning; that unrelated global installation was not changed.

`scripts/prepare-vercel.mjs` prepares the existing production static export as a
Build Output API v3 artifact. It fingerprints each file, generates SHA-256 CSP
allowances for the actual inline scripts, allows only self/data image resources
and controlled inline styles, and requires ownership of any output it replaces.
The current artifact has 36 static files, five inline script hashes and a 480-byte
CSP. Browser tests verified hydration, SVG images, and client navigation with the
prepared CSP. The later hosted observations below verify the deployed headers
and routing separately.

Automatic approval review initially rejected project creation under an inferred
personal scope. The user subsequently explicitly approved creating `console-fx`
in **servrox’s projects**. Creation succeeded and was read back from Vercel:
project `prj_1l26eTv5TAxawo3B7gvcBXl4l5CN`, account
`team_ZMyECTz65A2Bi8v8vYOavwsM` (`servroxs-projects`). The workspace is linked;
local credentials and `.vercel` state are ignored. The inspected upload selects
only 36 static files, routing config and an empty Next build-ID directory;
credentials, source and evidence are excluded. Its file/config manifest fingerprint
is `0bea5491f11323f4234d065d6d1207fcdba6e14841a1872efb0a4584dabfa3f1`.

The user explicitly approved the protected-preview upload after the earlier
automatic approval rejection. Vercel nevertheless classified the first
`--target preview` upload as production and exposed `console-fx.vercel.app`.
The project was paused after discovery and 503 responses were verified. Vercel
Authentication was strengthened from `all_except_custom_domains` to `all`, read
back, and the project resumed. All assigned and deployment URLs then redirected
unauthenticated requests to Vercel sign-in. No public-launch approval was inferred.
The [containment receipt](../evidence/hosting/2026-09-11/first-upload-containment.json)
records the unexpected target, recovery and observation limits. An intervening
preview was blocked because the project was paused and could not build.

The replacement [protected preview](https://console-h1txxfsea-servroxs-projects.vercel.app)
is `dpl_4g7hUC5pNBh7bnGbTGNrTrRThmGB`, target `preview`, state `READY`.
The [hosted receipt](../evidence/hosting/2026-09-11/preview.json) verifies all 36 file
hashes against the approved artifact, the prepared CSP and security headers,
redirects, 404 behavior, immutable assets and complete license delivery. Managed
Playwright Chromium 147.0.7727.15 passed the preset/edit/SVG/copy/export/import/history
journey, reset/focus, draft recovery, client navigation and 390-pixel mobile reflow.
There were no application exceptions, CSP violations or unexpected external app
requests in the sampled journey. The browser's default `/favicon.ico` request
returns 404. These are hosted application checks; the recorded native Windows
Chrome/Edge qualification remains separate. Public promotion is still pending.

The user also approved publishing source snapshot
`89b267022e830c751316ac58ce75f4211373e483e8dc75671bee6dfad0ddea4c` on a feature
branch and opening a draft PR. Its 184 files are committed in the isolated
`.worktrees/console-fx-mvp` worktree as
`736afaf55402846a053e86549282a3acdba1dab7` on `feat/console-fx-mvp`. After an HTTPS
OAuth scope rejection, the existing Linux SSH connection pushed the exact commit
successfully. No credential or OAuth scope change was needed for that push.
[PR #1](https://github.com/servrox/console-fx/pull/1) merged on 2026-09-12 as
`347e7cea6196f9995e7c25b3ee1a5e209e24b02c`; the original
[PR CI run 34627406177](https://github.com/servrox/console-fx/actions/runs/34627406177)
passed. The original index hash was identical before and after the isolated commit
and push. Authored files pass whitespace checks; verbatim upstream license-notice
whitespace is preserved. Later evidence and release-workflow additions remain
outside the approved source commit.

The [initial CI receipt](../evidence/ci/2026-09-11/initial-pr.json) identifies the
Ubuntu 24.04.5 runner, Node 24.20.0, pnpm 12.3.4, lockfile, workflow, artifact and
observed results. The tested pull-request merge commit has the same tree as the
approved head. Build, formatting, lint, types, 101 unit tests, 16 production studio
journeys, package inspection, bundle budgets and five isolated consumer checks
passed. Both downloaded package tarballs match the locally qualified hashes.
The CI static studio build has fingerprint `c9b0235c1fa5cbbe03ad7ccc70b76ef5f40187adb7aa82b4ed67feef70163f20`,
with different build-ID paths, page payloads and CSP hashes from the qualified
`0bea5491…` protected preview. It was not deployed. This run covers the approved
snapshot, not the subsequent local addendum or the publishing workflow's required
successful `main` run.

The [merged-main CI receipt](../evidence/ci/2026-09-12/main.json) records successful
run `34684403898` on merge commit `347e7cea6196f9995e7c25b3ee1a5e209e24b02c`.
Its tree is identical to the approved source. All validation and consumer checks
passed again, and both downloaded package hashes match the qualified local bytes.
Its separate static studio build has fingerprint
`9532970b2144e0c166eeda4f36adf1a7f31fc661d0fe77dee663dc0dc8d269b3` and was not deployed.
The prepared release verifier accepted the real main-run/artifact metadata and
those downloaded packages in a local verification-only check. The publishing
workflow and later addendum remain outside this merged source and CI run.

The initial npm authentication failure was resolved through a user-requested
interactive WSL login. On 2026-09-11, `npm whoami` returned `servrox1337`, and the
organization membership endpoint confirmed that account as an owner of `servrox`.
Both approved package names returned 404 to the authenticated client. No package
was published or reserved. [npm’s current trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
require an existing package and account 2FA. The account's `auth-and-writes` 2FA
mode was verified; the first-publication bootstrap and
subsequent GitHub OIDC configuration remain explicit release steps.

## Additional release preparation

The separate Bun requirement now has an [isolated packed-consumer receipt](../evidence/packages/2026-09-11/bun-smoke.json).
Nix-managed Bun 1.4.2 and Node 24.20.0 both pass the shared public-entry fixture.
Bun rejects a private subpath with `ERR_MODULE_NOT_FOUND`; the original fixture
expected Node's `ERR_PACKAGE_PATH_NOT_EXPORTED`. The fixture now checks the actual
runtime's code, preserving the required rejection. Package bytes did not change.

The [manual OIDC publishing workflow](../../.github/workflows/publish.yml) and
[verification-only helper](../../scripts/verify-release.mjs) are prepared locally
under ADR-0008/0010, outside the earlier approved commit. They bind publication to
successful `main` validation, one identified artifact, the source lockfile/versions
and independently approved tarball hashes. Seven focused tests reject altered
bytes, forged receipts, source/filename drift, failed or foreign CI and expired or
ambiguous artifacts. The actual approved tarballs pass the helper. Changed JS lint
and formatting pass; the final workflows pass Nix-managed actionlint 1.7.12.
Read-only preflight completes before protected-environment approval; publishing
then rechecks the downloaded bytes and alone receives OIDC permission.
npm's trust/bootstrap requirements and GitHub artifact fields
were checked against current primary documentation and read-only API observations.
The [publishing guide](../publishing.md) records the still-unperformed environment,
trust configuration, OIDC execution and registry-install gates.

## Evidence status

| Obligation | Stage | Current result |
| --- | --- | --- |
| Environment, instructions, ADRs, manifests and source inspection | source/static | Verified bootstrap baseline; ADR-0001 through ADR-0011 govern the implementation |
| Core/compiler/exporter and resource-limit tests | local | Implemented; 101-test suite and full type checks passed |
| Studio/React/Next and accessibility | local | Production browser journeys, automated scans and sampled native 200%/400% zoom passed; representative screen-reader/browser review remains nonblocking follow-up |
| Actual Windows 11 Chrome/Edge qualification | local | Required families/motions, full selected matrix, sampled visual review, copying/lifecycle and static policies observed; final source/static scope audit reconciled all selected rows |
| Package contents and isolated consumers | local | Current exact tarballs and fresh isolated consumers pass |
| CI | CI | PR run 34627406177 and main run 34684403898 passed for identical approved trees; downloaded package hashes match; later addendum CI remains pending |
| Published npm packages | publication/install | Pending gates and publication |
| Protected studio | deployed/preview | Exact approved artifact is READY; hosted routes, hashes, headers and critical journeys passed |
| Public studio | deployed/production | Unexpected first production upload contained; all URLs require authentication; public launch gates pending |

The original spec, handover, Accepted decision files and exploratory script remain at their captured
hashes. The root README, mockup status notes and derived ADR index are intentionally updated for the implemented candidate,
while preserving the visual-prototype history. The Git index
has no staged changes; a Git refresh changed its stat-cache fingerprint after an
accidental formatter pass over the original exploratory script. That formatter-only
change was matched against the formatted original and reverted to its exact baseline
bytes. Do not represent the current raw index hash as identical to the initial hash.

## Sources

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports): the
  local-only editor can be hosted without a backend.
- [pnpm build settings](https://pnpm.io/settings/build) and
  [dependency resolution](https://pnpm.io/settings/dependency-resolution): current
  installation trust and release-age mechanisms.
- [React Strict Mode](https://react.dev/reference/react/StrictMode): lifecycle
  replay requires behavior tests; successful rendering alone is insufficient.
- [Vercel Build Output configuration](https://vercel.com/docs/build-output-api/configuration):
  static files, routing and response headers for the prepared deployment artifact.
- [Chrome for Testing stable feed](https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json)
  and [Microsoft Edge enterprise feed](https://edgeupdates.microsoft.com/api/products?view=enterprise):
  current stable browser identity, checked 2026-09-11.

The [release ledger](../releasing.md) maps all 24 acceptance criteria, candidate
hashes, authority and recovery. The [accessibility checklist](../accessibility.md)
records the screen-reader checklist, now nonblocking follow-up under ADR-0013. The original 320 CSS-pixel reflow and
later [native 200%/400% zoom observations](../evidence/accessibility/2026-09-11/native-zoom.json)
are separately recorded; failed early zoom attempts are excluded from passing
evidence. This is a working implementation receipt, not a completed launch receipt.
