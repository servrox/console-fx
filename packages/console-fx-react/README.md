# ConsoleFX React

A thin React 19 adapter using ConsoleFX's public compiler. ESM JavaScript,
TypeScript declarations and the `use client` boundary are included. This release
candidate is not published yet. The adapter depends on `@servrox/console-fx` and
keeps React as a peer dependency.

```tsx
"use client";
import { neon } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";

const scene = neon({ text: "Hello, developer." });
const options = { target: "chromium", renderer: "css" } as const;

export function Message() {
  const { log } = useConsoleScene(scene, options);
  return (
    <>
      <ConsolePreview scene={scene} options={options} />
      <button onClick={log}>Print message</button>
    </>
  );
}
```

`useConsoleScene(scene, options?)` returns a callback using the current committed
scene/options and resolves browser motion preference when invoked. It emits once
per call. Importing, rendering and server rendering remain silent.

`ConsoleBanner` defaults to disabled. With `enabled`, the first committed enabled
effect prints the current scene/options once per mounted instance. Initially
disabled banners wait for their first enabled state. Later edits or enable toggles
do not print again; development Strict Mode effect replay is guarded. A real
unmount/remount, reload, or separate instance can print again.

`ConsolePreview` uses structured compiler data. CSS is labeled **Approximate
browser preview**. SVG uses the exact compiler image URI and readable alt text;
plain text stays readable. Rendering defaults to static output. Page previews
remain separate from actual DevTools qualification.

For Next.js App Router, import these exports in a client component. A server root
layout can render an explicitly enabled banner client component. Alternatively,
place an explicit static `emitConsole` call in `src/instrumentation-client.ts`.
Choose one startup mechanism; enabling both intentionally prints twice. Browser
startup instrumentation does not belong in server instrumentation.

See the repository's runnable [consumer examples](https://github.com/servrox/console-fx/tree/main/examples)
and [compatibility evidence](https://github.com/servrox/console-fx/blob/main/docs/compatibility.md).
MIT © 2026 ConsoleFX contributors.
