"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { RenderRecipeV1 } from "@servrox/console-fx";
import { useHydrated } from "../experience/use-hydrated";

type TransferSession = {
  readonly request: RenderRecipeV1 | null;
  readonly blocked: boolean;
  readonly transfer: (recipe: RenderRecipeV1) => void;
  readonly finish: (restoreFocus?: boolean) => void;
  readonly sharedDecision: (pending: boolean) => void;
};
const Session = createContext<TransferSession | null>(null);
export function LandingSession({ children }: { readonly children: ReactNode }) {
  const hydrated = useHydrated();
  const [request, setRequest] = useState<RenderRecipeV1 | null>(null);
  const [shared, setShared] = useState(false);
  const origin = useRef<HTMLElement | null>(null);
  const restore = useRef(false);
  const finish = useCallback((restoreFocus = false) => {
    restore.current = restoreFocus;
    setRequest(null);
  }, []);
  useLayoutEffect(() => {
    if (!request && restore.current) {
      restore.current = false;
      origin.current?.focus();
    }
  }, [request]);
  const transfer = useCallback(
    (recipe: RenderRecipeV1) => {
      if (shared || request) return;
      origin.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setRequest(recipe);
      document.getElementById("playground")?.scrollIntoView();
    },
    [shared, request],
  );
  const value = useMemo(
    () => ({
      request,
      blocked: !hydrated || shared || !!request,
      transfer,
      finish,
      sharedDecision: setShared,
    }),
    [request, shared, transfer, finish, hydrated],
  );
  return <Session.Provider value={value}>{children}</Session.Provider>;
}
export function useTransferSession() {
  const value = useContext(Session);
  if (!value) throw new Error("Landing transfer requires its page session");
  return value;
}
