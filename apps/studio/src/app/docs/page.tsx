import { UsageVideo } from "../../features/landing/usage-video";
import Link from "next/link";
import { neon } from "@servrox/console-fx/presets";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import {
  contextExample,
  sdkExample,
  summaryExample,
  packageExample,
  reactExample,
  nextExample,
  startupExample,
} from "../../features/landing/recipes";

const standalone = exportConsoleLog(neon({ text: "Hello, developer." }), {
  target: "chromium",
  renderer: "css",
  motion: "reduce",
}).code;
const cinematicExample = `import { lightningMetal } from "@servrox/console-fx/presets";
import { exportConsoleLog } from "@servrox/console-fx/codegen";

const scene = lightningMetal({ text: "BUILD 2026", depth: 7,
  glow: 0.25, color: "#69dcff", ornaments: true });
const { code } = exportConsoleLog(scene, {
  target: "chromium", renderer: "svg", motion: "reduce",
});`;

export default function Documentation() {
  return (
    <main id="main" className="docs-page">
      <p className="eyebrow">One message. A clear reason to print it.</p>
      <h1>Use ConsoleFX in your app.</h1>
      <p>
        Design a fixed message, or compose typed scenes with changing values.
        Compilation is silent. Your application chooses when one message is
        printed.
      </p>
      <nav className="docs-tasks" aria-label="Guide topics">
        <a href="#standalone">Copy a standalone message</a>
        <a href="#sdk-welcome">Welcome SDK users</a>
        <a href="#build-context">Show development context</a>
        <a href="#supplied-summary">Print supplied facts</a>
        <a href="#react">React</a>
        <a href="#next">Next.js</a>
        <a href="#fitting">Fitting and recipes</a>
      </nav>
      <Link className="button primary" href="/studio/">
        Open workbench
      </Link>
      <UsageVideo />
      <section id="standalone">
        <h2>Use a fixed message without installing</h2>
        <p>
          Choose a sample, edit the text and copy console.log. This complete
          JavaScript contains a fixed output and needs no ConsoleFX import when
          it runs. Change the source scene to create a different message; a
          copied snippet does not update itself.
        </p>
        <pre tabIndex={0}>
          <code>{standalone}</code>
        </pre>
        <p>
          Test in console prints one entry. Editing, importing and copying never
          print. On clipboard failure, select the complete source and copy it
          manually. SVG snippets can be larger; the export area reports UTF-8
          bytes.
        </p>
      </section>
      <section id="integration">
        <h2>Compose with TypeScript</h2>
        <p>
          Use the core package when values change or a design is shared across
          your codebase. These examples use public imports only. Install the
          preview release from npm under the <code>next</code> tag:
        </p>
        <pre tabIndex={0}>
          <code>pnpm add @servrox/console-fx@next</code>
        </pre>
        <p>
          The core has no runtime dependencies. The React adapter is available
          as a separate package.
        </p>
        <pre tabIndex={0}>
          <code>{packageExample}</code>
        </pre>
        <p>
          For one colored label, native <code>%c</code> can be enough. The
          package supplies reusable scenes, effect generation, literal-percent
          handling, validation, explicit renderer profiles and complete exports.
          It does not replace native object inspection or operational logging.
        </p>
      </section>
      <section id="sdk-welcome">
        <h2>Welcome developers to an SDK</h2>
        <p>
          Put a product name, mode and next step together. The caller owns the
          opt-in flag and trigger. The Atlas values here are sample data; no SDK
          is initialized.
        </p>
        <pre tabIndex={0}>
          <code>{sdkExample}</code>
        </pre>
        <p>
          Call <code>welcomeToSdk(true)</code> from your chosen browser action.
          Keep startup welcomes sparse.
        </p>
      </section>
      <section id="build-context">
        <h2>Show development context</h2>
        <p>
          Supply the project, environment and revision from your app. ConsoleFX
          does not read environment variables, inspect a deployment, or decide
          what is safe to disclose.
        </p>
        <pre tabIndex={0}>
          <code>{contextExample}</code>
        </pre>
        <p>
          Example input:{" "}
          <code>
            {
              '{ project: "atlas-web", environment: "preview", revision: "a1b2c3d" }'
            }
          </code>
          . Pass your application’s development flag explicitly. A runtime guard
          alone does not promise dead-code elimination or zero production cost.
        </p>
      </section>
      <section id="supplied-summary">
        <h2>Print an allowlisted summary</h2>
        <p>
          Run this from a deliberate browser action after selecting and
          redacting the facts in your app. Keep tokens, cookies, request
          objects, user details and private endpoints out of the message.
          ConsoleFX does not automatically collect or remove them.
        </p>
        <pre tabIndex={0}>
          <code>{summaryExample}</code>
        </pre>
        <p>
          Sample facts:{" "}
          <code>
            {'["Build complete", "48 checks passed", "Ready for review"]'}
          </code>
          . The library presents this snapshot; it does not verify the result or
          update a printed entry.
        </p>
      </section>
      <section id="react">
        <h2>Use the React adapter</h2>
        <p>Install the adapter alongside the core package:</p>
        <pre tabIndex={0}>
          <code>
            pnpm add @servrox/console-fx@next @servrox/console-fx-react@next
          </code>
        </pre>
        <p>
          The hook returns an explicit logging action. Rendering and server
          rendering stay silent. <code>ConsolePreview</code> uses the same
          public compiler; CSS previews are approximate and SVG previews use its
          exact image URI.
        </p>
        <pre tabIndex={0}>
          <code>{reactExample}</code>
        </pre>
        <p>
          Use a button or your own deliberate event. Do not log in a render
          body. A browser-only trigger belongs in a client component when your
          framework uses server components.
        </p>
      </section>
      <section id="next">
        <h2>Next.js: client banner or browser startup</h2>
        <p>
          Use this client component from your layout and pass an explicit
          development or opt-in flag. The default is disabled.
        </p>
        <pre tabIndex={0}>
          <code>{nextExample}</code>
        </pre>
        <p>
          <code>ConsoleBanner</code> prints at the first committed enabled state
          of each mounted instance. Later scene edits and enable toggles do not
          print it again. Development effect replay is guarded; a real
          unmount/remount, reload or separate instance can print again. It emits
          nothing during SSR.
        </p>
        <p>
          For a startup message outside React, Next.js supports a browser
          instrumentation file:
        </p>
        <pre tabIndex={0}>
          <code>{startupExample}</code>
        </pre>
        <p>
          With TypeScript 6, include <code>{'"types": ["node"]'}</code> in your
          tsconfig compiler options for this startup recipe’s{" "}
          <code>process</code> type. The example workspace already includes the
          pinned Node type package. See the{" "}
          <a href="https://www.typescriptlang.org/tsconfig/types">
            TypeScript types configuration
          </a>
          .
        </p>
        <p>
          Keep browser output out of server instrumentation. Choose the banner
          or startup approach; enabling both produces two entries. Opening
          DevTools later does not guarantee an animation restarts.
        </p>
      </section>
      <section id="compatibility">
        <h2>Choose the output and its limits</h2>
        <ul>
          <li>
            <strong>CSS text:</strong> selectable styles for the explicit
            Chromium profile; the page approximation may differ from DevTools.
          </li>
          <li>
            <strong>SVG image:</strong> rich effects with a complete
            reset-styled native caption in the same call. Image lettering itself
            is not selectable.
          </li>
          <li>
            <strong>Plain text:</strong> the default when options are omitted
            and the readable projection for every target.
          </li>
        </ul>
        <p>
          Other rich targets error unless you explicitly authorize text
          fallback.{" "}
          <a href="https://github.com/servrox/console-fx/blob/main/docs/compatibility.md">
            Read the recorded Windows Chrome and Edge builds and observations
          </a>
          ; descriptors describe implementation, not universal browser
          qualification.
        </p>
        <p>
          Output is static by default. Finite motion lasts at most five seconds
          and must be selected explicitly. System motion policy chooses static
          output for reduced, unknown or unavailable preferences. An identical
          cached image can retain its finished frame. There is no handle to
          update, pause or delete an already printed log. Play and Show static
          affect the page preview only.
        </p>
      </section>
      <section id="collections">
        <h2>Cinematic titles and complete cards</h2>
        <p>
          Lightning Metal, Ice Cathedral, Liquid Chrome and Molten Gold are
          static SVG profiles for a single-line title of up to 24 code points.
          Set accent, depth, glow and ornaments. The Useful and Artful
          collections provide ten closed card presentations with editable
          content slots.
        </p>
        <pre tabIndex={0}>
          <code>{cinematicExample}</code>
        </pre>
        <p>
          Lightning Metal and Molten Gold use original A–Z, digit, space and
          hyphen paths. Lowercase displays as capitals while saved text and
          native caption preserve its case. The two serif profiles use local
          fonts, whose glyph coverage and widths vary by platform. There is no
          film or studio affiliation.
        </p>
        <p>
          Unsupported content remains available with a diagnostic. Choose
          another profile, revise the title or explicitly use plain text. A card
          owns its layout and some typography; detach it to use ordinary flow
          controls. Older readers reject unsupported profiles rather than
          dropping their data.
        </p>
      </section>
      <section id="fitting">
        <h2>Fit content, then choose its display size</h2>
        <p>
          Open Fit and sizing to simulate a chosen width. Simulation does not
          change exports; Use this width for export applies a recipe edit. The
          compiler wraps or shrinks only under the policy you choose and returns
          an error when the text cannot meet its readable floor.
        </p>
        <p>
          Fixed display width and content layout are separate settings.
          Container-relative output remains experimental: actual display
          dimensions and image-text readability are unknown, and the native
          caption stays available. Standard cards keep their reviewed geometry;
          all ten card profiles have separately approved compact layouts. Use
          explicit fitting options to select them; the original scene keeps its
          standard output. A 280 px request can fail the readable font floor.
        </p>
        <p>
          Measure local fonts is an optional explicit operation. It uses local
          font data without downloads. Results distinguish authored geometry,
          local measurements and estimates; a measured page font does not prove
          the recipient’s font. Package examples can carry the fixed validated
          metrics as data; no measurement runs when they print. Edit the
          content/style and remeasure explicitly, or omit metrics and accept the
          reported estimate.
        </p>
        <p>
          Scene JSON contains content only. Recipe JSON includes explicit
          render, fitting and sizing options. Live font measurements are
          excluded from recipes, drafts and share links. Standalone JavaScript
          contains the compiled result.
        </p>
      </section>
      <section id="drafts">
        <h2>Keep control of your work</h2>
        <p>
          A valid local draft resumes automatically. Conflicting shared scenes
          ask first. Import validates before replacement; a successful import or
          example transfer is one undoable change. Failed imports and storage
          errors preserve the current scene.
        </p>
        <p>
          Changing render settings saves a recipe and retains your earlier raw
          scene draft. Invalid stored recipes hold writes until you choose a
          recovery. Reset asks for confirmation and clears session history
          without deleting the stored draft. Clear local draft removes stored
          ConsoleFX drafts while retaining your scene and undo history in
          memory; saving resumes after a later edit.
        </p>
        <p>
          Use Recipe JSON for an independent backup. Shared links and downloads
          are copies; clearing local storage does not revoke them. No account,
          server backup, sync or telemetry is added.
        </p>
      </section>
      <section>
        <h2>Project status and license</h2>
        <p>
          The core, React adapter and studio use MIT. Both packages are
          published under <code>next</code>. Standalone exports work without a
          package dependency. See the{" "}
          <a href="https://github.com/servrox/console-fx">
            source and release evidence
          </a>{" "}
          for the current candidate, compatibility and remaining observations.
        </p>
      </section>
    </main>
  );
}
