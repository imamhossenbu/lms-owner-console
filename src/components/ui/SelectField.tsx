"use client";

import React, { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="body-sm-regular mb-2 block text-primary-400">
      {children}
    </label>
  );
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  leftIcon?: ReactNode;
  placeholderValue?: string;
  containerClassName?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      error,
      options,
      value,
      onChange,
      leftIcon,
      placeholderValue = "",
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const isPlaceholder = value === placeholderValue;

    return (
      <div className={containerClassName}>
        {label && <FieldLabel htmlFor={selectId}>{label}</FieldLabel>}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-300 [&>svg]:h-4 [&>svg]:w-4">
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={(e) => {
              if (!onChange) return;
              if ((props as any).name) {
                (onChange as any)(e);
              } else {
                (onChange as any)(e.target.value);
              }
            }}
            className={cn(
              "h-10 w-full cursor-pointer appearance-none rounded-lg border border-dash bg-white pr-9 body-md-medium outline-none shadow-xs transition-colors focus:border-brand-orange [&>option]:text-primary-500",
              leftIcon ? "pl-10" : "pl-3.5",
              isPlaceholder ? "subtext-500" : "text-primary-500",
              error && "border-red focus:border-red",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
        </div>
        {error && <p className="body-xsm-regular text-red mt-1.5">{error}</p>}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";

export default SelectField;
