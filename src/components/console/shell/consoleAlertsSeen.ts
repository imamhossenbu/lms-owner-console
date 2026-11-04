"use client";

import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { api, fetchAllPages } from "@/lib/api/client";

/**
 * Which "needs attention" alerts the owner has already opened, stored per owner on the server
 * (`/saas/owner/alerts`). Updates are optimistic; a failed save rolls back and shows a toast.
 * Alert ids are `<institutionId>-trial|pastdue|limit|domain`, the same on both sides.
 */
const EVENT = "edupro_console_alerts_seen_changed";
const EMPTY: string[] = [];
const MAX_IDS_PER_CALL = 500;

let seen: string[] = EMPTY;
let loaded = false;
let inflight: Promise<void> | null = null;

function set(next: string[]) {
  seen = next;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const handler = () => queueMicrotask(cb);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

function load() {
  inflight ??= fetchAllPages<{ id: string }>("/saas/owner/alerts", { status: "read" })
    .then((rows) => {
      loaded = true;
      set(rows.map((r) => r.id));
    })
    .catch(() => undefined)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Read alert ids (empty until loaded). */
export function useSeenAlerts(): string[] {
  const ids = useSyncExternalStore(subscribe, () => seen, () => EMPTY);
  useEffect(() => {
    if (!loaded) void load();
  }, []);
  return ids;
}

async function save(path: "read" | "unread", ids: string[], before: string[]) {
  try {
    for (let i = 0; i < ids.length; i += MAX_IDS_PER_CALL) await api.post(`/saas/owner/alerts/${path}`, { ids: ids.slice(i, i + MAX_IDS_PER_CALL) });
  } catch (err) {
    set(before);
    toast.error("Couldn't update alerts", { id: "alerts-seen", description: err instanceof Error ? err.message : "Please try again." });
  }
}

export function markAlertsSeen(ids: string[]) {
  const fresh = [...new Set(ids)].filter((id) => !seen.includes(id));
  if (!fresh.length) return;
  const before = seen;
  set([...seen, ...fresh]);
  void save("read", fresh, before);
}

export function markAlertsUnseen(ids: string[]) {
  const drop = new Set(ids.filter((id) => seen.includes(id)));
  if (!drop.size) return;
  const before = seen;
  set(seen.filter((id) => !drop.has(id)));
  void save("unread", [...drop], before);
}
