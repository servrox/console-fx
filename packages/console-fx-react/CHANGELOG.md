# @servrox/console-fx-react

## 0.2.0

### Minor Changes

- Add explicit `fit/v2` with per-field readable floors and paint-aware fitting inside approved card cells. Preserve `fit/v1` output, failure and fallback behavior. Optional measurement batches retain their input limits and separate algorithm identities.
- Require matching core 0.2.x in the React adapter; no new runtime dependencies.

Includes the previously prepared, unpublished 0.1.1 corrections below.

### Patch Changes

- Require the corrected ConsoleFX 0.1.1 core while retaining the existing React 19
  peer contract, public adapter API and emission lifecycle behavior.

## 0.1.0

Published September 13, 2026 under `next`.

Explicit emission hook, first-enabled banner and structured compiler preview for
React 19 and Next.js client components. React remains a peer dependency.
