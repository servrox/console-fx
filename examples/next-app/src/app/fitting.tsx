"use client";
import { useState } from "react";
import type { LayoutRequest } from "@servrox/console-fx";
import { lightningMetal } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";

const scene = lightningMetal({ text: "FITTED NEXT" });
export function Fitting() {
  const [width, setWidth] = useState(360);
  const layout: LayoutRequest = {
    algorithm: "fit/v1",
    width,
    maxHeight: 400,
    variant: "standard",
    overflow: "shrink",
    minFontSize: 12,
  };
  const options = {
    target: "chromium",
    renderer: "svg",
    motion: "reduce",
    layout,
  } as const;
  const { log } = useConsoleScene(scene, options);
  return (
    <section aria-label="Packed fitting consumer">
      <ConsolePreview scene={scene} options={options} />
      <button onClick={() => setWidth(280)}>Use 280px preview</button>
      <button onClick={log}>Print fitted message</button>
    </section>
  );
}
