"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AppSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: (string | AppSelectOption)[];
  placeholder?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  icon,
  size = "md",
  fullWidth = false,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
}: AppSelectProps) {
  const isFullWidth = fullWidth || className?.includes("w-full");

  const normalizedOptions: AppSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const sizeClasses =
    size === "sm"
      ? "h-8 px-2.5 body-sm-medium gap-1.5"
      : "h-10 px-3.5 body-md-medium gap-2";

  return (
    <div
      className={cn(
        "relative",
        isFullWidth ? "w-full block" : "inline-block",
        className
      )}
    >
      <Select.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <Select.Trigger
          className={cn(
            "rounded-lg border border-dash bg-white text-primary-500 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs whitespace-nowrap",
            isFullWidth
              ? "flex w-full items-center justify-between"
              : "inline-flex items-center justify-between",
            sizeClasses,
            triggerClassName
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0 text-primary-400">{icon}</span>}
            {selectedOption?.icon && (
              <span className="shrink-0">{selectedOption.icon}</span>
            )}
            <Select.Value placeholder={placeholder}>
              {selectedOption ? selectedOption.label : placeholder}
            </Select.Value>
          </div>
          <Select.Icon asChild>
            <ChevronDown className="w-4 h-4 text-primary-300 ml-1.5 shrink-0" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-[200] min-w-32 overflow-hidden rounded-xl border border-dash bg-white p-1 text-primary-500 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              isFullWidth && "w-[var(--radix-select-trigger-width)]",
              contentClassName
            )}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-primary-400 cursor-default">
              <ChevronUp className="w-3.5 h-3.5" />
            </Select.ScrollUpButton>

            <Select.Viewport className="p-1">
              {normalizedOptions.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex items-center justify-between select-none py-2 px-3 rounded-lg body-md-medium text-primary-500 hover:bg-slate-50 focus:bg-brand-orange-light focus:text-brand-orange focus:outline-none cursor-pointer transition-colors data-[state=checked]:bg-brand-orange-light data-[state=checked]:text-brand-orange data-[state=checked]:font-semibold"
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </div>
                  <Select.ItemIndicator className="ml-2 shrink-0 text-brand-orange">
                    <Check className="w-4 h-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-primary-400 cursor-default">
              <ChevronDown className="w-3.5 h-3.5" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
