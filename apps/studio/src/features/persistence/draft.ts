import type { SceneV1 } from "@servrox/console-fx";
import { decodeDocument } from "./documents";

export const DRAFT_KEY = "console-fx:scene:v1";
export type DraftStatus = {
  readonly kind: "saved" | "cleared" | "error";
  readonly message: string;
};
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type DraftRead =
  | { readonly kind: "empty" }
  | { readonly kind: "valid"; readonly scene: SceneV1 }
  | { readonly kind: "error"; readonly message: string };

/** Owns only this origin's scene key. The provider is evaluated inside guards. */
export class DraftStore {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pending: (() => void) | undefined;
  private generation = 0;
  private protectedRevision = 0;
  private lastQueuedRevision = 0;
  private held = true;
  constructor(
    private readonly storage: () => StoragePort,
    private readonly notify: (status: DraftStatus) => void,
  ) {}

  read(): DraftRead {
    this.cancel();
    try {
      const source = this.storage().getItem(DRAFT_KEY);
      if (source === null) {
        this.held = false;
        return { kind: "empty" };
      }
      const result = decodeDocument(source);
      if (!result.ok) {
        this.held = true;
        return {
          kind: "error",
          message:
            "The saved draft could not be restored. Your current work is safe. Retry reading or clear the local draft.",
        };
      }
      this.held = false;
      return { kind: "valid", scene: result.value };
    } catch {
      this.held = true;
      return {
        kind: "error",
        message:
          "Local storage is unavailable. Keep editing and export JSON. You can retry storage later.",
      };
    }
  }

  queue(scene: SceneV1, revision: number, retry = false): void {
    if (
      this.held ||
      revision <= this.protectedRevision ||
      (!retry && revision <= this.lastQueuedRevision)
    )
      return;
    this.cancel();
    this.lastQueuedRevision = revision;
    const generation = this.generation;
    this.pending = () => {
      if (
        generation !== this.generation ||
        this.held ||
        revision <= this.protectedRevision
      )
        return;
      try {
        this.storage().setItem(DRAFT_KEY, JSON.stringify(scene));
        this.notify({ kind: "saved", message: "Draft saved in this browser." });
      } catch {
        this.notify({
          kind: "error",
          message:
            "The local draft could not be saved. Your work is still here. Export JSON or retry saving.",
        });
      }
    };
    this.timer = setTimeout(() => this.flush(), 350);
  }

  /** Persist an already queued valid edit before navigation/backgrounding. */
  flush(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    const pending = this.pending;
    this.pending = undefined;
    pending?.();
  }

  /** Hold writes while a shared-scene decision is pending. */
  hold(): () => void {
    const previous = this.held;
    this.cancel();
    this.held = true;
    // A dialog must not release an earlier hold protecting failed storage.
    return () => {
      this.held = previous;
    };
  }
  release(): void {
    this.held = false;
  }
  /** Reset/clear protects this revision from stale effects and queued callbacks. */
  protectThrough(revision: number): void {
    this.cancel();
    this.protectedRevision = Math.max(this.protectedRevision, revision);
  }
  clear(revision: number): boolean {
    this.protectThrough(revision);
    try {
      this.storage().removeItem(DRAFT_KEY);
      this.held = false;
      this.notify({
        kind: "cleared",
        message:
          "Local draft cleared. This scene and its history remain available. Saving resumes after your next edit.",
      });
      return true;
    } catch {
      this.held = true;
      this.notify({
        kind: "error",
        message:
          "The local draft could not be deleted. It may still be stored. Retry clearing it; your current scene is safe.",
      });
      return false;
    }
  }
  cancel(): void {
    this.generation++;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.pending = undefined;
  }
}
