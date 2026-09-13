// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PageEffects } from "../experience/page-effects";
import { LandingSession } from "./session";
import { QuickDemo } from "./quick-demo";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("retains valid Plain output when editing past rich limits during a reveal", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const log = vi.spyOn(console, "log");
  const view = render(
    <PageEffects>
      <LandingSession>
        <QuickDemo />
      </LandingSession>
    </PageEffects>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dev context" }));
  const previous = view.container
    .querySelector(".comparison-result img")
    ?.getAttribute("src");
  expect(previous).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Plain" }));
  const decoration = view.container.querySelector(".reveal-decoration")!;
  expect(decoration).not.toBeNull();
  const text = "A".repeat(60);
  expect(() =>
    fireEvent.change(screen.getByLabelText("Sample heading"), {
      target: { value: text },
    }),
  ).not.toThrow();
  expect(
    view.container.querySelector(".comparison-result")?.textContent,
  ).toContain(text);
  expect(
    (screen.getByLabelText("Demo JavaScript") as HTMLTextAreaElement).value,
  ).toContain(text);
  expect(decoration.querySelector("img")?.getAttribute("src")).toBe(previous);
  expect(
    (screen.getByLabelText("Sample heading") as HTMLInputElement).value,
  ).toBe(text);
  expect(log).not.toHaveBeenCalled();
});
