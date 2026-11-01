"use client";

import { useSyncExternalStore } from "react";

/**
 * Mock Owner Console session (separate from the institution admin login). Stored in localStorage so a reload
 * keeps the owner signed in; ConsoleShell redirects to /console/login when it is missing.
 */

const KEY = "edupro_console_session_v1";
const EVENT = "edupro_console_session_changed";

export interface ConsoleSession {
  name: string;
  email: string;
  role: "Platform owner";
  signedInAt: string;
}

export const CONSOLE_OWNER = { name: "Imam Hossain", email: "imam.adsfixter@gmail.com", role: "Platform owner" as const };

let cachedRaw: string | null | undefined;
let cached: ConsoleSession | null = null;

function read(): ConsoleSession | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as ConsoleSession) : null;
  } catch {
    cached = null;
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

/** undefined on the server / during hydration, null when signed out. */
export function useConsoleSession(): ConsoleSession | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function startConsoleSession(email: string) {
  const session: ConsoleSession = { ...CONSOLE_OWNER, email: email.trim().toLowerCase(), signedInAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
  return session;
}

export function endConsoleSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}
