"use client";
import { useEffect, useState, type RefObject } from "react";

/** Observe only the owned preview box. Hidden/zero boxes defer compilation. */
export function usePreviewWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver !== "function") return;
    let frame: number | undefined;
    let next: number | null = null;
    const observer = new ResizeObserver(([entry]) => {
      const measured = entry?.contentRect.width ?? 0;
      next = measured >= 1 ? Math.min(1200, Math.floor(measured)) : null;
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        setWidth((previous) => (previous === next ? previous : next));
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [ref]);
  return width;
}
