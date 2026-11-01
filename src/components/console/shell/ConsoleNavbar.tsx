"use client";

import React, { useEffect, useRef, useState } from "react";
import { useViewportFit } from "@/lib/useViewportFit";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, LogOut, Menu, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { Avatar } from "@/components/ui/Avatar";
import { ADMIN_PANEL_URL } from "@/lib/adminPanel";
import { ConsoleSearch } from "./ConsoleSearch";
import { ConsoleAlertsDropdown } from "./ConsoleAlertsDropdown";
import { CONSOLE_OWNER, endConsoleSession, type ConsoleSession } from "./consoleSession";

/** Owner Console top bar — same layout as the panel's AdminNavbar: toggle + search · panel link, bell, profile pill. */
export function ConsoleNavbar({ session }: { session: ConsoleSession | null | undefined }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const owner = session ?? { ...CONSOLE_OWNER, signedInAt: "" };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  useViewportFit(menuOpen, fitRef);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const go = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  const signOut = () => {
    setMenuOpen(false);
    endConsoleSession();
    toast.success("Signed out successfully", { description: "Your Owner Console session has ended." });
    router.push("/login");
  };

  return (
    <header className="h-16 px-4 lg:px-8 bg-white border-b border-dash flex items-center justify-between gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl border border-dash text-primary-400 hover:text-primary-500 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </motion.button>
        <ConsoleSearch />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Same slot + geometry as the panel's date-range button */}
        <motion.a
          whileTap={{ scale: 0.97 }}
          href={ADMIN_PANEL_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex h-10 items-center gap-2 px-3.5 rounded-xl border border-dash bg-white body-sm-medium text-primary-500 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-primary-400" />
          Institution panel
        </motion.a>

        <ConsoleAlertsDropdown />

        <div className="relative" ref={menuRef}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-transparent hover:border-dash hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Avatar name={owner.name} size={32} />
            <span className="hidden lg:flex flex-col text-left">
              <span className="body-sm-medium text-primary-500">{owner.name}</span>
              <span className="body-2xsm-regular text-primary-300">Platform Owner</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-primary-300 ml-0.5" />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={fitRef}
                role="menu"
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-dash py-1.5 z-50"
              >
                <div className="px-4 py-2.5 border-b border-dash">
                  <p className="body-sm-medium text-primary-500 truncate">{owner.name}</p>
                  <p className="body-2xsm-regular text-primary-300 truncate">{owner.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-bg text-green body-2xsm-regular whitespace-nowrap">
                    <Shield className="w-3 h-3 text-green" />
                    <span>Platform Owner Verified</span>
                  </div>
                </div>

                <div className="py-1">
                  <MenuItem icon={<Settings className="w-4 h-4 text-primary-300" />} onClick={() => go(() => router.push("/settings"))}>
                    Settings
                  </MenuItem>
                  <MenuItem
                    icon={<ExternalLink className="w-4 h-4 text-primary-300" />}
                    onClick={() => go(() => window.open(ADMIN_PANEL_URL, "_blank", "noopener"))}
                  >
                    Open institution panel
                  </MenuItem>
                </div>

                <div className="pt-1 border-t border-dash">
                  <MenuItem danger icon={<LogOut className="w-4 h-4 text-red-dark" />} onClick={signOut}>
                    Sign Out
                  </MenuItem>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, children, onClick, danger }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        danger
          ? "w-full flex items-center gap-2.5 px-4 py-2.5 text-left body-md-medium text-red-dark hover:bg-red-14 transition-colors cursor-pointer"
          : "w-full flex items-center gap-2.5 px-4 py-2.5 text-left body-md-medium text-primary-500 hover:bg-slate-50 transition-colors cursor-pointer"
      }
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default ConsoleNavbar;
