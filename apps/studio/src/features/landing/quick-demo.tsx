"use client";
import { useMemo, useState } from "react";
import { compileConsole } from "@servrox/console-fx/browser";
import { exportConsoleLog } from "@servrox/console-fx/codegen";
import { ConsolePreview } from "@servrox/console-fx-react";
import { EXAMPLES, HERO_CHOICES, exampleRecipe } from "./examples";
import type { ExampleId, SignatureStyle } from "./examples";
import { useTransferSession } from "./session";
import { RevealFrame } from "../experience/reveal-frame";
import { useHydrated } from "../experience/use-hydrated";
import { useClipboardCopy } from "../export/use-clipboard-copy";

export function QuickDemo() {
  const hydrated = useHydrated();
  const [id, setId] = useState<ExampleId>("signature");
  const [text, setText] = useState("Hello, developer.");
  const [style, setStyle] = useState<SignatureStyle>("neon");
  const [comparison, setComparison] = useState<"plain" | "styled">("styled");
  const [notice, setNotice] = useState("");
  const { copy, copying, failedCopy } = useClipboardCopy(({ kind }) => {
    setNotice(
      kind === "copying"
        ? ""
        : kind === "copied"
          ? "Copied console.log. Paste it in your own code when you are ready."
          : "Copy was blocked. Select the complete source below and copy it manually, or retry.",
    );
  });
  const session = useTransferSession();
  const result = useMemo(() => {
    try {
      const recipe = exampleRecipe(id, text, style);
      const selected = {
        ...recipe,
        options: {
          ...recipe.options,
          renderer:
            comparison === "plain"
              ? ("text" as const)
              : recipe.options.renderer,
        },
      };
      return {
        ok: true as const,
        recipe,
        selected,
        output: compileConsole(selected.scene, selected.options),
        source: exportConsoleLog(selected.scene, selected.options),
      };
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof Error
            ? error.message
            : "This message cannot be compiled. Edit the text or choose another style.",
      };
    }
  }, [id, text, style, comparison]);
  return (
    <section className="quick-demo" aria-labelledby="demo-title">
      <div className="demo-heading">
        <h2 id="demo-title">Try a message</h2>
        <span>Static by default</span>
      </div>
      <div className="choice-row" aria-label="Message purpose">
        {HERO_CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={!hydrated}
            aria-pressed={id === choice.id}
            onClick={() => {
              setId(choice.id);
              setText(
                EXAMPLES.find((example) => example.id === choice.id)!.text,
              );
              setNotice("");
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <div className="demo-edit-fields">
        <label htmlFor="try-message">
          {id === "signature" ? "Your message" : "Sample heading"}
          <input
            id="try-message"
            disabled={!hydrated}
            value={text}
            maxLength={128}
            onChange={(event) => {
              setText(event.target.value);
              setNotice("");
            }}
          />
        </label>
        {id === "signature" && (
          <label>
            Style
            <select
              value={style}
              onChange={(event) => {
                setStyle(event.target.value as SignatureStyle);
                setNotice("");
              }}
            >
              <option value="neon">Neon</option>
              <option value="rgbSplit">RGB split</option>
              <option value="chrome">Chrome</option>
            </select>
          </label>
        )}
      </div>
      <div className="comparison-heading">
        <div className="choice-row" aria-label="Message presentation">
          {(["plain", "styled"] as const).map((value) => (
            <button
              key={value}
              type="button"
              disabled={!hydrated}
              aria-pressed={comparison === value}
              onClick={() => {
                setComparison(value);
                setNotice("");
              }}
            >
              {value === "plain" ? "Plain" : "Styled"}
            </button>
          ))}
        </div>
        <span>
          {id === "signature"
            ? "Same words, your choice"
            : "Sample data · same facts"}
        </span>
      </div>
      {result.ok ? (
        <RevealFrame
          selection={comparison}
          plain={
            <ConsolePreview
              scene={result.recipe.scene}
              options={{ ...result.recipe.options, renderer: "text" }}
            />
          }
          styled={
            <ConsolePreview
              scene={result.recipe.scene}
              options={result.recipe.options}
            />
          }
        />
      ) : (
        <div className="demo-error">
          <p>{result.message}</p>
          <p>
            Your text is retained. Remove unsupported control characters or
            select another style.
          </p>
        </div>
      )}
      <div className="demo-actions">
        <button
          type="button"
          disabled={!hydrated || !result.ok}
          onClick={() => {
            if (!result.ok) return;
            console.log(...result.output.args);
            setNotice("Printed one message in this page’s console.");
          }}
        >
          Test in console
        </button>
        <button
          type="button"
          className="primary"
          disabled={!hydrated || !result.ok || copying}
          onClick={() => {
            if (result.ok) void copy(result.source.code, "Source");
          }}
        >
          {copying ? "Copying…" : "Copy console.log"}
        </button>
      </div>
      <p className="demo-instruction">
        Open DevTools → Console, then test this message. On mobile, preview or
        copy it here.
      </p>
      <div
        className="demo-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice}
      </div>
      {failedCopy !== null && (
        <label className="copy-recovery">
          Source from the blocked copy attempt
          <textarea
            readOnly
            rows={6}
            value={failedCopy.text}
            onFocus={(event) => event.target.select()}
          />
        </label>
      )}
      <details className="demo-source">
        <summary>Complete standalone source</summary>
        <label className="sr-only" htmlFor="demo-source">
          Demo JavaScript
        </label>
        <textarea
          id="demo-source"
          readOnly
          rows={5}
          value={result.ok ? result.source.code : ""}
        />
        {result.ok && (
          <p className="fine-print">
            {result.source.byteLength.toLocaleString("en-US")} UTF-8 bytes · No
            runtime package import.
          </p>
        )}
      </details>
      <button
        className="text-button"
        type="button"
        disabled={!result.ok || session.blocked}
        onClick={() => {
          if (result.ok) session.transfer(result.selected);
        }}
      >
        Edit in playground <span aria-hidden="true">↘</span>
      </button>
      {session.blocked && (
        <p className="fine-print">
          Finish the pending playground decision to transfer another example.
        </p>
      )}
      <p hidden={hydrated} className="demo-instruction">
        Enable JavaScript to edit, copy or test this example. The displayed
        message is a static preview.
      </p>
    </section>
  );
}
