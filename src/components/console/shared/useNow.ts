"use client";

import { useSyncExternalStore } from "react";

/** Current time (ms), refreshed every minute — keeps render pure while relative times stay fresh. 0 on the server. */
let now = typeof window === "undefined" ? 0 : Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  now = Date.now();
  if (!timer)
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 60_000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, () => now, () => 0);
}
