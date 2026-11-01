import {
  consoleSettingsSchema,
  GATEWAY_KEYS,
  type ConsoleSettings,
  type ConsoleSettingsSection,
} from "@/validations/consoleSettingsSchema";

/**
 * Mock-first persistence for Owner Console settings (localStorage + simulated latency).
 * Gateway secrets are never stored in clear: a non-empty secret becomes a masked "••••last4" hint
 * and an empty one keeps the previous hint.
 */

const STORAGE_KEY = "edupro_console_settings_v1";
export const CONSOLE_SETTINGS_UPDATED_EVENT = "edupro_console_settings_updated";
const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export interface ConsoleSettingsStore {
  settings: ConsoleSettings;
  /** "billing.stripe.secretKey" → "••••4e19". */
  secretHints: Record<string, string>;
  updatedAt: Record<ConsoleSettingsSection, string>;
}

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

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
        stripe: { enabled: true, mode: "LIVE", publicKey: "pk_live_51PqEdu…", secretKey: "" },
        sslcommerz: { enabled: true, mode: "LIVE", publicKey: "edupro_saas_live", secretKey: "" },
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
    secretHints: {
      "billing.stripe.secretKey": "••••4e19",
      "billing.sslcommerz.secretKey": "••••8f2a",
    },
    updatedAt: { company: iso(32), billing: iso(4), trials: iso(12), email: iso(20) },
  };
}

function read(): ConsoleSettingsStore {
  if (typeof window === "undefined") return defaultConsoleSettings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConsoleSettingsStore;
      if (parsed?.settings && consoleSettingsSchema.safeParse(parsed.settings).success && parsed.updatedAt) return parsed;
    }
  } catch {
    /* re-seed */
  }
  const seed = defaultConsoleSettings();
  write(seed, false);
  return seed;
}

function write(store: ConsoleSettingsStore, notify = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error("Your browser storage is full. Remove some data and try again.");
  }
  if (notify) window.dispatchEvent(new Event(CONSOLE_SETTINGS_UPDATED_EVENT));
}

export const getConsoleSettingsSnapshot = () => read();

export async function fetchConsoleSettings(): Promise<ConsoleSettingsStore> {
  await wait(350);
  return read();
}

/** Save one section; billing gateway secrets are masked (empty = keep the saved one). */
export async function saveConsoleSettingsSection<K extends ConsoleSettingsSection>(
  section: K,
  values: ConsoleSettings[K]
): Promise<ConsoleSettingsStore> {
  await wait();
  const store = read();
  const clean = structuredClone(values);
  const hints = { ...store.secretHints };
  if (section === "billing") {
    const billing = clean as ConsoleSettings["billing"];
    GATEWAY_KEYS.forEach((key) => {
      const secret = billing[key].secretKey.trim();
      if (secret) hints[`billing.${key}.secretKey`] = `••••${secret.slice(-4)}`;
      billing[key].secretKey = "";
    });
  }
  const next: ConsoleSettingsStore = {
    settings: { ...store.settings, [section]: clean },
    secretHints: hints,
    updatedAt: { ...store.updatedAt, [section]: new Date().toISOString() },
  };
  write(next);
  return next;
}

/** Mock "send test email" for the Emails tab. */
export async function sendConsoleTestEmail(to: string): Promise<void> {
  await wait(700);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("That email address doesn't look right.");
}
