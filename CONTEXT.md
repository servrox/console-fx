# ConsoleFX

ConsoleFX describes, previews and exports a single expressive console entry.

## Language

**Scene**: The complete, versioned message content and its materialized styling.
A scene remains editable independently of how it is displayed or exported.

**Render recipe**: A scene together with explicit rendering, fitting and output
sizing choices. Local font measurements are temporary and are not saved in it.

**Console entry**: One explicitly emitted message, which may contain several
visual lines. Decorative motion does not represent changing application state.

**Standalone snippet**: Complete JavaScript that emits one console entry without
requiring a ConsoleFX installation.

**Local draft**: A browser-local saved scene or render recipe. Shared links and
downloaded documents are independent copies of it.
