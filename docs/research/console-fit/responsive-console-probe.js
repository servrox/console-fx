(() => {
  // Experimental Chromium carrier: one SVG, one log, no width detection.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
      width="720" height="240" viewBox="0 0 720 240">
    <rect x="1" y="1" width="718" height="238" rx="14"
      fill="#172127" stroke="#45565f" stroke-width="2"/>
    <rect x="28" y="30" width="4" height="180" rx="2" fill="#32d6cc"/>
    <text x="60" y="106" fill="#edf4f5"
      font-family="monospace" font-size="54" font-weight="700">console-fx</text>
    <text x="60" y="155" fill="#9fb1b7"
      font-family="monospace" font-size="20">Resize the console pane.</text>
    <text x="60" y="191" fill="#32d6cc"
      font-family="monospace" font-size="14">ONE ENTRY / RELATIVE PADDING</text>
  </svg>`;

  const uri = "data:image/svg+xml," + encodeURIComponent(svg).replace(
    /[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );

  console.log(
    "%c %c\n%s",
    `font-size:0;line-height:0;
     padding:min(120px,16%) min(360px,48%);
     background:url("${uri}") center/contain no-repeat;`,
    "",
    "console-fx\nResize the console pane.\nONE ENTRY / RELATIVE PADDING\nExperimental responsive SVG; native caption."
  );
})();
