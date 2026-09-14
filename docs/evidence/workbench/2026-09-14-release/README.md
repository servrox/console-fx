# Workbench release — 14 September 2026

**The workbench, updated usage video and both 0.2.0 packages are live.**

- [PR #26](https://github.com/servrox/console-fx/pull/26) merged as
  `40fc81efa5e0579cf04476390b7324231db119fc`. Its tree is identical to reviewed
  source `540676ec45b8eb3be390a123d61006236714d785`.
- [PR CI](ci-pr.json) and [merged-main CI](ci-main.json) passed. The repository's
  release verifier accepted the main run and both downloaded 0.2.0 tarballs.
  Their SHA-256 values match the qualified local candidate exactly.
- [Protected preview](protected-preview.json) and
  [public production](public-production.json) passed representative desktop and
  390 px browser journeys: four cinematic designs, six tabs, all 43 catalogue
  entries, exact copying, one explicit emission, import/Undo, invalid-import
  recovery, Reset cancellation/focus, draft reload and captioned video playback.
- The three pages' actual inline scripts match their served CSP. Twenty-one
  executable/style/media/notice files match PR CI byte for byte. Vercel returns
  403 for one debug source map. Generated build IDs differ between builds;
  this is not a claim that the complete remote artifact equals the CI archive.
- [Production deployment](deployment.json) came from the Git connection on
  `main`. All [three production aliases](domains.json) return 200. Preview and
  immutable deployment URLs redirect to Vercel authentication. The temporary
  preview share was [revoked](preview-revocation.json).
- Both packages are [published under `next`](registry-pair.json). Downloaded
  registry bytes and SHA-512 integrity match the approved main CI tarballs.
  The adapter depends on core `^0.2.0` and declares React `^19.0.0` as a peer.
- The [registry-only consumer matrix](registry-consumers.json) passed fresh
  JavaScript, TypeScript, React SSR/first-enabled/Strict Mode/remount, displayed
  website recipes, Next production build/SSR and three Next browser journeys.
  Installation used exact registry names/versions, without local package overrides.
- The [preservation check](preservation.json) confirms that 18 other worktree
  heads/indexes and 205 original-checkout files stayed unchanged.

| Approved package | SHA-256 |
| --- | --- |
| `@servrox/console-fx@0.2.0` | `8ff381db98d4e40ae3660610c4500487ec377bb927051cc4cedd173e33413043` |
| `@servrox/console-fx-react@0.2.0` | `8e513ab2d4d480a6d9edb0f80df598d7dd07e36e2ae2a01ee3c0ea43441fde10` |

The npm target is `next`; `latest` remains 0.1.0. Both npm browser confirmations
completed. Package recovery uses a
corrective release or separately approved tag change. The preceding production
deployment remains identified in the deployment receipt for recovery.

The [implementation/native receipt](../2026-09-14/README.md) owns the 413 local
checks, 51 studio journeys, installed tarball matrix, v1 compatibility and actual
Windows Chrome/Edge observations. Those results are distinct from hosted page
checks and registry installation. These records contain owned ConsoleFX samples,
public package identities and selected metadata; no credentials or access links.

Governing decisions: ADR-0015 through ADR-0018 for fitting/workbench behavior;
ADR-0002, ADR-0004, ADR-0008 through ADR-0010 for compilation, packaging and
delivery. Participant study, physical laptop/phone performance and real Safari
observations remain open. Screen-reader follow-up is nonblocking under ADR-0013.
