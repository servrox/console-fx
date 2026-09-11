/**
 * Dependency-free ConsoleFX design prototype, not the published library.
 * Paste this whole file into a browser console. Emits exactly one log.
 * SVG animation must still be verified inside the target DevTools version.
 * No page mutation, network requests, console clearing, or JS animation timers.
 */
(() => {
  const allowMotion = typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches;
  const animation = allowMotion ? `
    .word { animation: wave 2.4s ease-in-out 2 both; }
    .frame { animation: travel 4.8s linear 1 both; }
    @keyframes wave {
      0%,100% { transform:translateY(0); }
      25% { transform:translateY(-5px); }
      75% { transform:translateY(5px); }
    }
    @keyframes travel {
      from { stroke-dashoffset:0; }
      to { stroke-dashoffset:-108; }
    }
    @media (prefers-reduced-motion: reduce) {
      .word,.frame { animation:none !important; }
    }
  ` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
    <defs>
      <linearGradient id="ink"><stop stop-color="#64e1ff"/>
        <stop offset=".5" stop-color="#b59aff"/>
        <stop offset="1" stop-color="#f3a2e8"/></linearGradient>
      <filter id="glow" x="-50%" y="-100%" width="200%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <style>${animation}</style>
    <rect width="600" height="180" rx="12" fill="#080b12"/>
    <rect class="frame" x="8" y="8" width="584" height="164" rx="10"
      fill="none" stroke="url(#ink)" stroke-width="1.5" stroke-dasharray="18 9"/>
    <text class="word" x="300" y="103" text-anchor="middle"
      font-family="Arial,sans-serif" font-size="58" font-weight="800"
      fill="url(#ink)" filter="url(#glow)">console-fx</text>
    <text x="300" y="141" text-anchor="middle" font-family="Arial,sans-serif"
      font-size="12" fill="#98a4bc">Ordinary logs. Extraordinary output.</text>
  </svg>`;
  // Encode punctuation too, so SVG fragment URLs cannot break the CSS url().
  const encoded = encodeURIComponent(svg).replace(/[!'()*]/g,
    char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  console.log(
    "%c %c%s",
    `font-size:0;line-height:0;padding:90px 300px;` +
      `background:url("data:image/svg+xml,${encoded}") center/contain no-repeat;`,
    "",
    "console-fx — animated SVG prototype (static when reduced motion is requested)"
  );
})();
