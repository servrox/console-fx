const nativeCdp = Boolean(process.env.CONSOLE_FX_CDP_PORT);

// Playwright 1.63 can fall back to an imported context for error-prompt ARIA
// snapshots. Native fixtures retain action/DOM/source traces for owned contexts.
if (nativeCdp) process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";

// Both suites use the same native fixture. Disable framework-wide collection
// before that fixture starts its owned trace, without changing ordinary CI use.
export const nativeBrowserDiagnostics = nativeCdp
  ? { trace: "off" as const, screenshot: "off" as const }
  : {};
