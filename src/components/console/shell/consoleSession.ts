"use client";

import { useSyncExternalStore } from "react";

/**
 * Owner Console session: the platform owner's API token + profile (separate from the institution admin login).
 * Kept in localStorage so a reload keeps the owner signed in; ConsoleShell redirects to /login when it's missing.
 * The API rejects expired tokens with 401, which ends the session (see `apiRequest`).
 */

const KEY = "edupro_console_session_v2";
const LEGACY_KEY = "edupro_console_session_v1";
const EVENT = "edupro_console_session_changed";

export interface ConsoleSession {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: "Platform owner";
  signedInAt: string;
}

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
    const parsed = raw ? (JSON.parse(raw) as ConsoleSession) : null;
    cached = parsed?.token ? parsed : null;
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

export function getConsoleToken(): string | null {
  if (typeof window === "undefined") return null;
  return read()?.token ?? null;
}

export function startConsoleSession(token: string, user: { id: string; name: string; email: string }) {
  const session: ConsoleSession = { token, userId: user.id, name: user.name, email: user.email, role: "Platform owner", signedInAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event(EVENT));
  return session;
}

export function endConsoleSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}
