"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export interface DropdownActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

export interface AppDropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownActionItem[];
  align?: "start" | "center" | "end";
  sideOffset?: number;
  contentClassName?: string;
}

export function AppDropdownMenu({
  trigger,
  items,
  align = "end",
  sideOffset = 4,
  contentClassName,
}: AppDropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-[200] min-w-40 overflow-hidden rounded-xl border border-dash bg-white p-1 text-primary-500 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            contentClassName
          )}
        >
          {items.map((item) => (
            <React.Fragment key={item.key}>
              {item.separatorBefore && (
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
              )}
              <DropdownMenu.Item
                disabled={item.disabled}
                onSelect={item.onClick}
                className={cn(
                  "relative flex items-center gap-2.5 select-none py-2 px-3 rounded-lg body-md-medium cursor-pointer transition-colors outline-none",
                  item.danger
                    ? "text-red hover:bg-red-14 focus:bg-red-14"
                    : "text-primary-500 hover:bg-slate-50 focus:bg-slate-50",
                  item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </DropdownMenu.Item>
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
