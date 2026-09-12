"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
export const useHydrated = () =>
  useSyncExternalStore(subscribe, client, server);
