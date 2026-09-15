# ConsoleFX input and output boundaries

ConsoleFX accepts a versioned JSON scene with built-in effects and typed parameters.
It does not accept raw CSS, SVG, HTML or JavaScript. Validation reads only owned
schema fields, rejects forbidden property names and normalizes supported values
before compiling. Invalid imports leave the current valid scene available.

Limits are engineering bounds: 64 KiB input, 2,000 text code points, eight visual
lines, 32 runs, four schema effects per run, 80 animated graphemes, a 1,200 × 400
SVG surface, 1,000 SVG elements, five seconds of motion and 128 KiB complete
standalone source. Source over 32 KiB warns. Shared fragments are limited to 8 KiB;
history retains at most 100 operations. Rich rendering supports one static style
and one optional motion per run. UTF-8 bytes and text/grapheme counts are separate
limits.

ESC, unsafe controls and unpaired surrogates are rejected. Literal percent signs
are encoded once in Chromium substitution text to prevent formatter rescanning
from consuming other arguments. Keep original text in scene data. SVG and CSS
come from internal templates and allowlists; image output uses an internal data
URI and a readable caption. No external image or font resource is embedded.

The standalone exporter serializes one console expression with inert literals and
an optional read-only media-query guard. It uses no evaluation, timers, network
requests, DOM changes or repeated logging. Generated source is shown as text in
the studio; the explicit test action calls the public helper. Imports and React
rendering are silent. A caller that replaces host APIs can still cause execution
errors; generated source does not attempt to repair the host environment.

Studio scenes remain in browser memory, the owned `console-fx:scene:v1` local
storage key, downloaded JSON, or an explicitly copied URL fragment. No application
account, backend, telemetry or cloud synchronization is implemented. Fragments
are readable by anyone given the full link, so do not share private scene text.
Clearing the local draft removes only the owned key; it does not erase the current
editable scene or unrelated storage. Reset requires confirmation. Corrupt or
unavailable storage stays recoverable without overwriting valid work.

The static deployment artifact generates CSP hashes from its actual HTML scripts.
Scripts are restricted to self and those hashes; SVG images permit self/data and
controlled React styles require inline style permission. The deployment also
sets `nosniff`, a referrer policy, and disables unused camera, microphone and
geolocation permissions. Hosted routing and headers require their own runtime
check. Local CSP tests do not establish hosted behavior.

See [compatibility](compatibility.md) for native Console limitations and the
[implementation receipt](specs/console-fx-implementation-evidence.md) for exact
validation and release status. These boundaries are implemented under ADR-0002,
ADR-0003, ADR-0005, ADR-0006 and ADR-0007.
