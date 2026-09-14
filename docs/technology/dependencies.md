# Direct package inventory

**These are all 22 third-party packages declared by the active project manifests.**

Snapshot: **2026-09-13**. [Technology overview](README.md) ·
[All locked package versions](dependency-inventory.json).

The [root manifest](../../package.json) declares all 22 as development
dependencies. The studio also declares Next.js, React and React DOM as its own
dependencies. A root `devDependency` label therefore does not by itself mean a
package is absent from the deployed app.

## Application frameworks

| Package     | Exact version | Why it is used                                                | Owner / audience                                                   |
| ----------- | ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `next`      | 16.3.4        | App Router, React integration and static studio build         | Studio; root tooling; isolated Next.js consumer                    |
| `react`     | 19.3.0        | Components, hooks and adapter lifecycle                       | Studio; root tests; consumer supplies the adapter's `^19.0.0` peer |
| `react-dom` | 19.3.0        | Browser rendering/hydration and React server-rendering checks | Studio; root tests; isolated consumers                             |

The app uses authored CSS and browser APIs. Its own library packages are
described below; the core's renderers do not depend on React or Next.js.

## Compilation and static checks

| Package              | Exact version | Why it is used                                                     | Owner / audience                                        |
| -------------------- | ------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| `typescript`         | 6.0.3         | Strict type checking; library ESM and declaration output via `tsc` | Root, workspace build/type checks and Next.js consumer  |
| `esbuild`            | 0.28.2        | Bundle-size measurement and browser/qualification fixtures         | Root scripts; library distribution remains `tsc` output |
| `eslint`             | 9.39.5        | Source linting                                                     | Root validation                                         |
| `@eslint/js`         | 9.39.5        | Base JavaScript ESLint rules                                       | Root ESLint configuration                               |
| `typescript-eslint`  | 8.70.0        | TypeScript-aware ESLint parsing/rules                              | Root ESLint configuration                               |
| `eslint-config-next` | 16.3.4        | Next.js/React lint rules                                           | Studio validation through root ESLint configuration     |
| `prettier`           | 3.9.6         | Formatting                                                         | Root validation                                         |

## Testing and artifact inspection

| Package                  | Exact version | Why it is used                                                          | Owner / audience                                            |
| ------------------------ | ------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| `vitest`                 | 4.1.11        | Unit/integration contracts and release-artifact tests in two projects   | Root `unit` and `release` test projects                     |
| `@playwright/test`       | 1.63.0        | Studio browser journeys, consumer checks and browser capture tooling    | Root tests/scripts                                          |
| `@axe-core/playwright`   | 4.13.0        | Automated accessibility checks in browser journeys                      | Studio browser tests                                        |
| `@testing-library/react` | 16.3.3        | React adapter and application-hook behavior                             | React/app tests                                             |
| `@testing-library/dom`   | 10.4.1        | DOM testing support and React Testing Library's peer contract           | Root test environment                                       |
| `jsdom`                  | 30.0.1        | DOM/XML inspection, hook tests and static HTML/CSP artifact preparation | Root tests **and build scripts**; isolated consumer fixture |
| `acorn`                  | 8.18.0        | Parse generated JavaScript and assert safe output structure             | Core code-generation tests                                  |

See [testing strategy](../specs/testing-strategy.md) for generalized contracts,
representative browser coverage and milestone cadence. Automated accessibility
results and native DevTools rendering observations remain separate evidence.

## Type declarations and versioning

| Package            | Exact version | Why it is used                                              | Owner / audience                           |
| ------------------ | ------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `@types/node`      | 24.13.4       | Node API declarations                                       | Root tools/tests and Next.js consumer      |
| `@types/react`     | 19.3.0        | React declarations                                          | Workspace types and Next.js consumer       |
| `@types/react-dom` | 19.3.0        | React DOM declarations                                      | Workspace tests/types and Next.js consumer |
| `@types/jsdom`     | 30.0.0        | JSDOM declarations                                          | Root tests/types                           |
| `@changesets/cli`  | 3.0.2         | Changeset authoring and package version/release bookkeeping | Root release workflow                      |

## ConsoleFX-owned packages and consumers

| Manifest                                                      | Current version / kind                              | Declared dependency boundary                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Workspace root](../../package.json)                          | `console-fx-workspace` 0.1.0; private               | The 22 development packages above; pnpm 12.3.4 is the package manager                                    |
| [Core](../../packages/console-fx/package.json)                | `@servrox/console-fx` 0.2.0                         | **No dependencies or peers**; public ESM entrypoints                                                     |
| [React adapter](../../packages/console-fx-react/package.json) | `@servrox/console-fx-react` 0.2.0                   | Core `workspace:^`; React peer `^19.0.0`                                                                 |
| [Studio](../../apps/studio/package.json)                      | `@servrox/console-fx-studio` 0.1.0; private         | Core and adapter `workspace:*`; Next.js 16.3.4; React/React DOM 19.3.0                                   |
| [Next.js example](../../examples/next-app/package.json)       | `console-fx-next-example`; private consumer fixture | Core/adapter 0.2.0; Next.js/React/React DOM pins above; TypeScript and Node/React declaration pins above |

`workspace:*` and `workspace:^` are local package relationships. Published
tarball manifests resolve them to package versions; verify the tarball rather
than treating the source string as the published dependency contract.

The Next.js example is **outside** the `apps/*` and `packages/*` workspace globs.
The [consumer harness](../../scripts/check-consumers.mjs) copies it into an
isolated fixture, adds the root-pinned JSDOM and selects either exact local
tarballs or registry packages. The vanilla, React and website examples share
that consumer environment instead of maintaining extra manifests.

Manifest versions identify source declarations; they do not establish that
every current source change is published. Consult the [release ledger](../releasing.md)
for package and hosted-artifact evidence.
