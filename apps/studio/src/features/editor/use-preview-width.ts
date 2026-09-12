"use client";
import { useEffect, useState, type RefObject } from "react";

/** Observe only the owned preview box. Hidden/zero boxes defer compilation. */
export function usePreviewWidth(ref: RefObject<HTMLElement | null>) {
  const [observation, setObservation] = useState<{
    width: number | null;
    unavailable: boolean;
  }>({ width: null, unavailable: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame: number | undefined;
    let next: number | null = null;
    let observer: ResizeObserver | undefined;
    let active = true;
    const stop = () => {
      active = false;
      try {
        observer?.disconnect();
      } catch {
        // Cleanup must not turn an optional browser failure into an editor error.
      }
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
    try {
      observer = new ResizeObserver(([entry]) => {
        if (!active) return;
        const measured = entry?.contentRect.width ?? 0;
        next = measured >= 1 ? Math.min(1200, Math.floor(measured)) : null;
        if (frame !== undefined) return;
        frame = requestAnimationFrame(() => {
          frame = undefined;
          if (active)
            setObservation((previous) =>
              previous.width === next
                ? previous
                : { width: next, unavailable: false },
            );
        });
      });
      observer.observe(element);
    } catch {
      stop();
      frame = requestAnimationFrame(() => {
        frame = undefined;
        setObservation({ width: null, unavailable: true });
      });
    }
    return stop;
  }, [ref]);
  return observation;
}
