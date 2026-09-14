"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ConsolePreview } from "@servrox/console-fx-react";
import {
  CATEGORIES,
  DEFAULT_EXAMPLE_ID,
  exampleHref,
  listCatalogue,
  resolveExample,
} from "../examples/catalogue";
import type { CategoryId } from "../examples/catalogue";
import { prepareExport } from "../export/prepare-export";
import { useClipboardCopy } from "../export/use-clipboard-copy";
import { TabList } from "../experience/tab-list";
import { CopyMark } from "../experience/action-feedback";
import { useHydrated } from "../experience/use-hydrated";

export function CinematicHero() {
  const [category, setCategory] = useState<CategoryId>("brand");
  const [id, setId] = useState<string>(DEFAULT_EXAMPLE_ID);
  const [view, setView] = useState<"compare" | "output" | "code">("compare");
  const [position, setPosition] = useState(62);
  const [notice, setNotice] = useState("");
  const [copiedSource, setCopiedSource] = useState<string | null>(null);
  const hydrated = useHydrated();
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 760px)");
    const update = () => {
      if (narrow.matches)
        setView((current) => (current === "compare" ? "output" : current));
    };
    update();
    narrow.addEventListener("change", update);
    return () => narrow.removeEventListener("change", update);
  }, []);
  const result = useMemo(() => resolveExample({ exampleId: id }), [id]);
  const prepared = useMemo(
    () => (result.ok ? prepareExport(result.recipe) : null),
    [result],
  );
  const source = prepared?.source("typescript") ?? "";
  const { copy, copying, failedCopy } = useClipboardCopy((attempt) => {
    setCopiedSource(attempt.kind === "copied" ? attempt.text : null);
    setNotice(
      attempt.kind === "copied"
        ? "Recipe copied."
        : attempt.kind === "failed"
          ? "Copy was blocked. Select the complete source below and copy it manually."
          : "Copying recipe…",
    );
  });
  const entry = listCatalogue().examples.find((item) => item.id === id)!;
  const variants = listCatalogue().examples.filter(
    (item) => item.family === "Cinematic signature",
  );
  const selectedCategory = CATEGORIES.find((item) => item.id === category)!;
  function selectCategory(next: CategoryId) {
    setCategory(next);
    setId(CATEGORIES.find((item) => item.id === next)!.hero);
    setNotice("");
  }
  const output =
    result.ok && prepared?.compilation.ok ? (
      <ConsolePreview
        scene={result.recipe.scene}
        options={{ ...result.recipe.options, motion: "reduce" }}
      />
    ) : (
      <p role="status">
        {result.ok ? prepared?.diagnostics[0]?.message : result.message}
      </p>
    );
  return (
    <section
      className="cinematic-showcase"
      aria-label="Explore console use cases"
    >
      <TabList
        id="hero"
        label="Console use cases"
        items={CATEGORIES}
        value={category}
        onChange={selectCategory}
        disabled={!hydrated}
      />
      {CATEGORIES.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`hero-panel-${item.id}`}
          aria-labelledby={`hero-tab-${item.id}`}
          hidden={item.id !== category}
        >
          {item.id === category && (
            <div className="micro-panel">
              <div className="showcase-heading">
                <div>
                  <h2>{entry.name}</h2>
                  <p>{selectedCategory.purpose}</p>
                </div>
                {category === "brand" && (
                  <label>
                    Cinematic design
                    <select
                      disabled={!hydrated}
                      value={id}
                      onChange={(event) => {
                        setId(event.target.value);
                        setNotice("");
                      }}
                    >
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div
                className="compare-controls"
                role="group"
                aria-label="Output and code views"
              >
                <button
                  type="button"
                  className="compare-only"
                  disabled={!hydrated}
                  aria-pressed={view === "compare"}
                  onClick={() => setView("compare")}
                >
                  Compare
                </button>
                <button
                  type="button"
                  disabled={!hydrated}
                  aria-pressed={view === "output"}
                  onClick={() => setView("output")}
                >
                  Show output
                </button>
                <button
                  type="button"
                  disabled={!hydrated}
                  aria-pressed={view === "code"}
                  onClick={() => setView("code")}
                >
                  Show code
                </button>
                <span>Browser preview · Static by default</span>
              </div>
              <div
                className="output-code-compare"
                data-view={hydrated ? view : "output"}
                style={{ "--reveal": `${position}%` } as CSSProperties}
              >
                <div className="compare-composite" aria-hidden="true">
                  <div className="compare-code-layer">
                    <pre>{source}</pre>
                  </div>
                  <div className="compare-output-layer">{output}</div>
                  <span className="compare-rule" />
                </div>
                <input
                  className="compare-surface-range"
                  id="hero-comparison"
                  aria-label="Reveal output and code"
                  type="range"
                  min={0}
                  max={100}
                  value={position}
                  disabled={!hydrated}
                  aria-valuetext={`${position}% output, ${100 - position}% code`}
                  onChange={(event) => setPosition(Number(event.target.value))}
                />
                <div className="complete-output">{output}</div>
                <div className="complete-code">
                  <pre tabIndex={0} aria-label="Complete package recipe">
                    <code>{source}</code>
                  </pre>
                </div>
              </div>
              <label
                htmlFor="hero-comparison"
                className={`compare-range ${view === "compare" ? "" : "compare-inactive"}`}
              >
                Drag to compare. Arrow keys adjust the reveal; Show code opens
                the complete recipe.
              </label>
              <div className="showcase-actions">
                <p>
                  {entry.sampleData
                    ? "Sample data. Your application supplies the facts."
                    : "Your application decides when to print."}
                </p>
                <div className="button-row">
                  <button
                    type="button"
                    disabled={!hydrated || copying || !prepared?.compilation.ok}
                    onClick={() => void copy(source, "Recipe")}
                  >
                    <CopyMark copied={copiedSource === source} />
                    Copy recipe
                  </button>
                  <Link
                    className="button primary micro-arrow"
                    href={exampleHref(id, category)}
                  >
                    Edit this example <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <p className="fine-print">
                Automatic width · experimental in DevTools. Full native text
                accompanies SVG output.
              </p>
              <p className="copy-status" role="status">
                {notice}
              </p>
              {failedCopy && (
                <label>
                  Recipe from the blocked copy attempt
                  <textarea
                    readOnly
                    rows={8}
                    value={failedCopy.text}
                    onFocus={(event) => event.target.select()}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
