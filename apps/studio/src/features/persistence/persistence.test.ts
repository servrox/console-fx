import { afterEach, describe, expect, it, vi } from "vitest";
import { defineScene, parseRenderRecipe } from "@servrox/console-fx";
import { neon, rainbow } from "@servrox/console-fx/presets";
import {
  documentReducer,
  initialDocument,
  recipeOf,
  savedDocument,
} from "../editor/document";
import { decodeDocument, decodeShare, encodeShare } from "./documents";
import { DRAFT_KEY, RECIPE_DRAFT_KEY, DraftStore } from "./draft";

afterEach(() => vi.useRealTimers());
describe("validated editor documents", () => {
  it("round-trips materialized Unicode scenes through JSON and share fragments", () => {
    const scene = neon({ text: "👩🏽‍💻 é %c <script>" });
    expect(decodeDocument(JSON.stringify(scene))).toEqual({
      ok: true,
      value: scene,
      diagnostics: [],
    });
    const link = encodeShare(scene);
    expect(link.ok).toBe(true);
    if (link.ok)
      expect(decodeShare(link.value)).toEqual({
        ok: true,
        value: scene,
        diagnostics: [],
      });
  });
  it.each([
    "{",
    '{"schemaVersion":2}',
    JSON.stringify({ schemaVersion: 1, label: "\u001b[31m", lines: [] }),
    "é".repeat(32769),
  ])(
    "rejects invalid, future, unsafe and oversized documents: %s",
    (source) => {
      expect(decodeDocument(source).ok).toBe(false);
    },
  );
  it.each([
    "#scene=a",
    "#scene=!!!!",
    "#scene=/w",
    `#scene=${"a".repeat(8200)}`,
    "#other=123",
  ])("rejects malformed or oversized shared input: %s", (fragment) => {
    expect(decodeShare(fragment).ok).toBe(false);
  });
  it.each(["scene", "recipe"])(
    "offers a faithful %s export when a share link exceeds its byte budget",
    (kind) => {
      const scene = defineScene({
        schemaVersion: 1,
        label: "large",
        lines: [{ runs: [{ text: "😀".repeat(1900) }] }],
      });
      const document =
        kind === "scene" ? scene : recipeOf(initialDocument(scene));
      const link = encodeShare(document);
      expect(link.ok).toBe(false);
      expect(link.diagnostics[0]?.code).toBe("share-too-large");
      expect(link.diagnostics[0]?.message).toContain(
        kind === "scene" ? "Export JSON" : "Export recipe JSON",
      );
      expect(decodeDocument(JSON.stringify(document))).toEqual({
        ok: true,
        value: document,
        diagnostics: [],
      });
    },
  );
  it("applies a successful import as one undoable replacement and clears the redo branch", () => {
    const first = neon({ text: "first" });
    const imported = rainbow({ text: "imported" });
    let state = documentReducer(initialDocument(first), {
      type: "replace",
      scene: imported,
    });
    expect(state.past[0]?.scene).toEqual(first);
    state = documentReducer(state, { type: "undo" });
    expect(state.scene).toEqual(first);
    state = documentReducer(state, { type: "redo" });
    expect(state.scene).toEqual(imported);
    state = documentReducer(state, { type: "undo" });
    state = documentReducer(state, {
      type: "replace",
      scene: neon({ text: "new branch" }),
    });
    expect(state.future).toHaveLength(0);
  });
  it("bounds committed history, ignores equal replacements, and resets with a fresh history", () => {
    let state = initialDocument(neon());
    expect(
      documentReducer(state, { type: "replace", scene: state.scene }),
    ).toBe(state);
    for (let index = 0; index < 120; index++)
      state = documentReducer(state, {
        type: "replace",
        scene: neon({ text: String(index) }),
      });
    expect(state.past).toHaveLength(100);
    const previousRevision = state.revision;
    state = documentReducer(state, { type: "reset" });
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
    expect(state.revision).toBe(previousRevision + 1);
  });
});

