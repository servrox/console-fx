# Website value implementation

Status: implemented; combined review and final verification in progress, 2026-09-12.
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
| WVS-01–08 | Hero/examples/workflows, exact text/URI/code, draft-safe transfers and focused navigation are implemented. Native Windows Chrome website tests passed in desktop and mobile-sized contexts. |
| WVS-09–11 | Complete public-API recipes, adoption paths, native comparison and task-based docs are implemented. Displayed recipe runtime/type checks passed in an isolated consumer; final packed-consumer rerun is pending. |
| WVS-12–16 | Keyboard, reduced motion, clipboard failure, no-JS explanation, metadata and six widths (320/360/390/768/1280/1440) are tested. Axe checks passed for the landing. Performance and final combined regression reconciliation are pending. |
| WVS-17 | Featured samples are runnable public-API scenes. Actual native DevTools checks of these exact featured snippets are pending; page tests do not qualify them. |
| WVS-18 | Five-developer moderated study not performed. No participant success rates or timing claims are made. Tasks remain: explain both uses; customize/test; find a professional use; choose snippet/package; identify a limitation. This unobserved external evidence remains a follow-up. |

The latest website-only cases passed in both contexts. A full pre-compact app run
passed 42 of 44 checks; its two card URI comparisons exposed a transient mismatch
after the package build changed during that run. The original Letterpress shadow
position was restored and 50 legacy default outputs then compared byte-identically.
A fresh build and complete suite will provide the final integration result.
Local captures and logs are under `.artifacts/website/`; durable final evidence
packaging, exact-head CI and release reconciliation remain open.

Screen-reader walkthrough is unperformed and nonblocking under ADR-0013. Physical
mobile-device testing, Safari and Firefox observations are not supplied by a
Chrome mobile viewport. No telemetry or participant recruitment messages were sent.

ADR-0002, ADR-0004 through ADR-0010, ADR-0012 through ADR-0015 materially govern the
shared previews, package boundaries, local recovery, claims and integration.
