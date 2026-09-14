import Link from "next/link";
import { PageEffects } from "../experience/page-effects";
import { CATEGORIES, exampleHref } from "../examples/catalogue";
import { CinematicHero } from "./cinematic-hero";
import { LegacyEntry } from "./legacy-entry";

export function LandingPage() {
  return (
    <PageEffects>
      <LegacyEntry />
      <div className="landing-shell workbench-landing">
        <section className="product-introduction" aria-labelledby="hero-title">
          <p className="eyebrow">A little character. One console.log.</p>
          <h1 id="hero-title">
            Make your console <span>worth opening.</span>
          </h1>
          <p>
            Give your project a signature. Make a build easier to scan.
            <br />
            Start with a message, make it yours, and copy the code.
          </p>
          <div className="button-row">
            <Link href="/studio/" className="button primary micro-arrow">
              Open workbench <span aria-hidden="true">→</span>
            </Link>
            <Link href="/docs/" className="button">
              Integration guide
            </Link>
          </div>
        </section>
        <CinematicHero />
        <section
          id="categories"
          className="category-overview"
          aria-labelledby="category-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Start with the job</p>
              <h2 id="category-title">What should your message do?</h2>
            </div>
            <p>Six categories. One place to edit.</p>
          </div>
          <div className="category-links">
            {CATEGORIES.map((item) => (
              <Link
                href={exampleHref(item.hero, item.id)}
                key={item.id}
                className="category-link micro-arrow"
              >
                <h3>
                  {item.name}
                  <span aria-hidden="true">→</span>
                </h3>
                <p>{item.purpose}</p>
              </Link>
            ))}
          </div>
        </section>
        <section
          className="compatibility-summary"
          aria-label="Choose how to use ConsoleFX"
        >
          <div>
            <h2>Copy once. Or compose in code.</h2>
            <p>
              Standalone JavaScript needs no installation. The typed core and
              React adapter let your application supply the content and choose
              when to print.
            </p>
            <Link href="/docs/#integration">
              See JavaScript, TypeScript, React and Next.js recipes →
            </Link>
          </div>
          <div>
            <h3>Built for browser consoles.</h3>
            <p>
              CSS and SVG profiles target Chromium DevTools. SVG sizing and
              finite motion retain their experimental limits. Plain text is an
              explicit alternative.
            </p>
            <Link href="/docs/#fitting">Rendering and sizing limits →</Link>
          </div>
        </section>
      </div>
    </PageEffects>
  );
}
