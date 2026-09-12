# ConsoleFX experience storyboard — review version 1

Proposed interaction references for the [website redesign specification](../../specs/website-experience-redesign-spec.md). These are textual wireframes and state contracts, not screenshots, approved visual goldens, or implemented controls. Existing PNG/SVG mockups are preserved.

## Desktop composition

```text
console-fx     Examples   Use cases   Playground   Docs      GitHub

Make your console                  [Signature | Dev context | Summary]
worth opening.                     ┌ Console stage ─────────────────┐
                                   │ [Plain] [Styled]               │
One intentional message.           │                                │
A little more character.           │   actual compiler preview      │
                                   │   [text editing field]         │
[Try a message] [Use in your app]   └────────────────────────────────┘
[capability / publication note]     [Test in console] [Copy console.log]

Examples      [All] [Make it memorable] [Make it useful]
┌ signature ──────┐ ┌ dev context ───┐ ┌ SDK welcome ────┐
│ static preview │ │ static preview │ │ static preview  │
│ purpose + edit │ │ purpose + edit │ │ purpose + edit  │
└────────────────┘ └────────────────┘ └─────────────────┘
[second row; no horizontally scrolling carousel]

Not just a pretty hello.
[SDK onboarding] [Build context] [One supplied summary]
[plain/styled result, complete example, no invented telemetry]

Choose. Change. Copy.                         [Open full studio]
[Content / presets] [exact preview + source] [Style / options]
[format-aware export action and persistent diagnostics]

[One fixed snippet]                  [Compose with TypeScript / React]
[compatibility, source, license and release evidence]
```

`/studio/` renders only the focused workbench, with the same scene and export logic. It does not repeat the hero, GPU art exhibit, card spotlight or introduction animations.

## Mobile composition

```text
console-fx                                      [Navigation]
Make your console worth opening.
[one short explanation]
[Signature | Dev context | Summary]
[Plain | Styled]     [real preview]
[Message field]
[Test in console]   [Copy console.log]
[purpose-led example cards]
[use cases]
[Content disclosure]
[Preview]
[Style disclosure]
[Source + selected-format copy action]
[adoption paths]
```

Use the inline export action below 768 CSS px when a dock would obscure the viewport or virtual keyboard. No page-level horizontal overflow at 320 CSS px. Long source may scroll inside its labeled code area; never force the page to scroll sideways. Avoid a bottom dock over modal dialogs or focused fields.

## Reviewable state sequence

| State ID | What must be visible | Allowed motion / action | Comparison checkpoint |
| --- | --- | --- | --- |
| UX-01 Rest | Complete H1, factual status, final static styled output, Plain/Styled controls, both actions | None required for content to appear | Desktop 1440 and mobile 390 screenshot; static/reduced variants |
| UX-02 Focus | Obvious focus around the actual comparison button/card | No tilt or cipher animation; same operation as pointer | Keyboard screenshot, tab order and accessible name |
| UX-03 Reveal | Same message facts in both layers; useful state is available immediately | User selects Plain/Styled; decorative wipe/edge settles within 320 ms | Start, intermediate overlay and final output; overlay absent in final |
| UX-04 Explore | Hovered outer card responds; actual preset and label remain still/readable | Fine-pointer highlight and <=2 px lift; no selection on hover | Hover/focus/coarse-pointer comparison |
| UX-05 Select | One selected card; main preview changes; code label matches its current state | 160–200 ms crossfade; no hidden print; original draft untouched | Selected card, main preview and source content identity |
| UX-06 Edit | Focused field, unchanged typography baseline and live diagnostics | No tracking light, tilt, shake or sparkle over editor/code | Edited literal-percent/Unicode scene and complete output |
| UX-07 Copy success | “Copied” and selected format; visible status announced once | Optional <=300 ms local tick burst after success, not on raw click | Clipboard content + success screenshot; one write, zero logs |
| UX-08 Copy failure | Actionable failure text, selectable complete source, retry | No success effect and no erased selection | Rejected clipboard task; retry succeeds without double action |
| UX-09 Reduced/static | Same content, selected states and working actions | Immediate state swaps; no decorative RAF/interval/canvas | Reduced before hydration, preference changed during effect, user Effects off |
| UX-10 Optional art | Separate “Website effect — not part of exported logs” label, Play/Stop, static poster | Optional four-second ASCII Object exhibit; never over the console stage | No GPU/blocked import/context loss show poster; actions still work |

The motion counts describe app decoration, not motion inside generated SVG output. Do not use the art exhibit or transient reveal mask as a console-output comparison golden.

## Material and motion notes

Retain the current dark token family (`--bg`, `--panel`, `--inset`, `--border`, `--text`, `--muted`, `--accent`). Elevation belongs to outer panels; preview wells and inputs are recessed. Focus/selection needs a visible border or indicator, not shadow alone. Avoid translucent code backgrounds over moving imagery.

Suggested outer radii: 16–20 px for a showcase, 12 px for cards, 8 px for controls. Suggested layout gaps: 24–32 px desktop, 16 px mobile. Start with existing site typefaces; do not import fonts from a design mockup or the execution environment. Color/spacing proposals still need contrast and responsive review.

Use one easing family and three duration bands: 120–180 ms control feedback, 180–240 ms selection/settling, 240–320 ms hero comparison. No staggered heading reveal, recurring shimmer, long spring oscillation or scroll-controlled navigation. Depth must be subtle enough to disappear when editing begins.

## Required implementation comparison artifacts

Capture the state IDs above at the implementation revision with exact browser, OS, viewport, zoom, motion setting, pointer mode, scene ID and renderer options. Include 320/390, 768 and 1440 CSS px layouts, 200% zoom and a reflow check. Preserve the first reviewed reference and record changes rather than regenerating goldens to hide regression.

Also record the output argument or image-URI fingerprint before and after page effects. For a fixed scene/options, it must match. Pixel comparisons of typography need a fixed environment; they do not prove native DevTools behavior. Approved full-page screenshots and interaction recordings should be added during implementation review, not invented in this proposal.
