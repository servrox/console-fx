"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePageEffects } from "./page-effects";
import { observeIntersection } from "./observe-intersection";

export function RevealFrame({
  selection,
  plain,
  styled,
}: {
  readonly selection: "plain" | "styled";
  readonly plain: ReactNode;
  readonly styled: ReactNode;
}) {
  const enabled = usePageEffects();
  const frame = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const previous = useRef(selection);
  const [wipe, setWipe] = useState<{
    from: "plain" | "styled";
    id: number;
  } | null>(null);
  useEffect(() => {
    if (previous.current !== selection) {
      setWipe(
        enabled && ready.current
          ? { from: previous.current, id: performance.now() }
          : null,
      );
      previous.current = selection;
    } else if (!enabled) setWipe(null);
  }, [selection, enabled]);
  useEffect(() => {
    const observer = observeIntersection(frame.current, (entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) setWipe(null);
    });
    ready.current = !!observer;
    return () => {
      ready.current = false;
      observer?.disconnect();
    };
  }, []);
  return (
    <div className="reveal-frame" ref={frame}>
      <div className="comparison-result">
        {selection === "plain" ? plain : styled}
      </div>
      {enabled && wipe && (
        <div
          key={wipe.id}
          className="reveal-decoration"
          aria-hidden="true"
          inert
          onAnimationEnd={() => setWipe(null)}
        >
          {wipe.from === "plain" ? plain : styled}
        </div>
      )}
    </div>
  );
}
