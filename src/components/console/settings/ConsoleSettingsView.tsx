"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Undo2 } from "lucide-react";
import type { ConsoleSettingsSection } from "@/validations/consoleSettingsSchema";
import { fetchConsoleSettings } from "@/lib/consoleSettingsStorage";
import { useUrlParams } from "@/lib/useUrlParams";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PillTabs } from "@/components/ui/PillTabs";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SettingsDirtyContext } from "@/components/settings/shared/SettingsDirtyContext";
import { CONSOLE_SETTINGS_TABS, parseConsoleSettingsTab } from "./consoleSettingsMeta";
import { ConsoleSettingsSkeleton } from "./ConsoleSettingsSkeleton";
import { CompanySection } from "./CompanySection";
import { BillingSection } from "./BillingSection";
import { TrialsSection } from "./TrialsSection";
import { EmailSection } from "./EmailSection";

const SECTION: Record<ConsoleSettingsSection, React.ComponentType> = {
  company: CompanySection,
  billing: BillingSection,
  trials: TrialsSection,
  email: EmailSection,
};

/** /console/settings — capsule tabs synced to `?tab=` (survives reloads); asks before leaving unsaved edits. */
export function ConsoleSettingsView() {
  const { get, set } = useUrlParams();
  const tab = parseConsoleSettingsTab(get("tab"));
  const [ready, setReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [pending, setPending] = useState<ConsoleSettingsSection | null>(null);

  useEffect(() => {
    let alive = true;
    fetchConsoleSettings().finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return <ConsoleSettingsSkeleton />;

  const go = (next: ConsoleSettingsSection) => {
    setIsDirty(false);
    set({ tab: next === "company" ? null : next });
  };
  const request = (next: ConsoleSettingsSection) => {
    if (next === tab) return;
    if (isDirty) setPending(next);
    else go(next);
  };
  const Active = SECTION[tab];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <div>
        <Breadcrumb items={[{ label: "Settings" }]} className="mb-1.5" />
        <h1 className="heading-h3 text-primary-500 tracking-tight">Console settings</h1>
        <p className="mt-1 body-sm-regular text-primary-400">Company details, subscription billing, trial rules and lifecycle emails.</p>
      </div>

      <PillTabs tabs={CONSOLE_SETTINGS_TABS} activeId={tab} onChange={request} ariaLabel="Console settings sections" idPrefix="console-settings" />

      <SettingsDirtyContext.Provider value={setIsDirty}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            id={`console-settings-panel-${tab}`}
            aria-labelledby={`console-settings-tab-${tab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Active />
          </motion.div>
        </AnimatePresence>
      </SettingsDirtyContext.Provider>

      <ConfirmModal
        isOpen={pending !== null}
        title="Discard unsaved changes?"
        subtitle="You have edits on this tab that haven't been saved."
        message="If you switch tabs now, the changes you made here will be lost."
        confirmLabel="Discard Changes"
        pendingLabel="Switching..."
        confirmIcon={<Undo2 className="h-4 w-4" />}
        onClose={() => setPending(null)}
        onConfirm={async () => {
          if (pending) go(pending);
        }}
      />
    </motion.div>
  );
}

export default ConsoleSettingsView;
