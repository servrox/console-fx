"use client";
import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { usePageEffects } from "../experience/page-effects";

export function ExampleCard({
  selected,
  onClick,
  disabled,
  children,
  label,
}: {
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly children: ReactNode;
  readonly label: string;
}) {
  const enabled = usePageEffects();
  const surface = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);
  const position = useRef({ x: 0, y: 0 });
  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    surface.current?.removeAttribute("style");
  }
  useEffect(() => {
    if (!enabled) reset();
    const observer = new IntersectionObserver((entries) => {
      if (entries.every((entry) => !entry.isIntersecting)) reset();
    });
    const node = surface.current;
    if (node) observer.observe(node);
    return () => {
      observer.disconnect();
      reset();
    };
  }, [enabled]);
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (
      !enabled ||
      event.pointerType !== "mouse" ||
      document.activeElement === event.currentTarget
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    position.current = { x: event.clientX - rect.x, y: event.clientY - rect.y };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      surface.current?.style.setProperty(
        "--light-x",
        `${position.current.x}px`,
      );
      surface.current?.style.setProperty(
        "--light-y",
        `${position.current.y}px`,
      );
    });
  }
  return (
    <button
      type="button"
      className="example-card"
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={reset}
      onFocus={reset}
    >
      <span className="example-card-surface" ref={surface}>
        {children}
      </span>
    </button>
  );
}
