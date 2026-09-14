import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConsoleFX — Browser-console styling for JavaScript and TypeScript",
  description:
    "Make an SDK welcome memorable, show supplied development context, or design one expressive console.log. Compose typed scenes or copy a standalone message.",
};

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <div className="header-inner">
            <Link className="wordmark" href="/" aria-label="ConsoleFX home">
              console-<span>fx</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/studio/">Workbench</Link>
              <Link href="/#categories">Use cases</Link>
              <Link href="/docs/">Docs</Link>
            </nav>
            <a
              className="repo-link"
              href="https://github.com/servrox/console-fx"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <Link className="wordmark" href="/">
            console-<span>fx</span>
          </Link>
          <p>One message. Your signature.</p>
          <nav aria-label="Footer navigation">
            <Link href="/docs/">Documentation</Link>
            <a href="https://github.com/servrox/console-fx/blob/main/LICENSE">
              MIT license
            </a>
            <a href="/licenses.txt">Third-party notices</a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
