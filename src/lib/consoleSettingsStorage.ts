import { useEffect, useSyncExternalStore } from "react";
import type { ConsoleSettings, ConsoleSettingsSection } from "@/validations/consoleSettingsSchema";
import { api } from "@/lib/api/client";

/**
 * Owner Console settings, backed by `/saas/owner/console-settings` (one row, cached in memory).
 * Gateway secrets are write-only: the API encrypts them and only returns masked "••••last4" hints.
 */

export const CONSOLE_SETTINGS_UPDATED_EVENT = "edupro_console_settings_updated";

export interface ConsoleSettingsStore {
  settings: ConsoleSettings;
  /** "billing.stripe.secretKey" → "••••4e19". */
  secretHints: Record<string, string>;
  /** Section → last saved ISO time ("" = never saved, defaults in use). */
  updatedAt: Record<ConsoleSettingsSection, string>;
}


/** Shown until the saved settings load (same values the API starts with). */
export function defaultConsoleSettings(): ConsoleSettingsStore {
  return {
    settings: {
      company: {
        legalName: "EduPro Technologies Ltd.",
        address: "Level 9, 34 Gulshan Avenue, Dhaka 1212, Bangladesh",
        supportEmail: "billing@edupro.com",
        website: "https://edupro.com",
        taxId: "BIN 004512398-0101",
        logoUrl: "",
      },
      billing: {
        currency: "USD",
        taxRate: 0,
        invoicePrefix: "EDP",
        invoiceFooter: "Thank you for building your academy on EduPro.",
        stripe: { enabled: false, mode: "TEST", publicKey: "", secretKey: "" },
        sslcommerz: { enabled: false, mode: "TEST", publicKey: "", secretKey: "" },
        bkash: { enabled: false, mode: "TEST", publicKey: "", secretKey: "" },
      },
      trials: {
        defaultTrialDays: 14,
        requireCardForTrial: false,
        gracePeriodDays: 7,
        retryScheduleDays: [1, 3, 7],
        suspendAfterGrace: true,
      },
      email: {
        senderName: "EduPro Billing",
        replyTo: "billing@edupro.com",
        trialEnding: true,
        trialEndingDays: 3,
        paymentFailed: true,
        receipt: true,
        renewalReminder: true,
        cancellation: true,
        welcome: true,
      },
    },
    secretHints: {},
    updatedAt: { company: "", billing: "", trials: "", email: "" },
  };
}

let store: ConsoleSettingsStore | null = null;
let inflight: Promise<ConsoleSettingsStore> | null = null;

function put(next: ConsoleSettingsStore) {
  store = next;
  window.dispatchEvent(new Event(CONSOLE_SETTINGS_UPDATED_EVENT));
  return next;
}

/** Sync snapshot: the defaults until the first load finishes (starts one in the background). */
export function getConsoleSettingsSnapshot(): ConsoleSettingsStore {
  if (!store && typeof window !== "undefined") void fetchConsoleSettings().catch(() => undefined);
  return store ?? DEFAULTS;
}

/** Loads the saved settings from the API. Concurrent calls share one request. */
export function fetchConsoleSettings(): Promise<ConsoleSettingsStore> {
  inflight ??= api
    .get<ConsoleSettingsStore>("/saas/owner/console-settings")
    .then(put)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(cb: () => void) {
  const handler = () => queueMicrotask(cb);
  window.addEventListener(CONSOLE_SETTINGS_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CONSOLE_SETTINGS_UPDATED_EVENT, handler);
}

/** Live settings for read-only views (invoice header, etc.); defaults until loaded. */
export function useConsoleSettings(): ConsoleSettingsStore {
  const live = useSyncExternalStore(subscribe, () => store ?? DEFAULTS, () => DEFAULTS);
  useEffect(() => {
    if (!store) void fetchConsoleSettings().catch(() => undefined);
  }, []);
  return live;
}

/** Saves one section. Gateway secrets: "" keeps the saved key; the API only ever returns masked hints. */
export async function saveConsoleSettingsSection<K extends ConsoleSettingsSection>(section: K, values: ConsoleSettings[K]): Promise<ConsoleSettingsStore> {
  return put(await api.patch<ConsoleSettingsStore>(`/saas/owner/console-settings/${section}`, values));
}

/** Sends a sample billing email to `to` with the current sender settings. */
export async function sendConsoleTestEmail(to: string): Promise<void> {
  await api.post("/saas/owner/console-settings/email/test", { to: to.trim() });
}

const DEFAULTS = defaultConsoleSettings();
