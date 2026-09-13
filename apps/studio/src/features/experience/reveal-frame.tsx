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
  const content = selection === "plain" ? plain : styled;
  const previous = useRef({ selection, content });
  const [wipe, setWipe] = useState<{
    content: ReactNode;
    id: number;
  } | null>(null);
  useEffect(() => {
    if (previous.current.selection !== selection) {
      setWipe(
        enabled && ready.current
          ? { content: previous.current.content, id: performance.now() }
          : null,
      );
    } else if (!enabled) setWipe(null);
    // Decoration retains the last committed content, never a previous choice
    // reinterpreted with newly edited (and potentially incompatible) input.
    previous.current = { selection, content };
  }, [selection, content, enabled]);
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
      <div className="comparison-result">{content}</div>
      {enabled && wipe && (
        <div
          key={wipe.id}
          className="reveal-decoration"
          aria-hidden="true"
          inert
          onAnimationEnd={() => setWipe(null)}
        >
          {wipe.content}
        </div>
      )}
    </div>
  );
}
