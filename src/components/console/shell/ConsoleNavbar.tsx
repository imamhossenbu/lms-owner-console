"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, LogOut, Menu, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { AppDropdownMenu } from "@/components/ui/AppDropdownMenu";
import { Avatar } from "@/components/ui/Avatar";
import { ConsoleSearch } from "./ConsoleSearch";
import { CONSOLE_OWNER, endConsoleSession, type ConsoleSession } from "./consoleSession";
import { ADMIN_PANEL_URL } from "@/lib/adminPanel";

/** Owner Console top bar: sidebar toggle, institution search, "Open institution panel", owner menu. */
export function ConsoleNavbar({ session }: { session: ConsoleSession | null | undefined }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const owner = session ?? { ...CONSOLE_OWNER, signedInAt: "" };

  const signOut = () => {
    endConsoleSession();
    toast.success("Signed out of the Owner Console", { description: "Your console session has ended." });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-dash bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => dispatch(toggleSidebar())}
          className="shrink-0 cursor-pointer rounded-xl border border-dash p-2 text-primary-400 transition-colors hover:bg-slate-50 hover:text-primary-500"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </motion.button>
        <ConsoleSearch />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <a
          href={ADMIN_PANEL_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden h-10 items-center gap-2 rounded-lg border border-dash bg-white px-4 body-sm-medium text-primary-500 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 md:inline-flex"
        >
          <ExternalLink className="h-4 w-4" />
          Open institution panel
        </a>

        <AppDropdownMenu
          align="end"
          trigger={
            <button type="button" className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent p-1.5 pr-2.5 transition-all hover:border-dash hover:bg-slate-50">
              <Avatar name={owner.name} size={32} />
              <span className="hidden flex-col text-left lg:flex">
                <span className="body-sm-medium text-primary-500">{owner.name}</span>
                <span className="body-2xsm-regular text-primary-300">Platform owner</span>
              </span>
              <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-primary-300" />
            </button>
          }
          items={[
            { key: "role", label: owner.email, icon: <ShieldCheck className="h-4 w-4" />, disabled: true },
            { key: "settings", label: "Console settings", icon: <Settings className="h-4 w-4" />, onClick: () => router.push("/settings"), separatorBefore: true },
            { key: "panel", label: "Open institution panel", icon: <ExternalLink className="h-4 w-4" />, onClick: () => window.open(ADMIN_PANEL_URL, "_blank", "noopener") },
            { key: "logout", label: "Sign out", icon: <LogOut className="h-4 w-4" />, danger: true, onClick: signOut, separatorBefore: true },
          ]}
        />
      </div>
    </header>
  );
}

export default ConsoleNavbar;
