// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type {
  MeasurementSnapshot,
  RenderRecipeV1,
  TextMeasurementRequest,
  ValidationResult,
} from "@servrox/console-fx";
import { neon } from "@servrox/console-fx/presets";
import { useLocalMeasurements } from "./use-local-measurements";

const workers: DeferredWorker[] = [];
class DeferredWorker {
  batch?: {
    requests: readonly TextMeasurementRequest[];
    environment: string;
  };
  onmessage?: (
    event: MessageEvent<ValidationResult<MeasurementSnapshot>>,
  ) => void;
  onerror?: () => void;
  terminate = vi.fn();
  constructor() {
    workers.push(this);
  }
  postMessage(batch: NonNullable<DeferredWorker["batch"]>) {
    this.batch = batch;
  }
  complete() {
    const { requests, environment } = this.batch!;
    const value: MeasurementSnapshot = {
      kind: "consoleFxMeasurements",
      measurementVersion: 1,
      environment,
      records: requests.map((request) => ({
        request,
        advance: 20,
        inkLeft: 0,
        inkRight: 20,
        ascent: 20,
        descent: 4,
      })),
    };
    this.onmessage?.({
      data: { ok: true, value, diagnostics: [] },
    } as MessageEvent<ValidationResult<MeasurementSnapshot>>);
  }
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  workers.length = 0;
});

it.each(["scene", "settings"])(
  "permits a fresh measurement after canceling and returning to earlier %s",
  (change) => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", DeferredWorker);
    const log = vi.spyOn(console, "log");
    const options: RenderRecipeV1["options"] = {
      target: "chromium",
      renderer: "svg",
      layout: {
        algorithm: "fit/v1",
        width: 360,
        maxHeight: 400,
        minFontSize: 12,
        overflow: "wrap-then-shrink",
        variant: "standard",
      },
    };
    const initial = { scene: neon({ text: "A" }), options };
    const hook = renderHook(
      ({ scene, options }) => useLocalMeasurements(scene, options),
      { initialProps: initial },
    );
    act(() => hook.result.current.measure());
    const retired = workers[0]!;
    expect(hook.result.current.pending).toBe(true);
    hook.rerender(
      change === "scene"
        ? { ...initial, scene: neon({ text: "B" }) }
        : {
            ...initial,
            options: {
              ...options,
              layout: { ...options.layout!, width: 480 },
            },
          },
    );
    expect(retired.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    hook.rerender(initial);
    expect(hook.result.current.pending).toBe(false);
    expect(hook.result.current.message).toBeUndefined();
    act(() => hook.result.current.measure());
    const active = workers[1]!;
    act(() => retired.complete());
    expect(hook.result.current.pending).toBe(true);
    expect(hook.result.current.snapshot).toBeUndefined();
    act(() => active.complete());
    expect(hook.result.current.pending).toBe(false);
    expect(hook.result.current.snapshot?.records.length).toBeGreaterThan(0);
    expect(active.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    expect(log).not.toHaveBeenCalled();
  },
);
