"use client";
import { useState } from "react";
import { ConsolePreview } from "@servrox/console-fx-react";
import { exampleRecipe } from "./examples";
import type { ExampleId } from "./examples";
import type { RenderRecipeV1 } from "@servrox/console-fx";
import { useTransferSession } from "./session";

export function UseCaseComparison({ id }: { readonly id: ExampleId }) {
  const [plain, setPlain] = useState(false);
  const session = useTransferSession();
  const recipe = exampleRecipe(id);
  const selected = {
    ...recipe,
    options: {
      ...recipe.options,
      renderer: plain ? "text" : recipe.options.renderer,
    },
  } satisfies RenderRecipeV1;
  return (
    <div className="use-case-comparison">
      <div className="choice-row" aria-label="Compare the same sample facts">
        <button
          type="button"
          aria-pressed={plain}
          onClick={() => setPlain(true)}
        >
          Plain
        </button>
        <button
          type="button"
          aria-pressed={!plain}
          onClick={() => setPlain(false)}
        >
          Styled
        </button>
        <span>Sample data</span>
      </div>
      <div className="use-case-preview">
        <ConsolePreview scene={selected.scene} options={selected.options} />
      </div>
      <button
        type="button"
        className="text-button"
        disabled={session.blocked}
        onClick={() => session.transfer(selected)}
      >
        Edit this example
      </button>
    </div>
  );
}
