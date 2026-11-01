"use client";

import { useSyncExternalStore } from "react";

/** Which navbar alerts (attention item ids) the owner has already opened — localStorage, survives reloads. */
const KEY = "edupro_console_alerts_seen_v1";
const EVENT = "edupro_console_alerts_seen_changed";
const EMPTY: string[] = [];

let cachedRaw: string | null | undefined;
let cached: string[] = EMPTY;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function subscribe(cb: () => void) {
  const handler = () => queueMicrotask(cb);
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useSeenAlerts(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function markAlertsSeen(ids: string[]) {
  const next = Array.from(new Set([...read(), ...ids])).slice(-500);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function markAlertsUnseen(ids: string[]) {
  const drop = new Set(ids);
  localStorage.setItem(KEY, JSON.stringify(read().filter((id) => !drop.has(id))));
  window.dispatchEvent(new Event(EVENT));
}
