import React from "react";
import type { Tone } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";

const TONE_TILE: Partial<Record<Tone, string>> = {
  orange: "bg-brand-orange-light text-brand-orange",
  primary: "bg-brand-orange-light text-brand-orange",
  blue: "bg-blue-14 text-blue",
  indigo: "bg-blue-14 text-blue",
  green: "bg-green-bg text-green",
  success: "bg-green-bg text-green",
  purple: "bg-purple-14 text-purple",
  yellow: "bg-yellow-bg text-yellow",
  warning: "bg-yellow-bg text-yellow",
  red: "bg-red-14 text-red",
  danger: "bg-red-14 text-red",
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8 w-8 rounded-lg body-2xsm-regular font-semibold!",
  md: "h-10 w-10 rounded-xl body-xsm-medium font-semibold!",
  lg: "h-14 w-14 rounded-2xl title-bold",
};

/** Initials tile for an institution (tone from the institution record). */
export function InstitutionAvatar({ initials, tone, size = "md", className }: { initials: string; tone: Tone; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center", SIZE[size], TONE_TILE[tone] ?? "bg-gray-bg text-primary-400", className)}>
      {initials}
    </span>
  );
}

export default InstitutionAvatar;
