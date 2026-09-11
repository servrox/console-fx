# ConsoleFX implementation and launch evidence

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
  frames were also visually inspected without content clipping in those samples. No full qualification claim is made yet.
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
  permissions. It has not run on GitHub. Changesets is configured for public packages,
  `main`, patch internal-dependency updates and no automatic commits. No publishing
  or deployment workflow is enabled.

## Vercel preparation and unresolved authority

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
prepared CSP. This is local header behavior, not hosted Vercel routing evidence.

Automatic approval review initially rejected project creation under an inferred
personal scope. The user subsequently explicitly approved creating `console-fx`
in **servrox’s projects**. Creation succeeded and was read back from Vercel:
project `prj_1l26eTv5TAxawo3B7gvcBXl4l5CN`, account
`team_ZMyECTz65A2Bi8v8vYOavwsM` (`servroxs-projects`). The workspace is linked;
local credentials and `.vercel` state are ignored. Vercel authentication protection
is enabled with `all_except_custom_domains`; there are no deployments or domains.
No protection setting was changed.
An inspected dry run selects only the prepared static output (36 files plus
  routing config and an empty Next build-ID directory); credentials/source/evidence
  are excluded. The file/config manifest fingerprint is
  `0bea5491f11323f4234d065d6d1207fcdba6e14841a1872efb0a4584dabfa3f1`.
  Automatic approval review rejected the subsequent protected-preview upload because
  project creation approval did not cover deployment. Explicit approval for that
  concrete preview artifact has been requested; no deployment exists.

Deployment protection, exact hosted URLs, remote runtime/CSP checks, promotion and
rollback remain separate steps after the target and candidate gates are resolved.

The initial npm authentication failure was resolved through a user-requested
interactive WSL login. On 2026-09-11, `npm whoami` returned `servrox1337`, and the
organization membership endpoint confirmed that account as an owner of `servrox`.
Both approved package names returned 404 to the authenticated client. No package
was published or reserved. [npm’s current trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
require an existing package and account 2FA; the first-publication bootstrap and
subsequent GitHub OIDC configuration remain explicit release steps.

## Evidence status

| Obligation | Stage | Current result |
| --- | --- | --- |
| Environment, instructions, ADRs, manifests and source inspection | source/static | Verified bootstrap baseline; ADR-0001 through ADR-0011 govern the implementation |
| Core/compiler/exporter and resource-limit tests | local | Implemented; 101-test suite and full type checks passed |
| Studio/React/Next and accessibility | local | Production browser journeys and automated scans passed; manual screen-reader/native zoom review remains |
| Actual Windows 11 Chrome/Edge qualification | local | Initial required families/motions observed; full matrix, sampled visual review, copying/lifecycle and static policies observed; final release review pending |
| Package contents and isolated consumers | local | Current exact tarballs and fresh isolated consumers pass |
| CI | CI | Workflow written; no remote run |
| Published npm packages | publication/install | Pending gates and publication |
| Public studio | deployed/production | Vercel selected; local artifact/CSP prepared; personal project created and linked; launch gates pending |

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
records the remaining manual gate; 320 CSS-pixel reflow passes on all three routes,
while attempted native zoom automation did not change the measured scale and is
not a pass. This is a working implementation receipt, not a completed launch receipt.
