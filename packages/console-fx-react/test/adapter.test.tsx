// @vitest-environment jsdom
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { badge, neon } from "@servrox/console-fx/presets";
import { compileConsole } from "@servrox/console-fx/browser";
import {
  ConsoleBanner,
  ConsolePreview,
  useConsoleScene,
} from "../src/index.js";

afterEach(cleanup);
describe("public React adapter", () => {
  it("keeps server rendering, disabled banners, and previews silent", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const scene = neon();
    expect(renderToString(<ConsoleBanner scene={scene} enabled />)).toBe("");
    expect(renderToString(<ConsolePreview scene={scene} />)).toContain(
      "Plain-text preview",
    );
    render(<ConsoleBanner scene={scene} />);
    expect(log).not.toHaveBeenCalled();
  });
  it("emits once when first enabled, using current scene despite Strict Mode replay and later toggles", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const first = badge({ text: "first" });
    const latest = badge({ text: "latest" });
    const app = render(
      <StrictMode>
        <ConsoleBanner scene={first} />
      </StrictMode>,
    );
    expect(log).not.toHaveBeenCalled();
    app.rerender(
      <StrictMode>
        <ConsoleBanner scene={latest} enabled />
      </StrictMode>,
    );
    expect(log).toHaveBeenCalledExactlyOnceWith("latest");
    app.rerender(
      <StrictMode>
        <ConsoleBanner scene={first} enabled={false} />
      </StrictMode>,
    );
    app.rerender(
      <StrictMode>
        <ConsoleBanner scene={first} enabled />
      </StrictMode>,
    );
    expect(log).toHaveBeenCalledTimes(1);
    app.unmount();
    render(
      <StrictMode>
        <ConsoleBanner scene={first} enabled />
      </StrictMode>,
    );
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenLastCalledWith("first");
  });
  it("does not duplicate an initially enabled effect on development replay", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(
      <StrictMode>
        <ConsoleBanner scene={badge()} enabled />
      </StrictMode>,
    );
    expect(log).toHaveBeenCalledTimes(1);
  });
  it("logs only explicit clicks and reads the current scene and media preference at each click", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const media = vi.fn().mockReturnValue({ matches: false });
    vi.stubGlobal("matchMedia", media);
    const options = {
      target: "chromium",
      renderer: "svg",
      motion: "system",
    } as const;
    function Button({ text }: { text: string }) {
      const { log } = useConsoleScene(neon({ text, motion: "wave" }), options);
      return <button onClick={log}>Print banner</button>;
    }
    const app = render(
      <StrictMode>
        <Button text="before" />
      </StrictMode>,
    );
    expect(log).not.toHaveBeenCalled();
    expect(media).not.toHaveBeenCalled();
    app.rerender(
      <StrictMode>
        <Button text="current" />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Print banner" }));
    expect(log).toHaveBeenLastCalledWith(
      ...compileConsole(neon({ text: "current", motion: "wave" }), {
        target: "chromium",
        renderer: "svg",
        motion: "reduce",
      }).args,
    );
    media.mockReturnValue({ matches: true });
    fireEvent.click(screen.getByRole("button", { name: "Print banner" }));
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenLastCalledWith(
      ...compileConsole(neon({ text: "current", motion: "wave" }), {
        target: "chromium",
        renderer: "svg",
        motion: "allow",
      }).args,
    );
    vi.unstubAllGlobals();
  });
  it("renders the exact SVG URI and caption, with static default and no logging", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const scene = neon({ text: "<safe> %c", motion: "wave" });
    const options = { target: "chromium", renderer: "svg" } as const;
    const output = compileConsole(scene, options);
    render(<ConsolePreview scene={scene} options={options} />);
    const image = screen.getByRole("img", { name: "<safe> %c" });
    expect(image.getAttribute("src")).toBe(
      output.preview.kind === "svg" ? output.preview.imageUri : "",
    );
    expect(decodeURIComponent(image.getAttribute("src")!)).not.toContain(
      "<animate",
    );
    expect(log).not.toHaveBeenCalled();
  });
  it("uses literal CSS preview text and the required approximation label", () => {
    render(
      <ConsolePreview
        scene={badge({ text: "100% %s" })}
        options={{ renderer: "css", target: "chromium" }}
      />,
    );
    expect(screen.getByText("100% %s").style.background).toBe(
      "rgb(34, 211, 238)",
    );
    expect(screen.getByText("Approximate browser preview")).toBeTruthy();
  });
});
