// @vitest-environment jsdom
import { createElement, StrictMode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { neon } from "@servrox/console-fx/presets";
import { encodeShare } from "../persistence/documents";
import { DRAFT_KEY } from "../persistence/draft";
import {
  useDocumentSession,
  type DocumentSessionOptions,
} from "./use-document-session";

const initial = neon({ text: "initial" });
const current = neon({ text: "valuable work" });
const incoming = neon({ text: "incoming" });
const file = (source: unknown) => ({
  size: 100,
  text: async () => JSON.stringify(source),
});
function deferredFile() {
  let resolve!: (source: string) => void;
  let reject!: (error: Error) => void;
  const source = new Promise<string>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { file: { size: 100, text: () => source }, resolve, reject };
}
function session() {
  return renderHook(
    (options: DocumentSessionOptions) => useDocumentSession(initial, options),
    {
      initialProps: {} as DocumentSessionOptions,
      wrapper: ({ children }) => createElement(StrictMode, null, children),
    },
  );
}
beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("document session transitions", () => {
  it("resumes the draft once during effect replay and loads an import as one undoable change", async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(current));
    const writes = vi.spyOn(Storage.prototype, "setItem");
    const hook = session();
    expect(hook.result.current.ready).toBe(true);
    expect(hook.result.current.document.scene).toEqual(current);
    act(() => vi.runAllTimers());
    expect(writes).not.toHaveBeenCalled();
    await act(() => hook.result.current.importFile(file(incoming)));
    expect(hook.result.current.document.scene).toEqual(incoming);
    expect(hook.result.current.document.past).toHaveLength(1);
    act(() => hook.result.current.dispatch({ type: "undo" }));
    expect(hook.result.current.document.scene).toEqual(current);
  });

  it.each([
    "edit",
    "newer import",
    "shared decision",
    "reset decision",
    "example decision",
    "unmount",
  ])(
    "invalidates a delayed read on %s through the session interface",
    async (transition) => {
      const hook = session();
      act(() =>
        hook.result.current.dispatch({ type: "replace", scene: current }),
      );
      const deferred = deferredFile();
      let pending!: Promise<void>;
      act(() => {
        pending = hook.result.current.importFile(deferred.file);
      });
      if (transition === "edit")
        act(() =>
          hook.result.current.dispatch({ type: "replace", scene: incoming }),
        );
      if (transition === "newer import")
        await act(() => hook.result.current.importFile(file(incoming)));
      if (transition === "reset decision")
        act(() => hook.result.current.requestReset());
      if (transition === "example decision")
        act(() => hook.result.current.beginReplacement());
      if (transition === "shared decision") {
        const share = encodeShare(incoming);
        if (!share.ok) throw new Error("Fixture must fit a shared URL");
        act(() => {
          window.history.replaceState(null, "", share.value);
          window.dispatchEvent(new Event("hashchange"));
        });
      }
      if (transition === "unmount") hook.unmount();
      const before = hook.result.current.document;
      const beforeNotice = hook.result.current.notice;
      await act(async () => {
        deferred.resolve(JSON.stringify(neon({ text: "stale read" })));
        await pending;
      });
      expect(hook.result.current.document).toBe(before);
      expect(hook.result.current.notice).toBe(beforeNotice);
    },
  );

  it("suppresses stale read errors and rejects oversized input before reading", async () => {
    const hook = session();
    const deferred = deferredFile();
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.importFile(deferred.file);
    });
    act(() => hook.result.current.requestReset());
    const notice = hook.result.current.notice;
    await act(async () => {
      deferred.reject(new Error("old failure"));
      await pending;
    });
    expect(hook.result.current.notice).toBe(notice);
    const text = vi.fn();
    await act(() => hook.result.current.importFile({ size: 65537, text }));
    expect(text).not.toHaveBeenCalled();
    expect(hook.result.current.document.scene).toEqual(initial);
  });

  it("holds a conflicting shared scene until a decision and preserves current work through accept and Undo", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(current));
    const share = encodeShare(incoming);
    if (!share.ok) throw new Error("Invalid share fixture");
    window.history.replaceState(null, "", share.value);
    const hook = session();
    expect(hook.result.current.pendingShared).toEqual(incoming);
    expect(hook.result.current.document.scene).toEqual(current);
    act(() => vi.runAllTimers());
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!)).toEqual(current);
    act(() => hook.result.current.settleShared(true));
    expect(hook.result.current.pendingShared).toBeNull();
    expect(hook.result.current.document.scene).toEqual(incoming);
    act(() => hook.result.current.dispatch({ type: "undo" }));
    expect(hook.result.current.document.scene).toEqual(current);
  });

  it("cancels Reset, retains stored bytes on confirmed Reset, and clears only the draft on clear", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(current));
    const hook = session();
    act(() => hook.result.current.requestReset());
    act(() => hook.result.current.settleReset(false));
    expect(hook.result.current.document.scene).toEqual(current);
    act(() => hook.result.current.requestReset());
    act(() => hook.result.current.settleReset(true));
    act(() => vi.runAllTimers());
    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!)).toEqual(current);
    const memory = hook.result.current.document;
    act(() => {
      hook.result.current.clearDraft();
      vi.runAllTimers();
    });
    expect(hook.result.current.document).toBe(memory);
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
