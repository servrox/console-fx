// Design preparation only. No runtime module imports these proposed references.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const read = (name) =>
  JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));
if (existsSync(new URL("fixtures.json", import.meta.url)))
  assert.equal(
    read("fixtures.json").baselineStatus,
    "proposed",
    "Approved references require a separately reviewed revision.",
  );
const source = read("../preset-collection-v1/fixtures.json");
const scenes = read("../preset-collection-v1/scene-fixtures.json").presets;
const svg = (name, value) =>
  writeFileSync(new URL(name, import.meta.url), value);
const xml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
// Per-slot proposed geometry: x, baseline y, font size, safe width, optional anchor.
// All content is copied exactly from the approved ordinary-scene fixtures.
const layouts = {
  buildReceipt: {
    height: 304,
    compactBelow: 620,
    slots: {
      eyebrow: [24, 34, 12, 312],
      project: [24, 79, 28, 206],
      outcome: [281, 75, 12, 82, "middle"],
      revisionLabel: [24, 131, 12, 106],
      revision: [158, 131, 16, 177],
      durationLabel: [24, 165, 12, 106],
      duration: [158, 165, 16, 177],
      checksLabel: [24, 199, 12, 106],
      checks: [158, 199, 16, 177],
      environment: [24, 245, 12, 312],
      footer: [24, 279, 12, 312],
    },
  },
  requestTrace: {
    height: 322,
    compactBelow: 640,
    slots: {
      eyebrow: [24, 34, 12, 196],
      status: [290, 34, 12, 80, "middle"],
      method: [24, 77, 16, 44],
      path: [69, 77, 16, 176],
      total: [336, 77, 16, 90, "end"],
      s0: [53, 128, 12, 180],
      d0: [324, 128, 14, 86, "end"],
      s1: [53, 172, 12, 180],
      d1: [324, 172, 14, 86, "end"],
      s2: [53, 216, 12, 180],
      d2: [324, 216, 14, 86, "end"],
      requestId: [24, 268, 12, 312],
      footer: [24, 302, 12, 312],
    },
  },
  serviceReady: {
    height: 344,
    compactBelow: 650,
    slots: {
      eyebrow: [24, 34, 12, 204],
      state: [295, 34, 12, 70, "middle"],
      service: [24, 79, 28, 312],
      endpoint: [24, 115, 16, 312],
      envLabel: [24, 167, 12, 117],
      environment: [160, 167, 14, 176],
      runtimeLabel: [24, 207, 12, 117],
      runtime: [160, 207, 14, 176],
      regionLabel: [24, 247, 12, 117],
      region: [160, 247, 14, 176],
      footer: [24, 299, 12, 312],
    },
    wraps: { footer: ["STARTUP SNAPSHOT / VALUES ", "PROVIDED BY YOUR APP"] },
  },
  commandCard: {
    height: 280,
    compactBelow: 590,
    slots: {
      eyebrow: [24, 34, 12, 231],
      step: [336, 50, 32, 70, "end"],
      title: [24, 96, 24, 312],
      instruction: [24, 130, 14, 312],
      command: [50, 195, 20, 267],
      safety: [24, 253, 12, 312],
    },
  },
  releaseBulletin: {
    height: 296,
    compactBelow: 610,
    slots: {
      eyebrow: [24, 34, 12, 212],
      version: [304, 34, 12, 62, "middle"],
      headline: [24, 99, 26, 312],
      change0: [38, 151, 15, 298],
      change1: [38, 186, 15, 298],
      channel: [24, 237, 14, 312],
      footer: [24, 274, 12, 312],
    },
  },
  blueprint: {
    height: 304,
    compactBelow: 610,
    slots: {
      eyebrow: [24, 32, 12, 312],
      title: [24, 191, 28, 312],
      subtitle: [24, 228, 14, 312],
      footer: [24, 281, 12, 312],
    },
  },
  contourMap: {
    height: 264,
    compactBelow: 580,
    slots: {
      eyebrow: [24, 34, 12, 312],
      title: [24, 121, 27, 312],
      subtitle: [24, 162, 14, 312],
      footer: [24, 239, 12, 312],
    },
  },
  letterpress: {
    height: 264,
    compactBelow: 520,
    slots: {
      eyebrow: [24, 34, 12, 312],
      title: [24, 126, 34, 312],
      subtitle: [24, 168, 14, 312],
      footer: [24, 239, 12, 312],
    },
  },
  signalHalftone: {
    height: 302,
    compactBelow: 560,
    slots: {
      eyebrow: [24, 34, 12, 312],
      title: [24, 132, 36, 312],
      title2: [24, 177, 36, 312],
      subtitle: [24, 226, 14, 312],
      footer: [24, 279, 12, 312],
    },
  },
  orbital: {
    height: 312,
    compactBelow: 620,
    slots: {
      eyebrow: [24, 161, 12, 312],
      title: [24, 207, 29, 312],
      subtitle: [24, 244, 14, 312],
      footer: [24, 290, 12, 312],
    },
  },
};
const r = (x, y, w, h, fill, rx = 0, stroke = "none") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const p = (d, stroke, extra = "") =>
  `<path d="${d}" fill="none" stroke="${stroke}" ${extra}/>`;
