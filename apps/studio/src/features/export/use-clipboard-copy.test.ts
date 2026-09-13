// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useClipboardCopy } from "./use-clipboard-copy";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("captured clipboard attempts", () => {
  it("excludes overlapping writes and retains the exact failed payload across edits and a retry", async () => {
    let reject!: (error: Error) => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        }),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const notify = vi.fn();
    const hook = renderHook(() => useClipboardCopy(notify));
    let attempt!: Promise<void>;
    act(() => {
      attempt = hook.result.current.copy("Original %c 👩🏽‍💻", "Source");
      void hook.result.current.copy("Later edit", "Share link");
    });
    expect(writeText).toHaveBeenCalledExactlyOnceWith("Original %c 👩🏽‍💻");
    expect(hook.result.current.copying).toBe(true);
    hook.rerender();
    await act(async () => {
      reject(new Error("denied"));
      await attempt;
    });
    expect(hook.result.current.failedCopy).toEqual({
      text: "Original %c 👩🏽‍💻",
      label: "Source",
    });
    expect(hook.result.current.copying).toBe(false);
    writeText.mockResolvedValueOnce(undefined);
    await act(() =>
      hook.result.current.copy("Current share URL", "Share link"),
    );
    expect(hook.result.current.failedCopy).toBeNull();
    expect(notify).toHaveBeenLastCalledWith({
      kind: "copied",
      text: "Current share URL",
      label: "Share link",
    });
  });

  it("recovers when clipboard access itself is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const hook = renderHook(() => useClipboardCopy(vi.fn()));
    await act(() => hook.result.current.copy("recover me", "Source"));
    expect(hook.result.current.failedCopy?.text).toBe("recover me");
    expect(hook.result.current.copying).toBe(false);
  });

  it("does not report an obsolete attempt after unmount", async () => {
    let resolve!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const notify = vi.fn();
    const hook = renderHook(() => useClipboardCopy(notify));
    let attempt!: Promise<void>;
    act(() => {
      attempt = hook.result.current.copy("old session", "Source");
    });
    hook.unmount();
    await act(async () => {
      resolve();
      await attempt;
    });
    expect(notify).toHaveBeenCalledTimes(1);
    await hook.result.current.copy("unmounted", "Source");
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
