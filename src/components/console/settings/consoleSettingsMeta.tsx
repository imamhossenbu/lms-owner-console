import React from "react";
import { Building2, CreditCard, Hourglass, Mail } from "lucide-react";
import type { PillTabItem } from "@/components/ui/PillTabs";
import { CONSOLE_SETTINGS_SECTIONS, type ConsoleSettingsSection } from "@/validations/consoleSettingsSchema";

export const CONSOLE_SETTINGS_TABS: PillTabItem<ConsoleSettingsSection>[] = [
  { id: "company", label: "Company", icon: <Building2 /> },
  { id: "billing", label: "Billing", icon: <CreditCard /> },
  { id: "trials", label: "Trials & dunning", icon: <Hourglass /> },
  { id: "email", label: "Emails", icon: <Mail /> },
];

export const parseConsoleSettingsTab = (value: string): ConsoleSettingsSection =>
  (CONSOLE_SETTINGS_SECTIONS as readonly string[]).includes(value) ? (value as ConsoleSettingsSection) : "company";

