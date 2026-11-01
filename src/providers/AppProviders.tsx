"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ReduxProvider } from "./ReduxProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- render the toaster only after hydration
  useEffect(() => setMounted(true), []);
  return (
    <ReduxProvider>
      {children}
      {mounted && <Toaster position="top-right" richColors />}
    </ReduxProvider>
  );
}
