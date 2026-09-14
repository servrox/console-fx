"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { LIMITS } from "@servrox/console-fx";
import {
  decodeDocument,
  decodeShare,
  type SavedDocument,
} from "../persistence/documents";
import { DraftStore, type DraftStatus } from "../persistence/draft";
import {
  documentReducer,
  initialDocument,
  sameDocument,
  savedDocument,
  type DocumentAction,
} from "./document";

type Notice = {
  readonly kind: "success" | "error" | "info";
  readonly message: string;
};
export interface DocumentSessionOptions {
  readonly onTransition?: ((resetSelection: boolean) => void) | undefined;
}

/** Browser-local document ordering; the view never coordinates storage or read generations. */
export function useDocumentSession(
  initialScene: SavedDocument,
  { onTransition }: DocumentSessionOptions = {},
) {
  const importSequence = useRef(0);
  const [document, dispatchDocument] = useReducer(
    documentReducer,
    initialScene,
    initialDocument,
  );
  const dispatch = useCallback(
    (action: DocumentAction) => {
      importSequence.current++;
      dispatchDocument(action);
      onTransition?.(
        action.type === "load" ||
          action.type === "reset" ||
          action.type === "initialize",
      );
    },
    [onTransition],
  );
  const [ready, setReady] = useState(false);
  const [recoveredWork, setRecoveredWork] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus | null>(null);
  const [storageIssue, setStorageIssue] = useState(false);
  const [pendingShared, setPendingShared] = useState<SavedDocument | null>(
    null,
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const [store] = useState(
    () =>
      new DraftStore(
        () => window.localStorage,
        (status) => {
          setDraftStatus(status);
          setStorageIssue(status.kind === "error");
        },
      ),
  );
  const initialized = useRef(false);
  const releaseShared = useRef<(() => void) | null>(null);
  const persisted = useMemo(() => savedDocument(document), [document]);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const draft = store.read();
    setStorageIssue(draft.kind === "error");
    setRecoveredWork(draft.kind === "valid");
    let baseline = draft.kind === "valid" ? draft.document : initialScene;
    let shared: SavedDocument | null = null;
    let startupNotice: Notice | null =
      draft.kind === "valid"
        ? { kind: "success", message: "Your local draft was resumed." }
        : draft.kind === "error"
          ? { kind: "error", message: draft.message }
          : null;
    if (window.location.hash.startsWith("#scene=")) {
      const result = decodeShare(window.location.hash);
      if (!result.ok)
        startupNotice = {
          kind: "error",
          message: result.diagnostics[0]!.message,
        };
      else if (
        draft.kind === "valid" &&
        !sameDocument(baseline, result.value)
      ) {
        shared = result.value;
        releaseShared.current = store.hold();
      } else if (draft.kind !== "valid") {
        baseline = result.value;
        startupNotice = {
          kind: "success",
          message: "Shared scene loaded. It has not been printed.",
        };
      }
    }
    dispatch({ type: "initialize", document: baseline });
    // Storage and fragments are intentionally read after hydration. The initial
    // server/client render is identical, and no default draft is ever persisted.
    setPendingShared(shared);
    setNotice(startupNotice);
    setReady(true);
  }, [store, dispatch, initialScene]);
  useEffect(
    () => () => {
      importSequence.current++;
    },
    [],
  );
  useEffect(() => {
    if (!ready) return;
    const receiveShare = () => {
      if (!window.location.hash.startsWith("#scene=")) {
        releaseShared.current?.();
        releaseShared.current = null;
        setPendingShared(null);
        return;
      }
      const result = decodeShare(window.location.hash);
      if (!result.ok) {
        releaseShared.current?.();
        releaseShared.current = null;
        setPendingShared(null);
        setNotice({ kind: "error", message: result.diagnostics[0]!.message });
      } else if (!sameDocument(persisted, result.value)) {
        importSequence.current++;
        if (!releaseShared.current) {
          store.flush();
          releaseShared.current = store.hold();
        }
        setPendingShared(result.value);
        onTransition?.(false);
      } else {
        releaseShared.current?.();
        releaseShared.current = null;
        setPendingShared(null);
      }
    };
    window.addEventListener("hashchange", receiveShare);
    return () => window.removeEventListener("hashchange", receiveShare);
  }, [ready, persisted, store, onTransition]);
  useEffect(() => {
    if (ready) store.queue(persisted, document.revision);
  }, [persisted, document.revision, ready, store]);
  useEffect(() => {
    const flush = () => store.flush();
    const hidden = () => {
      if (window.document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.document.removeEventListener("visibilitychange", hidden);
      flush();
    };
  }, [store]);
  async function importFile(file?: Pick<File, "size" | "text">) {
    if (!file) return;
    const sequence = ++importSequence.current;
    if (file.size > LIMITS.inputBytes) {
      setNotice({
        kind: "error",
        message: "That file exceeds 64 KiB. Your current work is unchanged.",
      });
      return;
    }
    try {
      const source = await file.text();
      if (sequence !== importSequence.current) return;
      const result = decodeDocument(source);
      if (!result.ok) {
        setNotice({
          kind: "error",
          message: `${result.diagnostics[0]!.message} Your current work is unchanged.`,
        });
        return;
      }
      dispatch({ type: "load", document: result.value });
      setNotice({
        kind: "success",
        message:
          "Document imported. Undo restores your previous scene and render settings.",
      });
    } catch {
      if (sequence !== importSequence.current) return;
      setNotice({
        kind: "error",
        message: "The file could not be read. Your current work is unchanged.",
      });
    }
  }
  function retryStorage() {
    const result = store.read();
    setStorageIssue(result.kind === "error");
    if (result.kind === "error")
      setNotice({ kind: "error", message: result.message });
    else {
      store.queue(persisted, document.revision, true);
      setNotice({
        kind: "info",
        message: "Storage is available. Your current scene has been preserved.",
      });
    }
  }

  function requestReset() {
    importSequence.current++;
    setConfirmReset(true);
  }
  function settleReset(accept: boolean) {
    if (accept) {
      store.protectThrough(document.revision + 1);
      dispatch({ type: "reset" });
      setNotice({
        kind: "info",
        message:
          "Started a fresh message. The stored draft has not been deleted.",
      });
    }
    setConfirmReset(false);
  }
  function settleShared(accept: boolean) {
    if (!pendingShared) return;
    releaseShared.current?.();
    releaseShared.current = null;
    if (accept) dispatch({ type: "load", document: pendingShared });
    setPendingShared(null);
    setNotice(
      accept
        ? {
            kind: "success",
            message: "Shared scene loaded. Undo restores your previous scene.",
          }
        : { kind: "info", message: "Kept your current scene." },
    );
  }
  return {
    document,
    persisted,
    ready,
    recoveredWork,
    beginReplacement: () => {
      importSequence.current++;
      onTransition?.(false);
    },
    dispatch,
    notice,
    setNotice,
    draftStatus,
    storageIssue,
    importFile,
    retryStorage,
    clearDraft: () => store.clear(document.revision),
    pendingShared,
    confirmReset,
    requestReset,
    settleReset,
    settleShared,
  };
}
