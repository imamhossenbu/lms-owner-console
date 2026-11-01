import React from "react";
import { cn } from "@/lib/cn";

export interface CharCounterProps {
  count: number;
  max: number;
  className?: string;
}

/** Right-aligned "x/max" counter under a text field; turns red when over the limit. */
export function CharCounter({ count, max, className }: CharCounterProps) {
  return (
    <p className={cn("text-right body-xsm-regular tabular-nums", count > max ? "text-red" : "text-primary-300", className)} aria-live="polite">
      {count}/{max}
    </p>
  );
}

export default CharCounter;