const c = (x, y, radius, fill, stroke = "none", extra = "") =>
  `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
function art(id, bg, accent, height) {
  let value = r(0, 0, 360, height, bg, 12);
  if (id === "buildReceipt")
    value +=
      r(4, 4, 352, height - 8, "#efeee5", 9) +
      r(4, 15, 4, height - 30, accent, 2) +
      r(238, 54, 88, 32, "#dce9d6", 6, "#abc3a7") +
      p("M24 104H336M24 220H336", "#9ba99f", 'stroke-dasharray="3 4"') +
      p("M245 69l4 4 6-8", "#39733a", 'stroke-width="1.5"') +
      [...Array(22)]
        .map((_, i) => p(`M354 ${12 + i * 12}l6 6-6 6`, bg))
        .join("");
  else if (id === "requestTrace")
    value +=
      r(246, 16, 88, 26, "#213e35", 6) +
      p("M24 96H336M24 242H336", "#35434d") +
      p("M32 121V209", "#33434f", 'stroke-width="2"') +
      [121, 165, 209]
        .map((y) => c(32, y, 5, bg, accent, 'stroke-width="2"'))
        .join("");
  else if (id === "serviceReady")
    value +=
      r(249, 15, 88, 28, "#26433a", 6) +
      c(260, 28, 2.5, "#82cbb1") +
      p("M24 137H336M24 271H336", "#3a4650") +
      p("M144 150v107", "#39454e");
  else if (id === "commandCard")
    value +=
      r(24, 156, 312, 64, "#101920", 8, "#374950") +
      p("M27 163v50", "#4eaaad", 'stroke-width="2"') +
      p("M34 181l6 7-6 7", accent, 'stroke-width="2"');
  else if (id === "releaseBulletin")
    value +=
      r(270, 17, 67, 25, "#d7e3d7", 4) +
      p("M24 52H336M24 216H336", "#becac0") +
      r(24, 212, 54, 4, accent) +
      c(27, 146, 2, "#38816e") +
      c(27, 181, 2, "#38816e");
  else if (id === "blueprint")
    value +=
      p(
        "M50 74l37-21 39 21v45l-39 22-37-22ZM50 74l37 22 39-22M87 96v45M87 53v43",
        accent,
        'stroke-width="1.4"',
      ) +
      p("M50 119l37-23 39 23", "#72939e", 'stroke-dasharray="3 3"') +
      p("M37 52v90M32 54h10M32 141h10M24 256H336", "#638b99") +
      c(87, 96, 4, bg, "#c1e0e3") +
      r(24, 253, 28, 3, accent);
  else if (id === "contourMap")
    value +=
      Array.from({ length: 5 }, (_, i) =>
        p(
          `M${220 + i * 18} 48c-12 9 26 12 18 26s-30 13-9 21`,
          i === 2 ? accent : "#345448",
          'stroke-width="1.1"',
        ),
      ).join("") + r(24, 202, 38, 2, "#6cc4ac");
  else if (id === "letterpress")
    value +=
      r(8, 8, 344, height - 16, "none", 8, "#f7f6ec") +
      p("M24 53H336", "#d4d5c7") +
      p("M24 55H336", "#f4f4e9") +
      r(24, 201, 51, 3, accent) +
      c(329, 238, 4, "#d5d9cd", "#f5f5ea");
  else if (id === "signalHalftone")
    value +=
      c(271, 76, 25, "#386c60") +
      `<defs><pattern id="compact-dots" width="6" height="6" patternUnits="userSpaceOnUse">${c(2.7, 2.7, 1.65, accent)}</pattern></defs>` +
      c(300, 69, 29, "url(#compact-dots)") +
      p("M24 254H336", "#ccd0be");
  else if (id === "orbital")
    value +=
      c(84, 77, 42, "none", "#354d5b") +
      c(84, 77, 27, "none", "#405e6b") +
      `<ellipse cx="84" cy="77" rx="60" ry="18" fill="none" stroke="#62888f" transform="rotate(-32 84 77)"/>` +
      p("M61 41A42 42 0 0 1 111 43", accent, 'stroke-width="2"') +
      c(129, 51, 4, "#deb578") +
      c(84, 77, 2, "#a0c3c8") +
      p("M24 267H336", "#31434f");
  return value;
}
const records = [];
for (const fixture of source.presets) {
  const { scene, caption } = scenes.find((x) => x.id === fixture.id);
  const plan = layouts[fixture.id];
  const standard = readFileSync(
    new URL(`../preset-collection-v1/${fixture.svg}`, import.meta.url),
    "utf8",
  );
  const slots = [
    ...standard.matchAll(
      /<text\s+([^>]*data-slot="([^"]+)"[^>]*)>([\s\S]*?)<\/text>/g,
    ),
  ]
    .filter((match) => !match[1].includes('aria-hidden="true"'))
    .map((match) => {
      const id = match[2];
      const [x, y, fontSize, safeWidth, anchor = "start"] = plan.slots[id];
      const attr = (name, fallback) =>
        new RegExp(`${name}="([^"]+)"`).exec(match[1])?.[1] ?? fallback;
      return {
        id,
        x,
        y,
        fontSize,
        safeWidth,
        anchor,
        color: attr("fill", "#ffffff"),
        fontFamily: attr("font-family", source.fontStacks.sans),
        fontWeight: Number(attr("font-weight", "400")),
        letterSpacing: 0,
        fragments: plan.wraps?.[id] ?? [fixture.text[id]],
      };
    });
  assert.equal(slots.length, Object.keys(fixture.text).length);
  assert.equal(new Set(slots.map((x) => x.id)).size, slots.length);
  for (const slot of slots)
    assert.equal(slot.fragments.join(""), fixture.text[slot.id]);
  const text = slots
    .map(
      (s) =>
        `<text data-slot="${s.id}" x="${s.x}" y="${s.y}" fill="${s.color}" font-family="${s.fontFamily}" font-size="${s.fontSize}" font-weight="${s.fontWeight}" text-anchor="${s.anchor}" xml:space="preserve">${s.fragments.length === 1 ? xml(s.fragments[0]) : s.fragments.map((text, i) => `<tspan x="${s.x}" y="${s.y + i * 18}">${xml(text)}</tspan>`).join("")}</text>`,
    )
    .join("");
  const title = slots.find((s) => s.id === "title");
  const shadow =
    fixture.id === "letterpress"
      ? `<text aria-hidden="true" x="${title.x - 0.2}" y="${title.y + 1.3}" fill="#faf9ef" font-family="${title.fontFamily}" font-size="${title.fontSize}" font-weight="${title.fontWeight}" xml:space="preserve">${xml(title.fragments.join(""))}</text>`
      : "";
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${plan.height}" viewBox="0 0 360 ${plan.height}" role="img"><title>${fixture.name} — proposed compact reference</title><desc>Same supplied example content as the approved standard reference. Review pending.</desc>${art(fixture.id, scene.surface.background, scene.presentation.accent, plan.height)}${shadow}${text}</svg>\n`;
  svg(`${fixture.id}.svg`, markup);
  records.push({
    id: fixture.id,
    name: fixture.name,
    profile: fixture.profile,
    recipeMapping: `${fixture.id}/compact/v1`,
    width: 360,
    height: plan.height,
    compactBelow: plan.compactBelow,
    caption,
    slots,
    sha256: createHash("sha256").update(markup).digest("hex"),
  });
}
svg(
  "fixtures.json",
  JSON.stringify(
    {
      collection: "preset-compact-v1",
      baselineStatus: "proposed",
      algorithm: "fit/v1",
      fontStacks: source.fontStacks,
      notes:
        "Design-only references. Breakpoints are proposed per-profile constraints to verify; canonical SceneV1 and all standard output remain unchanged without fitting options.",
      presets: records,
    },
    null,
    2,
  ) + "\n",
);
svg(
  "README.md",
  `# Compact card design review\n\nStatus: proposed; separate visual approval pending under [ADR-0015](../../adrs/0015-separate-content-fit-from-output-sizing.md). These are design references, not implemented fitting or native DevTools qualification.\n\nAll ten references are 360 CSS pixels wide, 264–344 high, with 12 px minimum text. They retain every supplied value from the [approved standard designs](../preset-collection-v1/README.md). Utility facts are stacked; artwork uses smaller ornaments and a separate text area. Service Passport's footer wraps into two visual lines without changing its text. The original 720 × 240 references and scene slots remain intact.\n\nEach proposed \`<preset>/compact/v1\` recipe mapping applies only with explicit \`fit/v1\` options. It does not change the stored meaning of an existing \`<preset>/v1\` scene. Per-profile breakpoint proposals are recorded in [fixtures.json](fixtures.json); smaller/longer inputs still need an explicit measured fit or failure, not a promise of universal fit.\n\n${records.map((r) => `## ${r.name}\n\n${r.width} × ${r.height}; proposed compact selection below ${r.compactBelow} px.\n\n![${r.name} compact reference](${r.id}.svg)\n`).join("\n")}\nReproduce these proposed references with \`node docs/mockups/preset-compact-v1/prepare.mjs\` before approval. After approval the references are immutable comparison targets; changes require a reviewed revision.\n`.replaceAll(
    "\`",
    "`",
  ),
);
console.log(
  "Prepared ten compact design references with exact semantic slots.",
);
