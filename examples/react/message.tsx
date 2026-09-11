"use client";
import { neon } from "@servrox/console-fx/presets";
import { ConsolePreview, useConsoleScene } from "@servrox/console-fx-react";

const options = { target: "chromium", renderer: "css" } as const;
export function Message({
  text = "Packed React message",
}: {
  readonly text?: string;
}) {
  const scene = neon({ text });
  const { log } = useConsoleScene(scene, options);
  return (
    <>
      <ConsolePreview scene={scene} options={options} />
      <button onClick={log}>Print message</button>
    </>
  );
}
