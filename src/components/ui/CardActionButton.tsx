"use client";

import React from "react";
import SecondaryButton from "@/components/ui/secondary-button";
import { cn } from "@/lib/cn";

export interface CardActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  /** Leading icon, e.g. <Pencil />. */
  icon?: React.ReactNode;
  "aria-label"?: string;
  /** Marks a toggled state (e.g. "Add New Category" panel open). */
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * THE small action button inside cards and card headers ("Edit", "Add", "View All", "View Instructions",
 * "Customize Certificate" …). Same look everywhere: small secondary button with an optional icon.
 */
export function CardActionButton({ children, onClick, icon, active, disabled, className, ...rest }: CardActionButtonProps) {
  return (
    <SecondaryButton
      type="button"
      size="sm"
      leftIcon={icon}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={rest["aria-label"]}
      className={cn("shrink-0 whitespace-nowrap", active && "border-brand-orange text-brand-orange", className)}
    >
      {children}
    </SecondaryButton>
  );
}

export default CardActionButton;
