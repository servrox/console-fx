"use client";
import type { PresentationDescriptor, SceneV1 } from "@servrox/console-fx";
import { resolveCardStatus } from "./presentation";

export function CardFields({
  scene,
  descriptor,
  onChange,
  onSelect,
}: {
  readonly scene: SceneV1;
  readonly descriptor: PresentationDescriptor;
  readonly onChange: (scene: unknown) => void;
  readonly onSelect: (selection: { line: number; run: number }) => void;
}) {
  return (
    <div className="card-fields">
      <p className="fine-print">
        {descriptor.name} ·{" "}
        {descriptor.group === "Useful"
          ? "You supply the facts. Catalog examples use sample data."
          : "Static artwork with editable text."}
      </p>
      {descriptor.slots.map((slot) => {
        const run = scene.lines[slot.line]?.runs[slot.run];
        if (!run)
          return (
            <p className="error-text" key={slot.id}>
              Missing {slot.label}. Restore the card or detach it.
            </p>
          );
        const change = (text: string) =>
          onChange(
            resolveCardStatus({
              ...scene,
              lines: scene.lines.map((line, li) =>
                li !== slot.line
                  ? line
                  : {
                      ...line,
                      runs: line.runs.map((run, ri) =>
                        ri !== slot.run ? run : { ...run, text },
                      ),
                    },
              ),
            }),
          );
        return (
          <label key={slot.id}>
            {slot.label}
            {slot.values ? (
              <select
                value={run.text}
                onFocus={() => onSelect({ line: slot.line, run: slot.run })}
                onChange={(event) => change(event.target.value)}
              >
                {!slot.values.includes(run.text) && (
                  <option value={run.text}>{run.text} (unsupported)</option>
                )}
                {slot.values.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            ) : (
              <textarea
                rows={2}
                value={run.text}
                onFocus={() => onSelect({ line: slot.line, run: slot.run })}
                onChange={(event) => change(event.target.value)}
              />
            )}
          </label>
        );
      })}
      <p className="fine-print">
        This profile owns its layout and typography. Long text can require plain
        output. Detaching keeps every word and can be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          const candidate = { ...scene };
          delete candidate.presentation;
          onChange(candidate);
        }}
      >
        Detach card layout
      </button>
    </div>
  );
}
