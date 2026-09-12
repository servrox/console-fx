"use client";
import { getPresentationDescriptors } from "@servrox/console-fx";
import { createPresetExample } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";
import type { CardPresetId } from "@servrox/console-fx";

const options = { target: "chromium", renderer: "svg" } as const;
function Card({ id }: { id: CardPresetId }) {
  const scene = createPresetExample(id);
  const { log } = useConsoleScene(scene, options);
  return (
    <section aria-label={scene.label}>
      <ConsolePreview scene={scene} options={options} />
      <button onClick={log}>Print {id}</button>
    </section>
  );
}
export function Cards() {
  return (
    <section aria-label="Packed card consumers">
      {getPresentationDescriptors().map(({ id }) => (
        <Card key={id} id={id} />
      ))}
    </section>
  );
}
