"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useHydrated } from "./use-hydrated";

const Effects = createContext(false);
export const usePageEffects = () => useContext(Effects);
export function PageEffects({ children }: { readonly children: ReactNode }) {
  const hydrated = useHydrated();
  const [requested, setRequested] = useState(true);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let preference: MediaQueryList;
    try {
      preference = matchMedia("(prefers-reduced-motion: no-preference)");
    } catch {
      return;
    }
    const update = () =>
      setAllowed(preference.matches && document.visibilityState === "visible");
    update();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const active = requested && allowed;
  return (
    <Effects.Provider value={active}>
      <div
        className="landing-experience"
        data-page-effects={active ? "on" : "off"}
      >
        <div className="page-effects-control">
          <span>Page effects</span>
          <button
            type="button"
            disabled={!hydrated}
            aria-pressed={!requested}
            onClick={() => setRequested((value) => !value)}
          >
            {requested ? "Turn off" : "Turn on"}
          </button>
          <span className="fine-print">
            {active ? "Subtle, on interaction" : "Static view"}
          </span>
        </div>
        {children}
      </div>
    </Effects.Provider>
  );
}
