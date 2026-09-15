# ADR-0008: Own the pnpm and TypeScript toolchain

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Initializing or changing dependencies, workspace scripts, compiler/build tools, or package contents.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The specification proposes pnpm workspaces, strict TypeScript, direct ESM compilation, Node 24 as an initial development baseline, and separate Bun consumer checks. There is no manifest, lockfile, compiler configuration, or installed project toolchain to validate yet.

## Decision

Assign one owner per tooling responsibility. pnpm owns persistent installs, workspace membership, lifecycle-script trust, and the single `pnpm-lock.yaml`. Use documented `pnpm run <script>` entrypoints after they exist. Do not create competing lockfiles or allow a runtime to install undeclared dependencies automatically. Review dependency source, lifecycle scripts, release-age policy, and narrow exceptions before the first dependency installation.

Use a supported stable TypeScript compiler through `tsc` for strict type checking and initial library ESM/declaration output. Next.js owns the studio's build. Vitest owns library tests and Playwright owns implemented studio interaction tests. No package bundler, Turborepo, remote cache, alternate compiler lane, or lint/format replacement is required initially; add one only for measured or demonstrated need with equivalent coverage.

At implementation bootstrap, select and pin compatible patched versions in manifests/configuration and the lockfile, verify the specification's Node 24 baseline remains supported for those dependencies, and record the actual compatibility result. Bun is initially a separately verified consumption target; no Bun-first script migration is approved by this proposal. Exact versions, lint/format selection, lifecycle allowlists, and any minimum dependency release age must be resolved at bootstrap, not invented in this setup.

Publishable libraries contain built ESM JavaScript, declarations, intentional exports, and an explicit file allowlist. Consumers must not need a TypeScript compiler to execute them. Keep root and studio private. Do not bundle React/Next, ship studio assets in the core, or add install/postinstall scripts. Set `sideEffects: false` only while imports remain side-effect-free. Add CommonJS only for a concrete consumer requirement and a reviewed compatibility change.

The initial bundled-consumer goals are at most 10 KiB gzip for one simple CSS preset and 25 KiB gzip for an SVG-capable consumer, excluding React/Next. Before claiming or enforcing those goals, record the exact public-entry fixture, artifact, bundler/minifier/compression configuration, toolchain, owner, and measurement stage. These are proposed product budgets, not measured results. Investigate a reproducible regression before changing the budget.

## Consequences

The initial toolchain remains narrow and distribution checks can inspect real emitted artifacts. A bootstrap task must still settle version compatibility and supply-chain settings; this ADR does not install anything or prove package readiness.

## Validation

After initialization, run the documented compiler, tests, build, frozen-install, package, and bundle checks. Inspect both tarballs and install them into isolated JS/TS/React/Next consumers. Check actual exports, declarations, client directives, peer dependencies, packaged files, and absence of automatic installation or a second lockfile.

## Sources and lineage

- [Specification sections 3, 9, 10, and 11](../specs/console-fx-spec.md).
- [pnpm workspaces](https://pnpm.io/workspaces), [TypeScript declaration output](https://www.typescriptlang.org/tsconfig/declaration.html), and [Node package entrypoints](https://nodejs.org/api/packages.html), consulted 2026-09-11 for mechanisms, not dependency qualification.
- Adapts AC-ADR-013 and the bundled-consumer budget portion of AC-ADR-025; see [provider mapping](provider-mapping.md).
