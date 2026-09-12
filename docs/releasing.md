# Release candidate and promotion gates

The first MVP candidate is implemented under Accepted ADR-0001 through ADR-0011.
Publication, hosted verification and promotion remain pending. The approved spec
requires all 24 acceptance criteria before the full launch; local checks alone do
not authorize publication or establish CI or production success.

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

Both tarballs pass file/export/declaration/license/peer checks and fresh isolated
JavaScript, TypeScript, React and production Next consumers. Both measured browser
entry consumers are 7,201 gzip bytes, below the 10,240-byte CSS and 25,600-byte SVG
budgets, with no React, Next, codegen or presets accidentally included.

## Acceptance ledger

| Criteria | Available evidence | Remaining gate |
| --- | --- | --- |
| AC-01–06 | Silent imports/compilation, exactly one emission, standalone parity, adversarial percent corpus, SVG structure; local unit and native samples | CI on the source candidate |
| AC-07–09 | Static defaults/fallbacks, preference/error tests, native static system/default samples, finite motion frame comparisons | CI; retain exact browser scope |
| AC-10–11 | Sixteen desktop/mobile production journeys; silent editing, import/history and recovery | CI on the source candidate |
| AC-12–13 | React SSR, first-enabled behavior, Strict Mode, toggles and true remount; packed Next startup/banner consumer | CI on the source candidate |
| AC-14–15 | Inspected tarballs, bundle input graphs, fresh isolated JS/TS/React/Next installs | Package-consumer CI and post-publication install |
| AC-16 / AC-19 | [Native Windows matrix](evidence/devtools/2026-09-11/README.md), all required families and motions, 100 combinations, sampled visual review, copying/lifecycle/narrow behavior | Final release review of the recorded scope |
| AC-17 | Resource boundaries, invalid-data and generated-source tests in the 101-test suite | CI on the source candidate |
| AC-18 | Automated accessibility, focus/reduced-motion checks, 320 CSS-pixel reflow, recovery journeys | [Manual screen-reader and native zoom checklist](accessibility.md) |
| AC-20–22 | Immutable descriptors, typed validation/preview, UTF-8 sizes, explicit renderer/default/error/fallback contracts | CI on the source candidate |
| AC-23 | Draft/resume/conflict, corrupt/quota/unavailable storage, reset, repeatable clear and queued-write regressions | CI and representative manual accessibility review |
| AC-24 | Core, studio, adapter, Next recipes, MIT files, generated notices, npm ownership and selected Vercel project | Release authority, CI, publication, hosted checks and promotion |

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
`validate.yml` workflow builds, checks, packs, tests and uploads candidate evidence;
it has not run remotely. Source publication/PR preparation and the CI run need
their authorized GitHub step. A publishing workflow must consume the identified,
validated artifact and verify its hash before publishing, with exact version/tag
approval and appropriate environment protection. A partially qualified preview
release must use a non-default prerelease tag and accurately describe its scope.

## Studio target and recovery

The user approved and creation/readback confirmed the personal Vercel project
`servroxs-projects/console-fx`, ID `prj_1l26eTv5TAxawo3B7gvcBXl4l5CN`.
Authentication protection is enabled. Project creation did not create a deployment.
Automatic approval review rejected the prepared protected-preview upload because
it required separate deployment authorization; explicit approval is pending.

After that approval, deploy the inspected prebuilt artifact explicitly to
`preview`. Read back target, protection and ready state, then inspect routing,
redirects, 404 behavior, asset hashes, licenses, CSP and the complete studio journey
on the hosted URL. Keep the existing protection. Local routing/CSP checks do not
establish these hosted results. Production promotion follows completed launch
gates and exact-target authority; prefer promoting the same artifact without
rebuilding.

There is no prior production deployment or published package to roll back to.
Before first promotion, the reversible point is the protected preview with its
source/artifact receipts. A failed preview remains unpromoted. After publication,
use a corrective package version or an explicitly authorized dist-tag rollback;
do not rely on unpublishing. After a later deployment, retain the prior verified
deployment for rollback. Draft JSON and readable text fallback remain available
independently of decorative renderer changes.
