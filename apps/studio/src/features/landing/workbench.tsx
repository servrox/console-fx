"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTransferSession } from "./session";
import { useHydrated } from "../experience/use-hydrated";

const Editor = dynamic(
  () => import("../editor/studio").then((module) => module.Studio),
  {
    ssr: false,
    loading: () => <p role="status">Opening the playground…</p>,
  },
);
export function Workbench() {
  const hydrated = useHydrated();
  const [opened, setOpened] = useState(false);
  const section = useRef<HTMLDivElement>(null);
  const session = useTransferSession();
  useEffect(() => {
    const fromFragment = () => {
      if (
        location.hash === "#playground" ||
        location.hash.startsWith("#scene=")
      )
        setOpened(true);
    };
    fromFragment();
    addEventListener("hashchange", fromFragment);
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries, activeObserver) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                setOpened(true);
                activeObserver.disconnect();
              }
            },
            { rootMargin: "400px" },
          )
        : null;
    if (section.current) observer?.observe(section.current);
    return () => {
      observer?.disconnect();
      removeEventListener("hashchange", fromFragment);
    };
  }, []);
  return (
    <div id="playground" className="landing-workbench" ref={section}>
      {opened || session.request ? (
        <Editor
          integrated
          transfer={session.request}
          onTransferDone={session.finish}
          onSharedDecisionChange={session.sharedDecision}
        />
      ) : (
        <div className="workbench-placeholder">
          <p className="eyebrow">Your message, from first word to final code</p>
          <h2>Choose. Change. Copy.</h2>
          <p>
            The full playground has every preset, line and style control, plus
            drafts, undo and complete exports.
          </p>
          <button
            type="button"
            disabled={!hydrated}
            onClick={() => setOpened(true)}
          >
            Open the playground
          </button>
          <div hidden={hydrated}>
            <p>
              The editor needs JavaScript. The examples and integration guide
              remain available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
