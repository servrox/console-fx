import Link from "next/link";
import { LandingSession } from "./session";
import { PageEffects } from "../experience/page-effects";
import { QuickDemo } from "./quick-demo";
import { ExampleGallery } from "./gallery";
import { UseCaseComparison } from "./use-case-comparison";
import { Workbench } from "./workbench";
import { packageExample } from "./recipes";
import { UsageVideo } from "./usage-video";

export function LandingPage() {
  return (
    <LandingSession>
      <PageEffects>
        <div className="landing-shell">
          <section className="value-hero" aria-labelledby="hero-title">
            <div className="value-introduction">
              <p className="eyebrow">Expressive browser-console messages</p>
              <h1 id="hero-title">
                Make your console <br />
                <span>worth opening.</span>
              </h1>
              <p className="value-description">
                Give your SDK a memorable welcome. Make development context
                easier to scan. Add a little character to your next project.
              </p>
              <p>
                Design a message here, then copy one console.log or compose it
                in TypeScript.
              </p>
              <div className="button-row">
                <a className="button primary" href="#try-message">
                  Try a message <span aria-hidden="true">→</span>
                </a>
                <a className="button" href="#use-in-your-app">
                  Use in your app
                </a>
              </div>
              <ul className="value-proof">
                <li>One intentional entry</li>
                <li>Standalone export</li>
                <li>Typed scenes</li>
              </ul>
              <p className="fine-print">
                Core 0.1.0 is available on npm under <code>next</code>.
                Standalone export works without installation.
              </p>
            </div>
            <QuickDemo />
          </section>
          <UsageVideo />
          <ExampleGallery />
          <section
            className="use-cases"
            id="use-cases"
            aria-labelledby="use-cases-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Useful when a developer is looking</p>
                <h2 id="use-cases-title">More than a pretty hello.</h2>
              </div>
              <p>A few deliberate messages. Your app supplies the facts.</p>
            </div>
            <div className="use-case-grid">
              <article>
                <h3>Welcome developers to an SDK.</h3>
                <p>
                  Put a recognizable welcome, selected mode and next step in one
                  place.
                </p>
                <UseCaseComparison id="sdkWelcome" />
                <p className="boundary-note">
                  Your application chooses whether and when to print. This
                  example does not initialize an SDK.
                </p>
                <Link href="/docs/#sdk-welcome">
                  SDK welcome recipe <span aria-hidden="true">→</span>
                </Link>
              </article>
              <article>
                <h3>Know which build you are looking at.</h3>
                <p>
                  Keep project, environment and revision together while
                  developing.
                </p>
                <UseCaseComparison id="devContext" />
                <p className="boundary-note">
                  Supply these values explicitly and use a development-only
                  trigger. ConsoleFX does not detect your deployment.
                </p>
                <Link href="/docs/#build-context">
                  Build context recipe <span aria-hidden="true">→</span>
                </Link>
              </article>
              <article>
                <h3>Summarize a moment.</h3>
                <p>
                  Mark a milestone, or print a small support summary after a
                  user asks.
                </p>
                <UseCaseComparison id="milestone" />
                <p className="boundary-note">
                  Choose and redact the facts in your app. No automatic
                  collection, secret removal, tracing or live progress.
                </p>
                <Link href="/docs/#supplied-summary">
                  Supplied summary recipe <span aria-hidden="true">→</span>
                </Link>
              </article>
            </div>
          </section>
          <Workbench />
          <section
            className="adoption-section"
            id="use-in-your-app"
            aria-labelledby="adoption-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Take it with you</p>
                <h2 id="adoption-title">
                  One message, or part of your codebase.
                </h2>
              </div>
            </div>
            <div className="adoption-grid">
              <article>
                <h3>Use one message</h3>
                <p>
                  Copy complete JavaScript for a fixed message. It runs without
                  a ConsoleFX import. Change the source scene when you want a
                  new message.
                </p>
                <p>
                  Rich SVG snippets can be larger. The export shows the full
                  source and its byte count.
                </p>
                <a className="button" href="#try-message">
                  Create a standalone console.log
                </a>
              </article>
              <article>
                <h3>Compose messages in code</h3>
                <p>
                  Use typed scenes for changing values and reusable
                  presentations. The same data works with the core library,
                  React adapter and Next.js recipes.
                </p>
                <p className="publication-note">
                  Core 0.1.0 is available under <code>next</code>. React adapter
                  publication is pending.
                </p>
                <Link className="button" href="/docs/#integration">
                  Read the integration guide
                </Link>
              </article>
            </div>
          </section>
          <section className="native-comparison" aria-labelledby="native-title">
            <div>
              <p className="eyebrow">A fair question</p>
              <h2 id="native-title">Why not just use %c?</h2>
              <p>
                For a single colored label, native console styling is enough.
                ConsoleFX helps with the presentation you want to reuse: typed
                scenes, consistent effects, literal-text handling, readable
                fallbacks and complete exports.
              </p>
            </div>
            <div
              className="comparison-table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Native console and ConsoleFX comparison"
            >
              <table>
                <caption>Who owns the presentation work?</caption>
                <thead>
                  <tr>
                    <th scope="col">Need</th>
                    <th scope="col">Native console / a small helper</th>
                    <th scope="col">ConsoleFX</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">One colored label</th>
                    <td>Often sufficient</td>
                    <td>Optional</td>
                  </tr>
                  <tr>
                    <th scope="row">Changing text, shared design</th>
                    <td>Your helper and conventions</td>
                    <td>
                      <Link href="/docs/#integration">
                        Typed scenes and presets
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Rich imagery and export</th>
                    <td>You construct and encode it</td>
                    <td>
                      <a href="#playground">One generator and visual editor</a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Framework lifecycle</th>
                    <td>You choose the trigger</td>
                    <td>
                      <Link href="/docs/#react">
                        React adapter and Next.js recipes
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Escaping and compatibility</th>
                    <td>You own the checks</td>
                    <td>
                      <Link href="/docs/#compatibility">
                        Explicit profiles and diagnostics
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="package-proof">
              <p>Package usage · complete TypeScript example</p>
              <pre tabIndex={0}>
                <code>{packageExample}</code>
              </pre>
              <p className="fine-print">
                This example uses package imports. The hero’s copy action
                exports standalone code.
              </p>
            </div>
          </section>
          <section className="trust-section" aria-labelledby="trust-title">
            <div>
              <h2 id="trust-title">Built for deliberate messages.</h2>
              <p>
                Keep ordinary debugging in native object inspection and your
                existing logging tools. Use ConsoleFX for sparse, human-facing
                messages in development or an explicit opt-in flow.
              </p>
              <div className="button-row">
                <a href="https://github.com/servrox/console-fx">Source</a>
                <a href="https://github.com/servrox/console-fx/blob/main/LICENSE">
                  MIT license
                </a>
                <a href="https://github.com/servrox/console-fx/blob/main/docs/compatibility.md">
                  Recorded browser evidence
                </a>
                <Link href="/docs/">Integration guide</Link>
              </div>
            </div>
            <div className="faq-list">
              <details>
                <summary>Does this replace my logger?</summary>
                <p>
                  No. Use native inspection and operational logging for normal
                  debugging and high-volume events. ConsoleFX presents an
                  occasional message.
                </p>
              </details>
              <details>
                <summary>Is every output selectable?</summary>
                <p>
                  CSS output is styled text. SVG output is an image with a
                  complete readable native caption. Page CSS previews are
                  approximate.
                </p>
              </details>
              <details>
                <summary>Does it work outside Chrome and Edge?</summary>
                <p>
                  The explicit rich profile targets Chromium. Choose plain text
                  or authorize a text fallback for another target. Check the
                  recorded builds before relying on a rich effect.
                </p>
              </details>
              <details>
                <summary>Can I use it without installing?</summary>
                <p>
                  Yes. Copy console.log gives you complete, fixed JavaScript.
                  Package examples require the corresponding core and adapter
                  imports.
                </p>
              </details>
              <details>
                <summary>Will it print automatically?</summary>
                <p>
                  Browsing and editing are silent. Test prints one message. Your
                  application controls its trigger; a React mount banner prints
                  only when explicitly enabled.
                </p>
              </details>
              <details>
                <summary>What are the size and motion limits?</summary>
                <p>
                  SVG has a chosen size and can overflow a narrow console.
                  Fitting is explicit and can fail a readable floor; container
                  sizing is experimental. Motion is finite and opt-in. A cached
                  image may not replay, and a printed log cannot update itself.
                </p>
              </details>
            </div>
          </section>
        </div>
      </PageEffects>
    </LandingSession>
  );
}
