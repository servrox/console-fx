// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { defineScene } from "@servrox/console-fx";
import { compileConsole } from "@servrox/console-fx/browser";
import { lightningMetal } from "@servrox/console-fx/presets";
import { FitInspector } from "./fit-inspector";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps fitting controls usable when an optional SVG reference exceeds its resource limit", () => {
  vi.useFakeTimers();
  let resize: (width: number) => void;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = (width) =>
          callback(
            [{ contentRect: { width } }] as ResizeObserverEntry[],
            this as unknown as ResizeObserver,
          );
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  const log = vi.spyOn(console, "log");
  const valid = lightningMetal({ text: "LIGHTNING" });
  const scene = defineScene({
    ...valid,
    lines: [
      { runs: Array.from({ length: 32 }, () => valid.lines[0]!.runs[0]!) },
    ],
  });
  const options = { target: "chromium", renderer: "text" } as const;
  const textBefore = compileConsole(scene, options).text;
  const onApply = vi.fn();
  const props = {
    scene,
    options,
    fitting: { status: "available" } as const,
    sizing: { status: "available" } as const,
    onApply,
    measurement: { pending: false },
    onMeasure: vi.fn(),
    onClearMeasurements: vi.fn(),
  };
  const view = render(<FitInspector {...props} />);
  act(() => {
    resize(360);
    vi.runOnlyPendingTimers();
  });
  const reference = view.getByText(
    "Reference: original SVG without fitting",
  ).parentElement!;
  expect(within(reference).getByText(/SVG element limit/)).toBeTruthy();
  expect(onApply).not.toHaveBeenCalled();
  fireEvent.change(view.getByLabelText("Export display width (px)"), {
    target: { value: "480" },
  });
  fireEvent.click(
    view.getByRole("button", { name: "Use this width for export" }),
  );
  expect(onApply).toHaveBeenCalledExactlyOnceWith({
    ...options,
    renderer: "svg",
    layout: expect.objectContaining({ width: 360 }),
    sizing: { mode: "fixed", width: 480 },
  });
  expect(compileConsole(scene, options).text).toBe(textBefore);
  view.rerender(<FitInspector {...props} scene={valid} />);
  expect(within(reference).queryByText(/SVG element limit/)).toBeNull();
  expect(
    within(reference).getByRole("img", { hidden: true }).getAttribute("alt"),
  ).toBe("LIGHTNING");
  onApply.mockClear();
  const retained = {
    target: "chromium",
    renderer: "svg",
    layout: {
      algorithm: "fit/v1",
      width: 720,
      maxHeight: 400,
      variant: "standard",
      overflow: "shrink",
      minFontSize: 12,
    },
    sizing: { mode: "fixed", width: 720 },
  } as const;
  const unavailable = {
    status: "unavailable",
    reason: "Disabled by policy; saved settings stay intact.",
  } as const;
  view.rerender(
    <FitInspector
      {...props}
      scene={valid}
      options={retained}
      fitting={unavailable}
    />,
  );
  act(() => {
    resize(360);
    vi.runOnlyPendingTimers();
  });
  expect(
    (view.getByLabelText("Layout variant") as HTMLSelectElement).closest(
      "fieldset",
    )?.disabled,
  ).toBe(true);
  fireEvent.change(view.getByLabelText("Export display width (px)"), {
    target: { value: "480" },
  });
  fireEvent.click(
    view.getByRole("button", { name: "Use this width for export" }),
  );
  expect(onApply.mock.lastCall?.[0]).toEqual({
    ...retained,
    sizing: { mode: "fixed", width: 480 },
  });
  view.rerender(
    <FitInspector
      {...props}
      scene={valid}
      options={retained}
      sizing={unavailable}
    />,
  );
  fireEvent.click(
    view.getByRole("button", { name: "Use this width for export" }),
  );
  expect(onApply.mock.lastCall?.[0]).toMatchObject({
    layout: { width: 360 },
    sizing: retained.sizing,
  });
  expect(log).not.toHaveBeenCalled();
});
