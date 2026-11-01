"use client";

import React, { useId } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { cn } from "@/lib/cn";

export interface SettingToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Optional explicit id (an auto id is used otherwise). */
  id?: string;
  className?: string;
}

/** Orange toggle + title + helper line, used by every Edit Lesson tab ("Enable Video Player", "Show Correct Answers" …). */
export function SettingToggleRow({ title, description, checked, onChange, disabled, id, className }: SettingToggleRowProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("flex items-start gap-3", disabled && "opacity-60", className)}>
      <ToggleSwitch id={inputId} checked={checked} onChange={onChange} disabled={disabled} tone="orange" className="mt-0.5" />
      <label htmlFor={inputId} className={cn("min-w-0 select-none", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        <span className="block body-sm-medium text-primary-500">{title}</span>
        {description && <span className="mt-0.5 block body-xsm-regular text-primary-300">{description}</span>}
      </label>
    </div>
  );
}

export default SettingToggleRow;
