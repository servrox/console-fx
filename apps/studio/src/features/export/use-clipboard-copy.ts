"use client";
import { useEffect, useRef, useState } from "react";

type CopyAttempt = { readonly text: string; readonly label: string };
type CopyNotice = CopyAttempt & {
  readonly kind: "copying" | "copied" | "failed";
};

/** Owns one captured clipboard attempt, including recovery after later edits. */
export function useClipboardCopy(notify: (notice: CopyNotice) => void) {
  const pending = useRef<object | null>(null);
  const mounted = useRef(false);
  const [copying, setCopying] = useState(false);
  const [failedCopy, setFailedCopy] = useState<CopyAttempt | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, []);

  async function copy(text: string, label: string) {
    if (!mounted.current || pending.current) return;
    const attempt = { text, label };
    pending.current = attempt;
    setCopying(true);
    notify({ ...attempt, kind: "copying" });
    try {
      await navigator.clipboard.writeText(text);
      if (pending.current !== attempt) return;
      setFailedCopy(null);
      notify({ ...attempt, kind: "copied" });
    } catch {
      if (pending.current !== attempt) return;
      setFailedCopy(attempt);
      notify({ ...attempt, kind: "failed" });
    } finally {
      if (pending.current === attempt) {
        pending.current = null;
        setCopying(false);
      }
    }
  }
  return { copy, copying, failedCopy };
}
