"use client";
import { useState } from "react";
import { liquidChrome } from "@servrox/console-fx/presets";
import {
  ConsoleBanner,
  ConsolePreview,
  useConsoleScene,
} from "@servrox/console-fx-react";

const options = { target: "chromium", renderer: "svg" } as const;
export function BannerControls() {
  const [enabled, setEnabled] = useState(false);
  const [instance, setInstance] = useState(0);
  const [text, setText] = useState("Packed Next banner");
  const scene = liquidChrome({ text });
  const { log } = useConsoleScene(scene, options);
  return (
    <section aria-label="Console example">
      <ConsoleBanner
        key={instance}
        scene={scene}
        options={options}
        enabled={enabled}
      />
      <ConsolePreview scene={scene} options={options} />
      <label>
        Message
        <input value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <button onClick={() => setEnabled((value) => !value)}>
        {enabled ? "Disable banner" : "Enable banner"}
      </button>
      <button onClick={() => setInstance((value) => value + 1)}>
        Remount banner
      </button>
      <button onClick={log}>Print message</button>
    </section>
  );
}
