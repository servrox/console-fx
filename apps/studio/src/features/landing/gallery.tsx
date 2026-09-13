"use client";
import { useState } from "react";
import { ConsolePreview } from "@servrox/console-fx-react";
import { EXAMPLES, exampleRecipe } from "./examples";
import type { ExampleId } from "./examples";
import { useTransferSession } from "./session";
import { ExampleCard } from "./example-card";
import { ReferenceGallery } from "../examples/reference-gallery";

export function ExampleGallery() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<ExampleId | null>(null);
  const session = useTransferSession();
  return (
    <section
      className="curated-section"
      id="presets"
      aria-labelledby="examples-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">A few places to begin</p>
          <h2 id="examples-title">A message with a purpose.</h2>
        </div>
        <div className="choice-row" aria-label="Filter examples">
          {[
            ["all", "All"],
            ["memorable", "Make it memorable"],
            ["useful", "Make it useful"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value!)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="curated-grid">
        {EXAMPLES.filter(
          (example) => filter === "all" || example.category === filter,
        ).map((example) => {
          const recipe = exampleRecipe(example.id);
          return (
            <ExampleCard
              key={example.id}
              label={`Edit ${example.name} example`}
              selected={selected === example.id}
              disabled={session.blocked}
              onClick={() => {
                setSelected(example.id);
                session.transfer(recipe);
              }}
            >
              <span
                className="example-preview"
                data-presentation={
                  recipe.scene.presentation ? "card" : undefined
                }
              >
                <ConsolePreview scene={recipe.scene} options={recipe.options} />
              </span>
              <span className="example-caption">
                <strong>{example.name}</strong>
                <span>{example.purpose}</span>
              </span>
              <span className="example-meta">
                {recipe.options.renderer === "svg" ? "SVG image" : "CSS text"} ·
                Ready to edit{example.sample ? " · Sample data" : ""}
              </span>
              <span className="example-edit">
                Edit this example <span aria-hidden="true">↗</span>
              </span>
            </ExampleCard>
          );
        })}
      </div>
      <p className="fine-print">
        These are editable examples made with the public API. Find all 23
        presets, including the cinematic and card collections, in the
        playground.
      </p>
      <ReferenceGallery
        onSelect={session.transfer}
        disabled={session.blocked}
      />
    </section>
  );
}
