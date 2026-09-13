import { decodeDocument, isRecipe, type SavedDocument } from "./documents";

export const DRAFT_KEY = "console-fx:scene:v1";
export const RECIPE_DRAFT_KEY = "console-fx:recipe:v1";
export type DraftStatus = {
  readonly kind: "saved" | "cleared" | "error";
  readonly message: string;
};
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type DraftRead =
  | { readonly kind: "empty" }
  | { readonly kind: "valid"; readonly document: SavedDocument }
  | { readonly kind: "error"; readonly message: string };

/** Owns this origin's scene and recipe keys. Conversion never replaces legacy bytes. */
export class DraftStore {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pending: (() => void) | undefined;
  private pendingRecipe = false;
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
      const storage = this.storage();
      const recipe = storage.getItem(RECIPE_DRAFT_KEY);
      const source = recipe ?? storage.getItem(DRAFT_KEY);
      if (source === null) {
        this.held = false;
        return { kind: "empty" };
      }
      const result = decodeDocument(source);
      if (!result.ok || (recipe !== null && !isRecipe(result.value))) {
        this.held = true;
        return {
          kind: "error",
          message:
            "The saved draft could not be restored. Your current work is safe. Retry reading or clear the local draft.",
        };
      }
      this.held = false;
      return { kind: "valid", document: result.value };
    } catch {
      this.held = true;
      return {
        kind: "error",
        message:
          "Local storage is unavailable. Keep editing; use Export recipe JSON to preserve scene and settings. You can retry storage later.",
      };
    }
  }

  queue(document: SavedDocument, revision: number, retry = false): void {
    if (
      this.held ||
      revision <= this.protectedRevision ||
      (!retry && revision <= this.lastQueuedRevision)
    )
      return;
    // The final queued raw-scene edit becomes the recoverable original before
    // the first explicit recipe edit writes to the separate recipe key.
    if (isRecipe(document) && !this.pendingRecipe) this.flush();
    this.cancel();
    this.pendingRecipe = isRecipe(document);
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
        this.storage().setItem(
          isRecipe(document) ? RECIPE_DRAFT_KEY : DRAFT_KEY,
          JSON.stringify(document),
        );
        this.notify({ kind: "saved", message: "Draft saved in this browser." });
      } catch {
        this.notify({
          kind: "error",
          message:
            "The local draft could not be saved. Your work is still here. Use Export recipe JSON to preserve scene and settings, or retry saving.",
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
      this.storage().removeItem(RECIPE_DRAFT_KEY);
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
