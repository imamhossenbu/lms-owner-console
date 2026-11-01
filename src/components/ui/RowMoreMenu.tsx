"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { AppDropdownMenu, DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { cn } from "@/lib/cn";

interface RowMoreMenuProps {
  items: DropdownActionItem[];
  label?: string;
  size?: "sm" | "md";
}

/** "•••" button that opens a row action menu without triggering the row click. */
export function RowMoreMenu({ items, label = "More actions", size = "md" }: RowMoreMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-flex">
      <AppDropdownMenu
        items={items}
        trigger={
          <button
            type="button"
            aria-label={label}
            title={label}
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-dash bg-white text-primary-500 hover:bg-slate-50 transition-colors cursor-pointer",
              size === "sm" ? "w-7 h-7" : "w-9 h-9"
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        }
      />
    </div>
  );
}

export default RowMoreMenu;
