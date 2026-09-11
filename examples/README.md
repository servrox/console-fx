# Consumer examples

`vanilla/check.mjs` demonstrates plain JavaScript imports, compilation and export.
`react/message.tsx` uses the emission hook and public preview. `next-app/` is an
App Router application with a client-component banner and explicit browser startup
instrumentation. In a real application, choose the startup mechanism you need;
the fixture intentionally tests instrumentation followed by an opt-in banner.

The package candidate has not been published. From the repository root, run
`pnpm run build:packages`, `pnpm run check:packages`, then
`pnpm run test:consumers`. The checker copies these examples into an isolated
temporary directory, installs the exact tarballs and pinned external dependencies,
and runs JavaScript, TypeScript, React and production Next checks. It never uses
workspace source aliases. `CONSOLE_FX_CDP_PORT` can select a dedicated Windows
Chrome instance for the browser portion; otherwise install Playwright Chromium
in the test environment first.
