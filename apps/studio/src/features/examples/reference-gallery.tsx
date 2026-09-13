"use client";
import { useState } from "react";
import { ConsolePreview } from "@servrox/console-fx-react";
import type { RenderRecipeV1 } from "@servrox/console-fx";
import { ExampleCard } from "../landing/example-card";
import { REFERENCE_EXAMPLES, referenceRecipe } from "./reference-examples";
import type { ReferenceExampleId } from "./reference-examples";

export function ReferenceGallery({
  onSelect,
  disabled,
}: {
  readonly onSelect: (recipe: RenderRecipeV1) => void;
  readonly disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ReferenceExampleId | null>(null);
  return (
    <details
      className="reference-gallery"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Browse {REFERENCE_EXAMPLES.length} output examples</summary>
      {open && (
        <div className="reference-gallery-content">
          <p>
            Neon, ASCII, status messages, tables and more. Select an example to
            edit every line and copy its output.
          </p>
          <div className="curated-grid">
            {REFERENCE_EXAMPLES.map((example) => {
              const recipe = referenceRecipe(example.id);
              return (
                <ExampleCard
                  key={example.id}
                  label={`Edit ${example.name} example`}
                  selected={selected === example.id}
                  disabled={disabled}
                  onClick={() => {
                    setSelected(example.id);
                    onSelect(recipe);
                  }}
                >
                  <span className="example-preview" data-presentation="card">
                    <ConsolePreview
                      scene={recipe.scene}
                      options={recipe.options}
                    />
                  </span>
                  <span className="example-caption">
                    <strong>{example.name}</strong>
                    <span>{example.purpose}</span>
                  </span>
                  <span className="example-meta">
                    SVG image ·{" "}
                    {"motion" in example
                      ? "Static until played · Experimental motion"
                      : "Ready to edit"}
                    {"sample" in example ? " · Sample data" : ""}
                  </span>
                  <span className="example-edit">
                    Edit this example <span aria-hidden="true">↗</span>
                  </span>
                </ExampleCard>
              );
            })}
          </div>
        </div>
      )}
    </details>
  );
}
