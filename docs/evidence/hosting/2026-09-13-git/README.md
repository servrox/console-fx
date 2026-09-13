# Git-connected deployment repair — 2026-09-13

The maintainer requested automatic deployments through the existing GitHub
connection on pushes to `main`. [PR #17](https://github.com/servrox/console-fx/pull/17)
moved Vercel configuration to the workspace root, enabled `main`, and shared the
ordered package/studio/CSP build entrypoint with GitHub CI. The project remains
`servroxs-projects/console-fx`; root directory is empty, framework is Other,
Node.js is 24.x, and `ENABLE_EXPERIMENTAL_COREPACK=1` applies to Preview/Production.

## Verified stages

- **Source/local:** the full workspace build and preparation produced 50 static
  files and the existing hash-based CSP. All 29 artifact/release tests passed.
  Independent Standards and Spec reviews found no remaining source findings.
- **CI:** [final PR run](https://github.com/servrox/console-fx/actions/runs/34747948001)
  and [merged main run](https://github.com/servrox/console-fx/actions/runs/34748153480)
  passed. The merge commit is `c87897057f7e0141191e4ae6e5489762a92db99d`.
- **Protected Git-source preview:** deployment
  [`dpl_EMZwN97eqhK3LoPJhnfeH35oFWLX`](https://vercel.com/servroxs-projects/console-fx/EMZwN97eqhK3LoPJhnfeH35oFWLX)
  built commit `f72ad7a7976c23c6868117873fd2d496ff70f1d6` with pnpm 12.3.4.
  Ten hosted workflows, generated headers/routes, 40 sampled served-file hashes,
  notices/video integrity, captions, and 390 px reflow passed in native Chrome
  153.0.8010.36, with no CSP/page/request errors. Its temporary test share was revoked.
- **Git trigger:** the main merge automatically created
  [`dpl_7fH5cp4xLojPqePFfUzp1x66woT3`](https://vercel.com/servroxs-projects/console-fx/7fH5cp4xLojPqePFfUzp1x66woT3)
  with `source: git`, `target: production`, and `readyState: READY`.

## Production domain repair

The first successful Git deployment updated `console-fx.vercel.app`. The two
previously public aliases still pointed to `dpl_D4D4s3vQDqEGWom52kzZascti5rb`:
they were manual aliases and had no project domain records. Both are now verified
project domains with no preview-branch binding, so they follow Production:

- `console-fx-servroxs-projects.vercel.app`
- `console-fx-git-main-servroxs-projects.vercel.app`

The subsequent main push validates that persistent domain configuration. Its exact
deployment and public browser checks are recorded with the follow-up PR and in
the local `.artifacts/deployment/git-main/` receipts. Deployment protection remains
`prod_deployment_urls_and_all_previews`; production domains are public and previews
and individual deployment URLs require Vercel Authentication. The prior verified
deployment remains the rollback point described in the [release guide](../../../releasing.md).

Git builds create new remote artifacts. The 40 sampled responses above do not
claim an independently downloaded complete remote artifact or new renderer/device
qualification. No package was republished. The [completion audit](../../../specs/mvp-completion-audit.md)
retains the separate external study/device/Safari requirements; screen-reader
follow-up remains nonblocking under ADR-0013. ADR-0004, ADR-0007, ADR-0008,
ADR-0009 and ADR-0010 govern this repair.
