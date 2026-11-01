"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConsoleSidebar } from "./ConsoleSidebar";
import { ConsoleNavbar } from "./ConsoleNavbar";
import { useConsoleSession } from "./consoleSession";

const isConsoleLogin = (pathname: string | null) => pathname === "/login";

/**
 * Owner Console frame (navy sidebar + navbar). Separate from the institution AdminShell, which skips /console/**.
 * /console/login renders bare. Without a console session the owner is sent to /console/login.
 */
export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useConsoleSession();
  const bare = isConsoleLogin(pathname);

  useEffect(() => {
    if (!bare && session === null) router.replace(`/login?next=${encodeURIComponent(pathname ?? "/")}`);
  }, [bare, session, router, pathname]);

  if (bare) return <>{children}</>;
  if (session === null) return null;

  return (
    <div className="flex min-h-screen bg-gray-bg">
      <ConsoleSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-gray-bg">
        <ConsoleNavbar session={session} />
        <main className="mx-auto w-full max-w-400 flex-1 p-3 lg:p-5">{children}</main>
      </div>
    </div>
  );
}

export default ConsoleShell;
