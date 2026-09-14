"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { RenderRecipeV1 } from "@servrox/console-fx";
import { sameDocument, recipeOf } from "../editor/document";
import { decodeShare } from "../persistence/documents";
import type { useDocumentSession } from "../editor/use-document-session";
import {
  CATEGORIES,
  DEFAULT_EXAMPLE_ID,
  exampleHref,
  listCatalogue,
  resolveExample,
} from "./catalogue";
import type { CategoryId } from "./catalogue";

type Session = ReturnType<typeof useDocumentSession>;
type Pending = {
  readonly id: string;
  readonly recipe: RenderRecipeV1;
  readonly url: string;
  readonly replace: boolean;
};
/** URL changes are load intents; only the document session commits recipe changes. */
export function useExampleNavigation(session: Session, enabled: boolean) {
  const [category, setCategory] = useState<CategoryId | undefined>();
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState("");
  const initialized = useRef(false);
  const acceptedUrl = useRef("");
  const unresolved = useRef(false);
  const [loaded, setLoaded] = useState(() => {
    const initial = resolveExample({ exampleId: DEFAULT_EXAMPLE_ID });
    return new Map<string, RenderRecipeV1>(
      initial.ok ? [[DEFAULT_EXAMPLE_ID, initial.recipe]] : [],
    );
  });
  const remember = useCallback((id: string, recipe: RenderRecipeV1) => {
    setLoaded((previous) =>
      previous.has(id) ? previous : new Map(previous).set(id, recipe),
    );
  }, []);
  const current = useRef(session);
  useLayoutEffect(() => {
    current.current = session;
  });
  const writeUrl = useCallback((url: string, replace: boolean) => {
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
    acceptedUrl.current = window.location.href;
    unresolved.current = false;
  }, []);
  const request = useCallback(
    (id: string, url = exampleHref(id), replace = false, initial = false) => {
      setPending(null);
      unresolved.current = true;
      const state = current.current;
      if (state.pendingShared) state.settleShared(false);
      const result = resolveExample({ exampleId: id });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError("");
      if (sameDocument(state.persisted, result.recipe)) {
        remember(id, result.recipe);
        writeUrl(url, true);
        return;
      }
      state.beginReplacement();
      if (initial && !state.recoveredWork && state.document.revision === 0) {
        remember(id, result.recipe);
        state.dispatch({ type: "load", document: result.recipe });
        writeUrl(url, true);
      } else setPending({ id, recipe: result.recipe, url, replace });
    },
    [writeUrl, remember],
  );
  useEffect(() => {
    if (!enabled || !session.ready) return;
    function receive(initial = false) {
      setPending(null);
      unresolved.current = true;
      setError("");
      const url = new URL(window.location.href);
      const requestedCategory = url.searchParams.get("category");
      const validCategory = CATEGORIES.find(
        (item) => item.id === requestedCategory,
      );
      setCategory(validCategory?.id);
      if (requestedCategory && !validCategory)
        setError(
          "That category is unavailable. Choose All examples; your current work is preserved.",
        );
      // Even an invalid explicit share suppresses the query example. The session
      // owns decoding, errors and conflict recovery for the shared payload.
      if (url.hash.startsWith("#scene=")) {
        const shared = decodeShare(url.hash);
        if (
          shared.ok &&
          sameDocument(current.current.persisted, shared.value)
        ) {
          acceptedUrl.current = url.href;
          unresolved.current = false;
        }
        return;
      }
      if (current.current.pendingShared) current.current.settleShared(false);
      if (requestedCategory && !validCategory) return;
      const id = url.searchParams.get("example");
      if (id) request(id, url.href, true, initial);
      else {
        // Back to a discovery URL without content must preserve current work.
        setPending(null);
        acceptedUrl.current = url.href;
        unresolved.current = false;
      }
    }
    if (!initialized.current) {
      initialized.current = true;
      const clean = new URL(window.location.href);
      clean.searchParams.delete("example");
      clean.hash = "";
      acceptedUrl.current = clean.href;
      receive(true);
    }
    const navigate = () => receive();
    window.addEventListener("popstate", navigate);
    window.addEventListener("hashchange", navigate);
    return () => {
      window.removeEventListener("popstate", navigate);
      window.removeEventListener("hashchange", navigate);
    };
  }, [enabled, session.ready, request]);

  useEffect(() => {
    if (
      !enabled ||
      !session.ready ||
      pending ||
      session.pendingShared ||
      unresolved.current ||
      !initialized.current
    )
      return;
    const url = new URL(window.location.href);
    if (url.hash.startsWith("#scene=")) {
      const shared = decodeShare(url.hash);
      if (!shared.ok || sameDocument(session.persisted, shared.value)) return;
      url.hash = "";
    }
    const id = [...loaded].find(([, recipe]) =>
      sameDocument(recipeOf(session.document), recipe),
    )?.[0];
    if (id) url.searchParams.set("example", id);
    else url.searchParams.delete("example");
    writeUrl(url.href, true);
  }, [
    enabled,
    session.ready,
    session.document,
    session.persisted,
    session.pendingShared,
    pending,
    loaded,
    writeUrl,
  ]);

  function settle(accept: boolean) {
    if (!pending) return;
    if (accept) {
      remember(pending.id, pending.recipe);
      current.current.dispatch({ type: "load", document: pending.recipe });
      writeUrl(pending.url, pending.replace);
      const entry = listCatalogue().examples.find(
        (item) => item.id === pending.id,
      );
      setCategory(entry?.category);
      current.current.setNotice({
        kind: "success",
        message:
          "Example loaded. Undo restores your previous scene and settings.",
      });
    } else writeUrl(acceptedUrl.current, true);
    setPending(null);
  }
  const selected = [...loaded].find(([, recipe]) =>
    sameDocument(session.persisted, recipe),
  )?.[0];
  return {
    category,
    setCategory,
    selected,
    pending,
    error,
    request,
    settle,
    settleSharedUrl: (accept: boolean) => {
      if (enabled) {
        if (accept) {
          acceptedUrl.current = window.location.href;
          unresolved.current = false;
        } else writeUrl(acceptedUrl.current, true);
      }
    },
    clearError: () => {
      setError("");
      const url = new URL(window.location.href);
      url.searchParams.delete("example");
      url.searchParams.delete("category");
      writeUrl(url.href, true);
    },
  };
}
