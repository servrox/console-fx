# MVP implementation and release completion audit

Audited September 13, 2026. **Implementation and the authorized public release
are delivered. Full-spec completion remains pending three external validation
items:** five-developer formative sessions, performance recordings on an actual
integrated-GPU laptop and physical phone, and Safari website observations. The
[prepared packet](../validation/mvp-external-review.md) provides tasks, fixtures,
measurement conditions and result templates. No participant/device result or
waiver is inferred from publication approval. The active goal remains open.

## Source and release identity

The implementation baseline is `50e63c11f48912bfe2e66686c43fbba8eb12f2c3`.
Reviewed source `9423f7eb0269d7d428799fedf82d5f3977392e99` merged through
[PR #15](https://github.com/servrox/console-fx/pull/15) as
`2cbfce32a94722b0e31438fe04ee919264b39947`. The
[main validation run](https://github.com/servrox/console-fx/actions/runs/34744613518)
completed every required step: locked installation, production build, formatting,
lint, types, units, release/artifact guards, tarball/bundle inspection, prepared-CSP
studio tests and isolated JS/TS/React/Next consumers. The
[workflow](../../.github/workflows/validate.yml) establishes each check's scope;
CI is not native DevTools or physical-device evidence.

The [final public release](../evidence/hosting/2026-09-13-public/final-release.json)
promoted exact studio artifact `227a1e0e…`, built at `8793cae` with application/build
inputs matching the reviewed source. Both production domains serve its verified
landing, docs, studio and video bytes. The same artifact passed protected and
public browser journeys. Previews/immutable deployment URLs retain Vercel
Authentication. A staging alias assignment was corrected and recorded separately.
The later documentation reconciliation does not rebuild or replace that artifact.

Both `@servrox/console-fx` and `@servrox/console-fx-react` 0.1.0 are
[published and registry-tested](../evidence/packages/2026-09-13/README.md) under
`next`. Exact SHA-256 values are `61672e00…` and `eefa4f0b…`. The published core
is the approved PR #10 candidate; the later architecture core is `1eb78826…`.
They are distinct package bytes. The later source extracts motion ownership;
the archived comparison verifies 411 identical output/export/preflight results
across 187 fixtures. This is bounded behavioral parity, not byte identity or a
claim that the newer core tarball was published. Current package source is
unchanged since that comparison; both source and published consumers have their
own passing evidence. OIDC configuration/execution remains future automation;
the approved first publication used npm's interactive bootstrap.

## Base specification: all 24 acceptance criteria

The [original matrix](console-fx-spec.md#112-acceptance-matrix) remains unchanged.
The following maps each criterion to inspected implementation/tests and executed
evidence. Current-main CI covers the source test paths below. Historical native
observations are reused only for their identified outputs and environments.

| Criterion | Inspected proof and result |
| --- | --- |
| AC-01: silent imports | `packages/console-fx/test/imports.test.ts` imports every public entry in an isolated process that rejects console, timers, network and browser-state access. CI runs it against built packages; registry consumers also pass. |
| AC-02: pure deterministic compilation | `compiler.test.ts`, fitting/preset tests and frozen validation inputs check exact output and nonmutation. The architecture output comparison preserves 411 recorded results. |
| AC-03: one explicit emission | Compiler recording-sink, React lifecycle and studio tests assert zero implicit calls and one explicit call; native matrices record argument equality and call counts. |
| AC-04: standalone parity | `codegen.test.ts` and `codegen-ast.test.ts` parse/execute the one-call literal-data grammar, compare direct output and retain the approved media guard. |
| AC-05: literal text | Formatter-rescan corpus, XML/source escaping and control/Unicode tests pass; actual generated snippets and copied native captions preserve literal percent text. |
| AC-06: safe SVG | Compiler, cinematic and card XML tests inspect allowed elements, internal references and bounded nodes; arbitrary markup, event handlers, external resources and hostile object keys fail. |
| AC-07: static motion policy | Compiler, codegen and adapter preference tests cover absent, reduced, unknown and explicit system policy. Four native default/system-reduce cases remain static. |
| AC-08: finite useful motion | Generated durations/freeze are bounded in compiler tests. Native moving/settled frames cover all four motion families; identical cached images have no restart promise. |
| AC-09: explicit capability failure | Compiler renderer/profile matrix throws diagnostics unless exact static-text fallback was requested; invalid input never becomes fallback success. |
| AC-10: integrated studio | `tests/studio/editor.spec.ts` and website tests exercise gallery transfer, silent editing/imports, exact clipboard export and one Test call on landing and focused studio. Public critical journeys pass. |
| AC-11: JSON/history | Validation, document/session and editor tests cover valid round trips, invalid/future imports, intact prior work and one-step Undo/Redo. |
| AC-12: first enabled React behavior | `packages/console-fx-react/test/adapter.test.tsx` checks silent SSR/render, current scene on first enable and Strict Mode/toggle behavior. Isolated registry React/Next consumers pass. |
| AC-13: actual remount/reload | React unit and three real Next browser consumer journeys distinguish replay, edits, genuine remount and reload. Documentation records per-mount behavior. |
| AC-14: package boundaries | `check-packages.mjs` and `check-bundle-size.mjs` inspect public exports and actual consumer graphs. CSS is 9,670 gzip bytes and the complete compiler 25,558 in the architecture receipt, within original limits, with no accidental React/Next/codegen payload. |
| AC-15: installable packages | Current CI tests packed JS/TS/React/Next consumers; the separate published-pair receipt tests registry installs without local overrides and matches approved tarball integrity/bytes. |
| AC-16: qualified combinations/lifecycle | The native matrix and later cinematic/card/fitting ledgers identify browser/OS, theme, zoom, width, clipping, copy and lifecycle cases. Complete captions remain readable where a fixed image scrolls. |
| AC-17: bounded work | Validation/codegen/fitting tests cover structure/text/surface/effect limits, UTF-8 output budgets, hostile accessors/prototypes and explicit impossible-layout failures before unbounded generation. |
| AC-18: accessibility baseline | Automated axe, keyboard/focus, clipboard/storage failures, reduced motion, 320–1440 px layout and sampled native 200/400% zoom evidence pass in recorded environments. Narrator/NVDA remains unobserved and nonblocking under ADR-0013; no universal conformance claim is made. |
| AC-19: required gallery | Native Windows Chrome/Edge evidence covers badge, neon, RGB split, extrusion, holographic, gold, chrome, CRT and rainbow, plus glow pulse, gradient drift, wave and indicator. Current Stable feeds still match those recorded browser builds. |
| AC-20: public descriptors | Validation tests check immutable descriptor/default consistency; `features/editor/studio.tsx` obtains controls through public `getEffectDescriptors`. No public registration/private renderer import is added. |
| AC-21: typed data/bytes | Validation/type tests require diagnostics without partial scenes; compiler tests compare literal CSS segments/exact SVG URI and UTF-8 counts, including multibyte text and full standalone-source bounds. |
| AC-22: explicit renderer/defaults | Default output is literal static text. Compiler/codegen matrices cover supported requests, explicit unsupported/fallback choices and invalid input. No user-agent detection is implied. |
| AC-23: draft/recovery | Session/persistence/editor/improvement tests cover silent valid resume, conflicting shares, invalid/raw draft retention, quota/unavailable storage, cancel/reset, repeated clear, queued-write and stale-import races. Public import/Undo/reset/reload checks also pass. |
| AC-24: deliverables/rights | Core, thin React adapter, integrated Next studio and complete public-API JS/TS/React/Next recipes exist. MIT metadata/licenses, package allowlists, original visual assets and generated third-party notices are checked; registry pair and public website are separately verified. |

Evidence owners: [base implementation](console-fx-implementation-evidence.md),
[native matrix and original observations](../evidence/devtools/2026-09-11/README.md),
[architecture validation](../evidence/architecture/2026-09-13/README.md),
[registry pair](../evidence/packages/2026-09-13/README.md) and
[final hosted verification](../evidence/hosting/2026-09-13-public/README.md).
The archive readback checked 617 base native files, 10 motion-policy files,
116 architecture files and 76 improvement files against their recorded hashes.
This is source/evidence integrity verification, not new native observations.

## Extension specifications and subsequent instructions

| Requirement set | Result and authoritative evidence |
| --- | --- |
| Cinematic criteria 1–14; commit `3c42e12` | Four approved static designs, factories, safe ordinary scenes, controls, fallback/export and framework integration are implemented. [Criterion reconciliation](cinematic-metal-presets-evidence.md#acceptance-criteria-reconciliation), source tests and exact Windows Chrome/Edge captures cover the required dimensions/copy/lifecycle. ADR-0012/0013 are Accepted. |
| UAP-01–15 | All ten Useful/Artful designs, fields/captions, factories, closed presentations, compatibility, strict/fallback bounds, editor and package paths are implemented. [Card evidence](useful-artful-presets-evidence.md) distinguishes individual approved references from real DevTools observations. ADR-0014 and all ten designs are approved. |
| FIT-01–15 | Explicit fitting/sizing, optional measurement, saved recipes and ten approved compact designs are integrated. [Fitting matrix](responsive-fitting-implementation-evidence.md#final-verification--2026-09-12) records dimensions/confidence, Unicode, impossible layouts, old-reader rejection and native contexts. Container sizing remains explicitly experimental. ADR-0015 and compact references are approved. |
| WVS-01–17 | Hero/examples/workflows, public-API recipes, deliberate adoption/copy choices, no-JS explanation, recovery, reflow and featured native output are implemented and checked. [Value evidence](website-value-implementation-evidence.md) and the later published-pair/current-site receipts supply the distinct proof stages. |
| WVS-18 | **Incomplete:** no five-developer task/consent/timing/result/copy-decision receipt exists. The proposed composite 4/5-in-90-seconds target is not a fabricated pass. Conduct the study and the effects comparison using the prepared packet. |
| UXR-01–11, UXR-14–16 | Static content, exact output, bounded reveal, semantic cards, scene/copy safety, quiet studio, motion policy, source isolation and cleanup are supported by [experience evidence](website-experience-implementation-evidence.md), tests and UX-01–09 captures. Safari website behavior remains unobserved under the separate required browser-validation scope. |
| UXR-12 / device and browser validation | **Incomplete:** existing before/after/effects-off traces meet recorded desktop lab budgets; no integrated-GPU laptop/physical-phone traces or Safari journeys exist. Later Firefox evidence closes Firefox only. |
| UXR-13 / UX-10 | **Not applicable:** the optional GPU exhibit was omitted; no GPU dependency or third-party effect source was adopted. |
| All eleven listed improvements | The [complete list](launch-improvements.md) maps the implemented fitting, Unicode, recovery, observer and release-verification fixes to tests. No listed finding remains unfixed. |
| At least six separate architecture passes | [Passes 1–6](architecture-improvements.md) have separate implementation commits `7e40cfd`, `2f7eced`, `81549b5`, `732c890`, `823830c`, `9d854af`, with separately fixed review follow-ups. No public boundary/Accepted ADR was changed implicitly. |
| Review and fix until no findings | Independent Standards/Spec reviews found no additional implementation defect. This completion audit found stale current-status documentation, now reconciled, and the three explicit external validation gaps above. Those gaps remain open. |
| Website usage video | [Recording/source evidence](usage-video-evidence.md) plus final public playback verifies a 44.5-second real walkthrough, MP4/WebM, poster, nine caption cues, transcript, native controls, no autoplay and no audio. |
| Review/merge PRs; launch at chosen Vercel project | Implementation PRs through #15 are merged and main CI passed. The approved personal `servroxs-projects/console-fx` serves the final public artifact; npm bytes, registry installs, staging recovery, public routes and protected previews each have separate receipts. This later documentation correction follows the same PR/CI process. |

The independent secondary audit verified 960 members across cinematic review-fix,
card, fitting and website archives. Current TypeScript was bundled in memory and
224 recorded Chrome/Edge measured-success scene/option pairs recompiled with
identical arguments; 86 recorded failure rows lacked replay inputs and were not
replayed. All ten standard semantic fixtures, twenty approved SVG hashes and both
browsers' ten compact text/font/anchor comparisons matched. This probe invoked
neither a browser nor font measurement. Its stdin source was ephemeral; no retained
script hash or new runtime qualification is claimed. Existing source regressions
and unchanged renderer code provide the separate failure-path evidence.

## Remaining work and interpretation

Arrange five consenting developers (at least two unfamiliar), an integrated-GPU
laptop, and a physical phone plus real Safari access. An iPhone can cover phone
and Safari rows together. Execute the packet, retain actual observations, resolve
findings and recheck affected behavior before marking the full goal complete.
Public access stays as explicitly approved; it is not proof of these observations.
The earlier public launch proceeded without this additional validation, and this
audit records that gap rather than rewriting history or silently waiving it.

Screen-reader review remains a recommended nonblocking follow-up under ADR-0013.
Optional GPU work, field-percentile statistics and future OIDC automation are not
invented MVP results. Governing decisions are ADR-0002–0010 and ADR-0012–0015;
ADR-0011 remains superseded. No new ADR, scope reduction or acceptance change is
made by this audit.
