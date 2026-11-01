import React from "react";
import { cn } from "@/lib/cn";

export type Tone =
  | "green"
  | "blue"
  | "red"
  | "orange"
  | "gray"
  | "primary"
  | "success"
  | "warning"
  | "yellow"
  | "danger"
  | "neutral"
  | "ice"
  | "navy"
  | "indigo"
  | "purple";

const TONE_CLASS: Record<string, string> = {
  green: "bg-green-bg text-green border border-green/30",
  success: "bg-green-bg text-green border border-green/30",
  blue: "bg-blue-14 text-blue border border-blue/30",
  primary: "bg-brand-orange-light text-brand-orange border border-brand-orange/20",
  orange: "bg-brand-orange-light text-brand-orange border border-brand-orange/20",
  red: "bg-red-14 text-red border border-red/30",
  danger: "bg-red-14 text-red border border-red/30",
  warning: "bg-yellow-bg text-yellow border border-yellow/30",
  yellow: "bg-yellow-bg text-yellow border border-yellow/30",
  gray: "bg-gray-bg text-primary-400 border border-dash",
  neutral: "bg-gray-bg text-primary-400 border border-dash",
  ice: "bg-brand-ice text-brand-orange border border-brand-orange/20",
  navy: "bg-slate-100 text-primary-500 border border-dash",
  indigo: "bg-blue-14 text-blue border border-blue/30",
  purple: "bg-purple-14 text-purple border border-purple/30",
};

const DOT_CLASS: Record<string, string> = {
  green: "bg-green",
  success: "bg-green",
  blue: "bg-blue",
  primary: "bg-brand-orange",
  orange: "bg-brand-orange",
  red: "bg-red",
  danger: "bg-red",
  warning: "bg-yellow",
  yellow: "bg-yellow",
  gray: "bg-primary-300",
  neutral: "bg-primary-300",
  ice: "bg-brand-orange",
  navy: "bg-primary-500",
  indigo: "bg-blue",
  purple: "bg-purple",
};

const SIZE_CLASS: Record<string, string> = {
  sm: "px-2 py-0.5 body-2xsm-regular",
  md: "px-2.5 py-1 body-xsm-medium",
  lg: "px-3 py-1.5 body-sm-medium",
};

export interface ToneBadgeProps {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "rounded" | "pill";
  dot?: boolean;
  icon?: React.ReactNode;
}

export function ToneBadge({
  tone,
  children,
  className,
  size = "md",
  variant = "rounded",
  dot = false,
  icon,
}: ToneBadgeProps) {
  const roundedClass = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors",
        roundedClass,
        SIZE_CLASS[size] || SIZE_CLASS.md,
        TONE_CLASS[tone] || TONE_CLASS.gray,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            DOT_CLASS[tone] || "bg-primary-300"
          )}
        />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}

export default ToneBadge;
