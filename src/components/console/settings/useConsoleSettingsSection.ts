"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import {
  CONSOLE_SETTINGS_SCHEMAS,
  type ConsoleSettings,
  type ConsoleSettingsSection,
} from "@/validations/consoleSettingsSchema";
import {
  CONSOLE_SETTINGS_UPDATED_EVENT,
  getConsoleSettingsSnapshot,
  saveConsoleSettingsSection,
  type ConsoleSettingsStore,
} from "@/lib/consoleSettingsStorage";

type SectionValues<K extends ConsoleSettingsSection> = ConsoleSettings[K] & FieldValues;

export interface ConsoleSettingsSectionApi<K extends ConsoleSettingsSection> {
  form: UseFormReturn<SectionValues<K>>;
  store: ConsoleSettingsStore;
  isSaving: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
}

const SECTION_LABEL: Record<ConsoleSettingsSection, string> = {
  company: "Company details",
  billing: "Billing settings",
  trials: "Trial & dunning rules",
  email: "Email settings",
};

/** One zod-validated form per console settings tab with loading → success/error toasts. */
export function useConsoleSettingsSection<K extends ConsoleSettingsSection>(section: K): ConsoleSettingsSectionApi<K> {
  const [store, setStore] = useState<ConsoleSettingsStore>(() => getConsoleSettingsSnapshot());
  const [isSaving, setIsSaving] = useState(false);
  const schema = CONSOLE_SETTINGS_SCHEMAS[section] as unknown as z.ZodType<SectionValues<K>>;

  const form = useForm<SectionValues<K>>({
    resolver: zodResolver(schema as never),
    mode: "onTouched",
    defaultValues: store.settings[section] as DefaultValues<SectionValues<K>>,
  });

  useEffect(() => {
    const onUpdate = () => {
      const next = getConsoleSettingsSnapshot();
      setStore(next);
      if (!form.formState.isDirty) form.reset(next.settings[section] as DefaultValues<SectionValues<K>>);
    };
    window.addEventListener(CONSOLE_SETTINGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSOLE_SETTINGS_UPDATED_EVENT, onUpdate);
  }, [form, section]);

  const save = useCallback(async () => {
    const ok = await form.trigger();
    if (!ok) {
      toast.error("Please fix the highlighted fields", { description: "Some settings are missing or invalid." });
      return false;
    }
    setIsSaving(true);
    const id = toast.loading("Saving settings...", { description: SECTION_LABEL[section] });
    try {
      const next = await saveConsoleSettingsSection(section, form.getValues() as ConsoleSettings[K]);
      setStore(next);
      form.reset(next.settings[section] as DefaultValues<SectionValues<K>>);
      toast.success("Settings saved", { id, description: `${SECTION_LABEL[section]} updated.` });
      return true;
    } catch (err) {
      toast.error("Couldn't save settings", { id, description: err instanceof Error ? err.message : "Please try again." });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [form, section]);

  const discard = () => form.reset(store.settings[section] as DefaultValues<SectionValues<K>>);

  return { form, store, isSaving, save, discard };
}

export default useConsoleSettingsSection;
