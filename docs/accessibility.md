# Accessibility verification

The target is WCAG 2.2 AA under [ADR-0011](adrs/0011-adopt-an-explicit-accessibility-baseline.md).
The implementation is a release candidate; this document does not claim completed
conformance. Manual screen-reader/browser and native zoom evidence remain pending.

## Completed local observations

The 2026-09-11 production build passes all 16 desktop/mobile Playwright journeys
in a dedicated Windows Chrome 153.0.8010.36 profile. axe-core 4.13.0 checks use
WCAG 2 A/AA, 2.1 AA and 2.2 AA tags on the landing, editor and documentation pages.
The tested editor states include reduced motion, labeled controls, reset-dialog
keyboard activation, Escape cancellation and return of focus to the trigger.
Separate journeys cover clipboard denial, corrupt storage, failed import,
successful recovery, conflicting shared scenes and repeatable draft deletion.

All three routes (`/`, `/studio/`, `/docs/`) were also checked at a 320 CSS-pixel
viewport. Each measured 305 pixels of document width inside the 320-pixel window
with its scrollbar, without horizontal page overflow. The [receipt and captures](evidence/accessibility/2026-09-11/receipt.json)
record visual inspection of the editor labels, preview/export controls and reset
dialog at that width. Controls remained readable without overlapping or hidden
actions in those captured states. This checks reflow width;
it does not substitute for a real browser zoom observation. Attempts to trigger
native zoom through the automation interface did not change the measured scale
and are not counted as a pass.

Static previews are the default. An explicit Play action stays static when the
browser reports reduced motion. A separate page-image check observed Play and
Replay changing frames and returning to the same finished frame. Images retain
the compiler's readable text alternative; the vendor's DevTools interface is
outside the web conformance claim.

## Remaining manual checklist

Use the production build at `http://localhost:4175/studio/` or the approved
protected preview when available, in a separate test profile. Record date, exact
artifact/URL, Windows build, browser version and screen-reader name/version.

1. With Narrator or NVDA, navigate the page landmarks, headings and fields. Confirm
   that Message text, renderer, style controls and generated code have useful
   names and current values. The SVG preview must have a meaningful alternative.
2. Edit the message using the keyboard. Choose a renderer and an effect, then
   inspect generated code. Editing and previewing must not print a console message.
3. Activate Copy console.log and confirm that success is announced. If clipboard
   permission is denied, confirm the error is announced and the complete code
   remains selectable for manual copying.
4. Export JSON. Import a valid scene, then Undo and Redo. Attempt an invalid JSON
   import and confirm the error is announced while the current message remains.
5. Open Reset with the keyboard. Confirm the dialog title and choices are read,
   focus stays in the dialog, Escape cancels, and focus returns to Reset. Confirm
   an accepted reset starts a fresh message and clears session undo history.
6. Resume a saved draft, clear it twice, and reload. Confirm status announcements
   make recovery understandable without losing the currently editable scene.
7. At 200% and 400% native browser zoom, inspect the editor, landing and docs.
   Confirm labels, actions, dialog content and focused controls remain usable.
   Test narrow-screen reading and both static and reduced-motion preferences.

Record each result as pass, failure or not observed, with the affected journey
and criterion. A failure on a changed critical journey blocks promotion unless
the maintainer explicitly accepts the bounded exception required by ADR-0011.
Automated checks and an accessibility-tree snapshot alone do not complete this
manual gate.

See the [implementation receipt](specs/console-fx-implementation-evidence.md) for
package, native DevTools, CI and hosted-release status.
