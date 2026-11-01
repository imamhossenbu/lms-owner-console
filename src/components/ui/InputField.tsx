import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      required,
      error,
      leftElement,
      rightElement,
      id,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block body-sm-regular text-primary-400 mb-2 select-none"
          >
            {label}
            {required && <span className="text-red ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={`h-10 w-full rounded-lg border body-sm-regular text-primary-500 outline-none transition-all placeholder:text-primary-300 focus:border-brand-orange focus:bg-white ${
              error
                ? "border-red/100 bg-red-14"
                : "border-dash bg-white"
            } ${leftElement ? "pl-10" : "pl-3.5"} ${
              rightElement ? "pr-10" : "pr-3.5"
            } py-2 shadow-xs ${className}`}
            {...props}
          />
          {leftElement && (
            <div className="absolute left-0 top-0 h-full flex items-center justify-center pl-3 text-primary-300 pointer-events-none">
              {leftElement}
            </div>
          )}
          {rightElement && (
            <div className="absolute right-0 top-0 h-full flex items-center justify-center pr-3 text-primary-300">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 body-xsm-regular text-red">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
