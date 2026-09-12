# Website value implementation

Status: implemented and independently reviewed, 2026-09-12. Local verification and
recorded native output are complete; external study and release stages remain separate.
The maintainer authorized full integration of the merged website specifications.
This receipt accompanies [the value spec](website-value-story-spec.md) and the
[experience receipt](website-experience-implementation-evidence.md). It does not
claim npm publication, a hosted deployment or completion of external user research.

## Implemented behavior

The static landing page explains memorable messages and practical summaries, with
six editable examples, three workflows, a live hero, a deferred full playground,
adoption guidance, a fair native `%c` comparison and complete integration recipes.
Examples use the public scene/compiler/preview APIs and explicit renderer choices.
Sample facts are labeled. Plain and Styled preserve the same canonical facts.
Editing, filtering and transfers stay silent; Test emits once. Clipboard rejection
keeps complete selectable source. Static HTML retains the explanation, final output,
navigation and an honest JavaScript requirement for interactive controls.

Landing state is transient. Opening the editor resumes existing work. Replacing it
from an example confirms first, records one undoable scene/options change and
restores the originating control on cancellation. Shared-scene conflicts retain
priority. `/studio/` remains focused; returning there from the landing editor carries
the current recipe in the existing bounded fragment format. The full preset gallery
is a separate disclosure, and the editor module loads near its section or after
explicit activation. No new dependency, public scene field or remote store was added.

Task documentation includes standalone, core, caller-owned startup guards, React
click-to-log and Next client-banner recipes. The isolated consumer fixture executes
the actual displayed sources and checks silence, guards, one emission, SSR and
Strict Mode behavior. TypeScript 6 startup consumers explicitly select Node's types
for the application-owned `process.env` guard. The library still reads no environment.
Package installation remains labeled pending until verified publication; source,
MIT license, compatibility evidence and limitations are linked where relevant.

## Acceptance and observations

| Criteria | Current evidence |
| --- | --- |
| WVS-01–08 | Hero/examples/workflows, exact text/URI/code, draft-safe transfers and focused navigation are implemented. The final fifty-case page suite passed in installed Windows Edge Beta 152.0.4191.51 with desktop and mobile-sized contexts; Stable native snippet qualification is separate. |
| WVS-09–11 | Complete public-API recipes, adoption paths, native comparison and task-based docs are implemented. Displayed recipe runtime/type checks passed in an isolated consumer; final packed-consumer checks passed, including the seven displayed recipes. |
| WVS-12–16 | Keyboard, reduced motion, clipboard failure, no-JS explanation, metadata and six widths (320/360/390/768/1280/1440) are tested. Axe checks passed for the landing. The final fifty-case suite passed. Foreground performance traces and native 200/400% zoom observations are retained in the experience receipt. |
| WVS-17 | Featured samples are runnable public-API scenes. The six final snippets were observed in actual Stable Windows Chrome/Edge DevTools. Four pale multi-line samples now explicitly use SVG with their existing opaque surface after light-theme CSS inspection exposed poor contrast; this deliberately replaces the original quietEditorial CSS proposal. The SDK/build/summary guide recipes use bounded SVG fitting and complete text fallback for the same reason. Exact previews/exports and both themes were rechecked. |
| WVS-18 | Five-developer moderated study not performed. No participant success rates or timing claims are made. Tasks remain: explain both uses; customize/test; find a professional use; choose snippet/package; identify a limitation. This unobserved external evidence remains a follow-up. |

The [durable website evidence](../evidence/website/2026-09-12/README.md) retains
state captures, exact sample scenes/output, before/after performance traces and
native zoom receipts. The final built studio passed all fifty desktop/mobile-sized
checks; package, React, TypeScript and Next consumer checks also passed. Earlier
transient URI mismatches were resolved by restoring legacy Letterpress geometry
and rebuilding before the successful suite. Fifty default compiler/code outputs
remain byte-identical to the pre-fitting candidate.

The moderated study remains unperformed. There are no participant results,
consent records or measured 90-second success claims. The five tasks are recorded
above as the formative review plan. This missing external evidence must be
considered explicitly before public promotion; local tests cannot substitute for it.

Screen-reader walkthrough is unperformed and nonblocking under ADR-0013. Physical
mobile-device testing, Safari and Firefox observations are not supplied by a
Chrome mobile viewport. No telemetry or participant recruitment messages were sent.

ADR-0002, ADR-0004 through ADR-0010, ADR-0012 through ADR-0015 materially govern the
shared previews, package boundaries, local recovery, claims and integration.
