import React from "react";
import { cn } from "@/lib/cn";

export interface SettingsRowProps {
  label: string;
  description?: string;
  /** Id of the control, so clicking the label focuses it. */
  htmlFor?: string;
  /** Marks the label with a red asterisk. */
  required?: boolean;
  /** Control(s) on the right: input + error, select, choice cards … */
  children: React.ReactNode;
  className?: string;
}

/**
 * One setting inside a SettingsCard: label + helper on the left, control on the right.
 * Stacks when the card itself is narrower than ~576px (container query, not viewport).
 */
export function SettingsRow({ label, description, htmlFor, required, children, className }: SettingsRowProps) {
  const LabelTag = htmlFor ? "label" : "p";
  return (
    <div className={cn("flex flex-col gap-2.5 py-4 last:pb-0 @xl:flex-row @xl:items-start @xl:gap-8", className)}>
      <div className="min-w-0 @xl:w-2/5 @xl:max-w-64 @xl:shrink-0 @xl:pt-2">
        <LabelTag {...(htmlFor ? { htmlFor } : {})} className="block body-sm-medium font-semibold! text-primary-500">
          {label}
          {required && <span className="ml-0.5 text-red">*</span>}
        </LabelTag>
        {description && <p className="mt-0.5 body-xsm-regular text-primary-300">{description}</p>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Full-width row (no label column) for toggles and free-form content inside a SettingsCard. */
export function SettingsBlockRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("py-4 last:pb-0", className)}>{children}</div>;
}

export default SettingsRow;
