"use client";
import { useEffect } from "react";

const destinations: Readonly<Record<string, string>> = {
  "#playground": "/studio/",
  "#presets": "/studio/",
  "#try-message": "/studio/",
  "#editor-workspace": "/studio/",
  "#use-cases": "/#categories",
  "#use-in-your-app": "/docs/#integration",
};
export function LegacyEntry() {
  useEffect(() => {
    const forward = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#scene="))
        window.location.replace(`/studio/${window.location.search}${hash}`);
      else if (destinations[hash])
        window.location.replace(`${destinations[hash]}`);
    };
    forward();
    window.addEventListener("hashchange", forward);
    return () => window.removeEventListener("hashchange", forward);
  }, []);
  return null;
}