function storageFixture() {
  const values = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
  };
  const notify = vi.fn();
  const store = new DraftStore(() => storage, notify);
  return { values, storage, notify, store };
}
describe("draft ownership and write ordering", () => {
  it("flushes the latest queued edit once before leaving and cannot resurrect a cleared or held draft", () => {
    vi.useFakeTimers();
    const { values, storage, store } = storageFixture();
    store.read();
    store.queue(neon({ text: "earlier" }), 1);
    store.queue(neon({ text: "leaving now" }), 2);
    store.flush();
    store.flush();
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toContain("leaving now");
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    store.queue(neon({ text: "must not return" }), 3);
    store.clear(3);
    store.flush();
    expect(values.has(DRAFT_KEY)).toBe(false);
    store.queue(neon({ text: "conflicting" }), 4);
    store.hold();
    store.flush();
    expect(values.has(DRAFT_KEY)).toBe(false);
  });
  it("reads and normalizes a valid draft before permitting autosave and never saves the initial default", () => {
    vi.useFakeTimers();
    const { values, storage, store } = storageFixture();
    const scene = neon({ text: "saved work" });
    values.set(DRAFT_KEY, JSON.stringify(scene));
    store.queue(neon({ text: "default" }), 0);
    expect(store.read()).toEqual({ kind: "valid", document: scene });
    vi.runAllTimers();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it("holds invalid stored bytes intact while in-memory edits and export remain usable", () => {
    vi.useFakeTimers();
    const { values, storage, store } = storageFixture();
    values.set(DRAFT_KEY, "broken JSON");
    expect(store.read().kind).toBe("error");
    const current = neon({ text: "valuable edit" });
    store.queue(current, 1);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toBe("broken JSON");
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(decodeDocument(JSON.stringify(current)).ok).toBe(true);
  });
  it("cancels a pending autosave during a shared-scene conflict", () => {
    vi.useFakeTimers();
    const { store, storage } = storageFixture();
    store.read();
    store.queue(neon(), 1);
    store.hold();
    vi.runAllTimers();
    expect(storage.setItem).not.toHaveBeenCalled();
    store.release();
    store.queue(rainbow(), 2);
    vi.runAllTimers();
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
  it("settling a shared-scene dialog preserves an earlier storage recovery hold", () => {
    vi.useFakeTimers();
    const { values, storage, store } = storageFixture();
    values.set(DRAFT_KEY, "recoverable broken JSON");
    store.read();
    const releaseDialog = store.hold();
    releaseDialog();
    store.queue(neon({ text: "Valid current work" }), 1);
    vi.runAllTimers();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(values.get(DRAFT_KEY)).toBe("recoverable broken JSON");
    store.clear(1);
    const releaseNextDialog = store.hold();
    releaseNextDialog();
    store.queue(neon({ text: "Later valid work" }), 2);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toContain("Later valid work");
  });
  it("clear is repeatable, touches only owned keys, preserves memory, and blocks stale callbacks/effects until a later edit", () => {
    vi.useFakeTimers();
    const { values, store, storage } = storageFixture();
    const current = neon();
    values.set("another-app", "keep");
    store.read();
    store.queue(current, 1);
    expect(store.clear(1)).toBe(true);
    expect(store.clear(1)).toBe(true);
    store.queue(current, 1, true);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toBeUndefined();
    expect(values.get("another-app")).toBe("keep");
    expect(storage.removeItem.mock.calls).toEqual([
      [DRAFT_KEY],
      [RECIPE_DRAFT_KEY],
      [DRAFT_KEY],
      [RECIPE_DRAFT_KEY],
    ]);
    expect(current.lines[0]?.runs[0]?.text).toBe("Hello, developer.");
    store.queue(neon({ text: "later edit" }), 2);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toContain("later edit");
  });
  it("confirmed reset protects the reset revision and retains the existing stored draft", () => {
    vi.useFakeTimers();
    const { values, store } = storageFixture();
    values.set(DRAFT_KEY, JSON.stringify(neon({ text: "old draft" })));
    store.read();
    store.queue(neon({ text: "pending" }), 1);
    store.protectThrough(2);
    store.queue(neon({ text: "reset" }), 2);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toContain("old draft");
  });
  it("reports write/delete failures and supports explicit retry without losing scene data", () => {
    vi.useFakeTimers();
    const { values, storage, notify, store } = storageFixture();
    store.read();
    storage.setItem.mockImplementationOnce(() => {
      throw new Error("quota");
    });
    const scene = neon({ text: "current work" });
    store.queue(scene, 1);
    vi.runAllTimers();
    expect(notify).toHaveBeenLastCalledWith(
      expect.objectContaining({
        kind: "error",
        message: expect.stringContaining("Export recipe JSON"),
      }),
    );
    store.queue(scene, 1, true);
    vi.runAllTimers();
    expect(values.get(DRAFT_KEY)).toContain("current work");
    storage.removeItem.mockImplementationOnce(() => {
      throw new Error("denied");
    });
    expect(store.clear(1)).toBe(false);
    expect(values.get(DRAFT_KEY)).toContain("current work");
    expect(notify).toHaveBeenLastCalledWith(
      expect.objectContaining({ kind: "error" }),
    );
    expect(store.clear(1)).toBe(true);
  });
  it("catches failure when accessing localStorage itself", () => {
    const store = new DraftStore(() => {
      throw new Error("disabled");
    }, vi.fn());
    expect(store.read()).toEqual(
      expect.objectContaining({
        kind: "error",
        message: expect.stringContaining("Export recipe JSON"),
      }),
    );
    expect(store.clear(0)).toBe(false);
  });
});

function fittedRecipe(text = "fitted") {
  const result = parseRenderRecipe({
    kind: "consoleFxRenderRecipe",
    recipeVersion: 1,
    scene: neon({ text }),
    options: {
      target: "chromium",
      renderer: "svg",
      motion: "system",
      unsupported: "fallback",
      layout: {
        algorithm: "fit/v1",
        width: 360,
        maxHeight: 400,
        variant: "standard",
        overflow: "shrink",
        minFontSize: 12,
      },
      sizing: { mode: "fixed", width: 360 },
    },
  });
  if (!result.ok) throw new Error("Invalid test recipe");
  return result.value;
}
describe("recipe history and recoverable draft conversion", () => {
  it("restores scene and all render intent as one undoable import across JSON and sharing", () => {
    const first = initialDocument(neon({ text: "first" }));
    const recipe = fittedRecipe();
    const decoded = decodeDocument(JSON.stringify(recipe));
    expect(decoded).toMatchObject({ ok: true, value: recipe });
    const shared = encodeShare(recipe);
    expect(shared.ok).toBe(true);
    if (shared.ok)
      expect(decodeShare(shared.value)).toMatchObject({
        ok: true,
        value: recipe,
      });
    const imported = documentReducer(first, { type: "load", document: recipe });
    expect(recipeOf(imported)).toEqual(recipe);
    const undone = documentReducer(imported, { type: "undo" });
    expect(undone.scene).toEqual(first.scene);
    expect(undone.options).toEqual(first.options);
    expect(undone.recipe).toBe(true);
    expect(savedDocument(undone)).toMatchObject({
      kind: "consoleFxRenderRecipe",
    });
    expect(recipeOf(documentReducer(undone, { type: "redo" }))).toEqual(recipe);
  });
  it("ignores semantically unchanged settings without converting storage or clearing redo", () => {
    const original = initialDocument(neon());
    const edited = documentReducer(original, {
      type: "replace",
      scene: rainbow(),
    });
    const undone = documentReducer(edited, { type: "undo" });
    const normalized = parseRenderRecipe(recipeOf(undone));
    if (!normalized.ok) throw new Error("Invalid fixture");
    expect(
      documentReducer(undone, {
        type: "settings",
        options: normalized.value.options,
      }),
    ).toBe(undone);
    expect(undone.future).toHaveLength(1);
    expect(undone.recipe).toBe(false);
  });
  it("uses documented static defaults for raw scenes and retains them until explicit settings conversion", () => {
    const raw = neon();
    const initial = initialDocument(raw);
    expect(initial.options).toEqual({
      target: "chromium",
      renderer: "css",
      motion: "reduce",
      unsupported: "error",
    });
    expect(savedDocument(initial)).toBe(raw);
    const edited = documentReducer(initial, {
      type: "settings",
      options: fittedRecipe().options,
    });
    expect(edited.recipe).toBe(true);
    expect(edited.past).toHaveLength(1);
    const importedRaw = documentReducer(edited, {
      type: "load",
      document: raw,
    });
    expect(importedRaw.options).toEqual(initial.options);
    expect(importedRaw.recipe).toBe(true);
  });
  it("flushes the last raw edit before conversion, debounces recipe edits and preserves the raw record", () => {
    vi.useFakeTimers();
    const { values, storage, store } = storageFixture();
    store.read();
    store.queue(neon({ text: "recover this raw edit" }), 1);
    store.queue(fittedRecipe("first recipe edit"), 2);
    expect(values.get(DRAFT_KEY)).toContain("recover this raw edit");
    store.queue(fittedRecipe("latest recipe edit"), 3);
    expect(values.has(RECIPE_DRAFT_KEY)).toBe(false);
    vi.runAllTimers();
    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(values.get(DRAFT_KEY)).toContain("recover this raw edit");
    expect(values.get(RECIPE_DRAFT_KEY)).toContain("latest recipe edit");
    expect(store.read()).toEqual({
      kind: "valid",
      document: fittedRecipe("latest recipe edit"),
    });
  });
  it("holds invalid/future recipes without overwriting either record or falling back silently", () => {
    vi.useFakeTimers();
    for (const invalid of [
      "broken",
      JSON.stringify({ ...fittedRecipe(), recipeVersion: 2 }),
      JSON.stringify({
        ...fittedRecipe(),
        options: { layout: { algorithm: "fit/v99" } },
      }),
    ]) {
      const { values, storage, store } = storageFixture();
      const raw = JSON.stringify(neon({ text: "legacy recovery" }));
      values.set(DRAFT_KEY, raw);
      values.set(RECIPE_DRAFT_KEY, invalid);
      expect(store.read().kind).toBe("error");
      store.queue(fittedRecipe("current work"), 1);
      vi.runAllTimers();
      expect(values.get(DRAFT_KEY)).toBe(raw);
      expect(values.get(RECIPE_DRAFT_KEY)).toBe(invalid);
      expect(storage.setItem).not.toHaveBeenCalled();
    }
  });
  it("preserves a valid recipe on failed writes or partial clear and supports explicit recovery", () => {
    vi.useFakeTimers();
    const { values, storage, notify, store } = storageFixture();
    const original = JSON.stringify(fittedRecipe("stored"));
    values.set(RECIPE_DRAFT_KEY, original);
    store.read();
    storage.setItem.mockImplementationOnce(() => {
      throw new Error("quota");
    });
    store.queue(fittedRecipe("current"), 1);
    vi.runAllTimers();
    expect(notify).toHaveBeenLastCalledWith(
      expect.objectContaining({
        kind: "error",
        message: expect.stringContaining("Export recipe JSON"),
      }),
    );
    expect(values.get(RECIPE_DRAFT_KEY)).toBe(original);
    storage.removeItem
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error("denied");
      });
    expect(store.clear(1)).toBe(false);
    store.queue(fittedRecipe("must remain in memory"), 2);
    vi.runAllTimers();
    expect(values.get(RECIPE_DRAFT_KEY)).toBe(original);
    expect(store.clear(2)).toBe(true);
    expect(values.has(RECIPE_DRAFT_KEY)).toBe(false);
    store.queue(fittedRecipe("next edit"), 3);
    vi.runAllTimers();
    expect(values.get(RECIPE_DRAFT_KEY)).toContain("next edit");
  });
});
