"use client";
import { useEffect, useRef, useState } from "react";
import { prepareTextMeasurements } from "@servrox/console-fx/browser";
import type {
  SceneV1,
  RenderRecipeV1,
  MeasurementSnapshot,
  ValidationResult,
} from "@servrox/console-fx";

export function useLocalMeasurements(
  scene: SceneV1,
  options: RenderRecipeV1["options"],
) {
  const key = JSON.stringify({ scene, options });
  const job = useRef<{
    worker: Worker;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const [state, setState] = useState<{
    key: string;
    message: string;
    pending?: boolean;
    snapshot?: MeasurementSnapshot;
  } | null>(null);
  function cancel() {
    if (!job.current) return;
    job.current.worker.terminate();
    clearTimeout(job.current.timer);
    job.current = null;
    setState((previous) => (previous?.pending ? null : previous));
  }
  useEffect(() => cancel, [key]);
  function measure() {
    cancel();
    if (!options.layout || options.renderer !== "svg") {
      setState({
        key,
        message:
          "Choose SVG and apply a fitting width before measuring export fonts.",
      });
      return;
    }
    const browser =
      navigator.userAgent.match(/(?:Edg|Chrome)\/[\d.]+/g)?.join(";") ??
      "unknown-browser";
    const environment =
      `${navigator.platform};${browser};worker-local-fonts/v1`.slice(0, 160);
    const result = prepareTextMeasurements(scene, {
      ...options,
      motion: options.motion === "system" ? "allow" : "reduce",
      measurementEnvironment: environment,
    });
    if (!result.ok) {
      setState({ key, message: result.diagnostics[0]!.message });
      return;
    }
    if (!result.value.length) {
      setState({
        key,
        message:
          "This output uses authored geometry; no local font measurement is needed.",
      });
      return;
    }
    try {
      const worker = new Worker(
        new URL("./measure.worker.ts", import.meta.url),
      );
      const finish = (message: string, snapshot?: MeasurementSnapshot) => {
        if (job.current?.worker !== worker) return;
        cancel();
        setState({ key, message, ...(snapshot ? { snapshot } : {}) });
      };
      const timer = setTimeout(
        () =>
          finish(
            "Local measurements timed out. Your scene and saved settings are unchanged.",
          ),
        8000,
      );
      job.current = { worker, timer };
      worker.onmessage = (
        event: MessageEvent<ValidationResult<MeasurementSnapshot>>,
      ) => {
        const measured = event.data;
        if (measured.ok)
          finish(
            "Local font data is ready for this scene and export settings. Recipient fonts may differ; these measurements are not saved.",
            measured.value,
          );
        else
          finish(
            measured.diagnostics[0]?.message ??
              "Local measurement is unavailable.",
          );
      };
      worker.onerror = () =>
        finish(
          "Local font measurement is unavailable. Estimated bounds remain labeled; your work is unchanged.",
        );
      setState({
        key,
        message: "Measuring the requested local-font fragments…",
        pending: true,
      });
      worker.postMessage({ requests: result.value, environment });
    } catch {
      cancel();
      setState({
        key,
        message: "This browser could not start local font measurements.",
      });
    }
  }
  const current = state?.key === key ? state : null;
  return {
    measure,
    clear: () => {
      cancel();
      setState(null);
    },
    pending: Boolean(current?.pending),
    message: current?.message,
    snapshot: current?.snapshot,
  };
}
