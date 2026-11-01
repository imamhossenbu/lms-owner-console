"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface DropdownSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export type DropdownSelectOptionInput = string | DropdownSelectOption;

export interface DropdownSelectProps {
  label?: string;
  fieldLabel?: string;
  required?: boolean;
  placeholder?: string;
  options: DropdownSelectOptionInput[];
  value: string | null;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
  direction?: "up" | "down";
  menuClassName?: string;
  optionClassName?: string;
  disabled?: boolean;
}

export function DropdownSelect({
  label,
  fieldLabel,
  required = false,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  icon,
  className = "",
  buttonClassName = "",
  align = "left",
  direction = "down",
  menuClassName = "",
  optionClassName = "",
  disabled = false,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Normalize options to DropdownSelectOption[]
  const normalizedOptions: DropdownSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const effectiveLabel = fieldLabel || label;
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const alignClass = align === "right" ? "right-0" : "left-0";
  const isUp = direction === "up";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {effectiveLabel && (
        <label
          htmlFor={id}
          className="block body-sm-regular text-primary-400 mb-2 select-none"
        >
          {effectiveLabel}
          {required && <span className="text-red ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button styled with strict globals.css tokens & body-md-medium typography */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-dash bg-white px-3.5 py-2 body-md-medium shadow-xs transition-all outline-none cursor-pointer select-none",
          "hover:border-slate-300 focus:border-brand-orange",
          open && "border-brand-orange ring-2 ring-brand-orange/10",
          disabled && "opacity-50 cursor-not-allowed",
          value ? "text-primary-500" : "subtext-500",
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          {icon && <span className="shrink-0 text-primary-300">{icon}</span>}
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-primary-300 transition-transform duration-200 pointer-events-none",
            open && (isUp ? "-rotate-180" : "rotate-180"),
            open && "text-primary-500"
          )}
        />
      </button>

      {/* Card System Popover Dropdown with globals tokens */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: isUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 min-w-50 w-full rounded-xl p-1.5 bg-white border border-dash shadow-lg max-h-64 overflow-y-auto scrollbar-none",
              isUp ? "bottom-full mb-1.5" : "mt-1.5",
              alignClass,
              menuClassName
            )}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left body-md-medium transition-colors cursor-pointer flex items-center justify-between gap-2.5",
                    isSelected
                      ? "bg-brand-orange-light text-brand-orange"
                      : "text-primary-500 hover:bg-slate-50",
                    optionClassName
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-orange shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DropdownSelect;
