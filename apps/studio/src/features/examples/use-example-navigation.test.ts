// @vitest-environment jsdom
import { createElement, StrictMode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { neon } from "@servrox/console-fx/presets";
import { useDocumentSession } from "../editor/use-document-session";
import { recipeOf } from "../editor/document";
import { DRAFT_KEY } from "../persistence/draft";
import { encodeShare } from "../persistence/documents";
import { DEFAULT_EXAMPLE_ID, resolveExample } from "./catalogue";
import { useExampleNavigation } from "./use-example-navigation";
const get = (id: string) => {
  const r = resolveExample({ exampleId: id });
  if (!r.ok) throw Error(r.message);
  return r.recipe;
};
const prior = neon({ text: "valuable draft" });
function workbench() {
  return renderHook(
    () => {
      const session = useDocumentSession(get(DEFAULT_EXAMPLE_ID));
      const navigation = useExampleNavigation(session, true);
      return { session, navigation };
    },
    { wrapper: ({ children }) => createElement(StrictMode, null, children) },
  );
}
function navigate(url: string) {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event("popstate"));
  window.dispatchEvent(new Event("hashchange"));
}
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  window.history.replaceState(null, "", "/studio/");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("workbench navigation through the document session", () => {
  it("resumes work, confirms one load, and reconciles Undo/Redo without another load", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(prior));
    window.history.replaceState(null, "", "/studio/?example=preset%3Aneon");
    const { result } = workbench();
    expect(result.current.session.document.scene).toEqual(prior);
    expect(result.current.navigation.pending?.id).toBe("preset:neon");
    act(() => result.current.navigation.settle(false));
    expect(result.current.session.document.scene).toEqual(prior);
    expect(window.location.search).toBe("");
    act(() => result.current.navigation.request("preset:neon"));
    act(() => result.current.navigation.settle(true));
    expect(result.current.session.document.past).toHaveLength(1);
    expect(recipeOf(result.current.session.document)).toEqual(
      get("preset:neon"),
    );
    act(() => result.current.session.dispatch({ type: "undo" }));
    expect(result.current.session.document.scene).toEqual(prior);
    expect(window.location.search).not.toContain("example=");
    act(() => result.current.session.dispatch({ type: "redo" }));
    expect(window.location.search).toContain("preset%3Aneon");
    expect(result.current.navigation.pending).toBeNull();
    expect(result.current.session.document.past).toHaveLength(1);
  });
  it("lets valid or invalid explicit shares suppress the example query", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(prior));
    window.history.replaceState(
      null,
      "",
      "/studio/?example=preset%3Aneon#scene=invalid",
    );
    const { result } = workbench();
    expect(result.current.session.document.scene).toEqual(prior);
    expect(result.current.navigation.pending).toBeNull();
    expect(result.current.session.notice?.kind).toBe("error");
  });
  it.each([
    "/studio/",
    "/studio/?example=missing",
    "/studio/?category=missing",
  ])("supersedes a stale shared confirmation when navigating to %s", (url) => {
    const { result } = workbench();
    const shared = encodeShare(prior);
    if (!shared.ok) throw Error("share");
    act(() => navigate(`/studio/${shared.value}`));
    expect(result.current.session.pendingShared).not.toBeNull();
    act(() => navigate(url));
    expect(result.current.session.pendingShared).toBeNull();
    expect(result.current.session.document.scene).toEqual(
      get(DEFAULT_EXAMPLE_ID).scene,
    );
    if (url.includes("missing"))
      expect(result.current.navigation.error).toContain("unavailable");
    act(() =>
      result.current.session.dispatch({ type: "replace", scene: prior }),
    );
    act(() => vi.runAllTimers());
    expect(result.current.session.document.scene).toEqual(prior);
  });
  it("clears a stale pending example when Forward returns to unchanged current work", () => {
    const { result } = workbench();
    const original = window.location.href;
    act(() => navigate("/studio/?example=preset%3Aneon"));
    expect(result.current.navigation.pending?.id).toBe("preset:neon");
    act(() => navigate(original));
    expect(result.current.navigation.pending).toBeNull();
    expect(result.current.session.document.past).toHaveLength(0);
  });
  it("accepts an initial share while reporting bad discovery metadata, then clears stale content after editing", () => {
    const shared = encodeShare(prior);
    if (!shared.ok) throw Error("share");
    window.history.replaceState(
      null,
      "",
      `/studio/?category=missing&example=preset%3Aneon${shared.value}`,
    );
    const { result } = workbench();
    expect(result.current.session.document.scene).toEqual(prior);
    expect(result.current.navigation.error).toContain("category");
    act(() =>
      result.current.session.dispatch({
        type: "replace",
        scene: neon({ text: "changed" }),
      }),
    );
    expect(window.location.hash).toBe("");
    expect(window.location.search).not.toContain("example=");
  });
  it("keeps browsing and reselecting unchanged work out of document history and storage", () => {
    const { result } = workbench();
    const before = result.current.session.document;
    const writes = vi.spyOn(Storage.prototype, "setItem");
    act(() => {
      result.current.navigation.setCategory("runtime");
      result.current.navigation.request(DEFAULT_EXAMPLE_ID);
    });
    act(() => vi.runAllTimers());
    expect(result.current.session.document).toBe(before);
    expect(writes).not.toHaveBeenCalled();
    writes.mockRestore();
  });
});
