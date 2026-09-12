import Link from "next/link";
const reactExample = `"use client";
import { neon } from "@servrox/console-fx/presets";
import { useConsoleScene } from "@servrox/console-fx-react";

const scene = neon({ text: "Hello, developer." });

export function PrintMessage() {
  const { log } = useConsoleScene(scene, {
    target: "chromium", renderer: "css",
  });
  return <button onClick={log}>Print message</button>;
}`;
const cinematicExample = `import { lightningMetal } from "@servrox/console-fx/presets";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = lightningMetal({ text: "BUILD 2026", depth: 7,
  glow: 0.25, color: "#69dcff", ornaments: true });
const { code } = exportConsoleLog(scene, {
  target: "chromium", renderer: "svg",
});`;
const startupExample = `// instrumentation-client.ts — explicit, static startup output
import { neon } from "@servrox/console-fx/presets";
import { emitConsole } from "@servrox/console-fx/browser";

emitConsole(neon({ text: "Hello, developer." }), {
  target: "chromium", renderer: "css", motion: "reduce",
});`;

export default function Documentation() {
  return (
    <main id="main" className="docs-page">
      <p className="eyebrow">A small API. An expressive result.</p>
      <h1>Make one message your own.</h1>
      <p>
        ConsoleFX compiles scene data into one console entry. Compilation stays
        silent. You decide when to print.
      </p>
      <Link className="button primary" href="/#playground">
        Open the playground
      </Link>
      <h2>Copy a standalone message</h2>
      <p>
        Choose a preset, edit its text and effects, and select a renderer. Copy
        console.log exports complete JavaScript that runs without ConsoleFX
        installed. Test in console sends one entry to the current page’s
        console. Editing and importing never print.
      </p>
      <h2>Choose your renderer</h2>
      <ul>
        <li>
          <strong>CSS text:</strong> selectable styled text for the explicit
          Chromium profile. Page previews are approximate.
        </li>
        <li>
          <strong>SVG image:</strong> richer effects and finite motion. The
          image is accompanied by readable text in the same console call.
        </li>
        <li>
          <strong>Plain text:</strong> the default for omitted options and the
          readable projection for any target.
        </li>
      </ul>
      <p>
        Other rich target profiles error unless you explicitly select a text
        fallback. Renderer descriptors describe implemented capabilities; actual
        compatibility depends on the recorded browser qualification.
      </p>
      <h2>Cinematic Metal titles</h2>
      <p>
        Lightning Metal, Ice Cathedral, Liquid Chrome and Molten Gold are
        original, static SVG presets. Edit a single-line title of up to 24 code
        points, accent color, depth, glow and ornaments. Decorative motion is
        unavailable for these profiles.
      </p>
      <pre>
        <code>{cinematicExample}</code>
      </pre>
      <p>
        Lightning Metal and Molten Gold draw A–Z, digits, spaces and hyphens
        using original angular paths. Lowercase displays as capitals while saved
        text and the readable caption retain their case. Ice Cathedral and
        Liquid Chrome use local serif fonts; glyph coverage, shaping and width
        vary by platform. No film or studio affiliation or endorsement is
        implied.
      </p>
      <p>
        Unsupported glyphs or long titles keep your text and show a diagnostic.
        Choose a serif profile, edit the title, or explicitly choose plain text.
        Use SVG for cinematic output. A clipping warning means the text size or
        surface needs adjusting. The profile owns letter shapes, so inapplicable
        font controls are disabled; size and spacing remain editable.
      </p>
      <p>
        These scenes work with the same React and Next.js APIs below. Earlier
        ConsoleFX versions reject the new effect, so retain your JSON or draft
        for a compatible version after a rollback. The collection has separate
        browser qualification evidence from the original presets.
      </p>
      <h2>Use the React adapter</h2>
      <p>
        The hook emits only when you call its callback. ConsolePreview renders
        the public compiler’s preview. ConsoleBanner defaults to disabled and
        prints at the first committed enabled state of each mounted instance.
      </p>
      <pre>
        <code>{reactExample}</code>
      </pre>
      <p>
        Later scene changes and enable toggles do not print the same banner
        instance again. Development effect replay is guarded. A real
        unmount/remount, page reload, or separate instance can print again.
      </p>
      <h2>Next.js integration</h2>
      <p>
        Use the React example in a client component. A root layout can render an
        explicitly enabled ConsoleBanner client component. For browser startup,
        Next.js also supports an instrumentation-client.ts file at the
        application root (or src when your application uses src).
      </p>
      <pre>
        <code>{startupExample}</code>
      </pre>
      <p>
        Keep browser console output out of server instrumentation. Prefer static
        startup output: opening DevTools later does not guarantee an animation
        restart. React mount banners and startup instrumentation are
        alternatives; enabling both prints two entries by your choice.
      </p>
      <h2>Motion is decoration</h2>
      <p>
        Output is static by default. The playground can export a finite
        animation with a guarded system preference check and a precompiled
        static alternative. Reduced, unknown, or unavailable preferences choose
        static output. Motion lasts at most five seconds.
      </p>
      <p>
        A repeated, identical image may retain its finished frame. There is no
        handle to update, pause, or delete an already printed entry. Play,
        Replay, and Show static affect only the page preview. Rich effects and
        lifecycle qualification remain release gates for the initial candidate.
      </p>
      <h2>Your drafts stay local</h2>
      <p>
        A valid local draft resumes automatically. A different shared scene asks
        before replacing it. Imports are validated first and successful imports
        are undoable. Failed imports and storage errors preserve the current
        scene.
      </p>
      <p>
        Reset asks for confirmation and clears session history. It does not
        delete the stored draft. Clear local draft removes only ConsoleFX’s
        draft key and keeps your scene and history in memory. Saving resumes
        after a later edit. Export JSON for a copy you control; clearing local
        storage cannot revoke files or share links.
      </p>
      <h2>Packages and project status</h2>
      <p>
        The core and React adapter use the MIT license. This workspace contains
        the initial implementation candidate; npm publication and public release
        qualification are still pending. Generated package examples require the
        corresponding packages. Standalone JavaScript has no package dependency.
      </p>
      <p>
        <a href="https://github.com/servrox/console-fx">
          Source and release evidence on GitHub
        </a>
      </p>
    </main>
  );
}
