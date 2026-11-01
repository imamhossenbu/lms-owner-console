"use client";

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  value: string;
  /** Toast title, e.g. "Order ID copied". */
  label: string;
  className?: string;
}

/** Small icon button that copies a value and confirms with a toast. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label, { description: value });
    } catch {
      toast.error("Could not copy", { description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${value}`}
      title="Copy"
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-md text-primary-300 hover:text-brand-orange hover:bg-slate-100 transition-colors cursor-pointer shrink-0",
        className
      )}
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  );
}

export default CopyButton;
