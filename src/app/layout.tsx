import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { ConsoleShell } from "@/components/console/shell/ConsoleShell";

const aeonik = localFont({
  src: [
    { path: "./fonts/Aeonik-Air.ttf", weight: "100", style: "normal" },
    { path: "./fonts/Aeonik-AirItalic.ttf", weight: "100", style: "italic" },
    { path: "./fonts/Aeonik-Thin.ttf", weight: "200", style: "normal" },
    { path: "./fonts/Aeonik-ThinItalic.ttf", weight: "200", style: "italic" },
    { path: "./fonts/Aeonik-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Aeonik-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./fonts/Aeonik-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Aeonik-RegularItalic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/Aeonik-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Aeonik-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/Aeonik-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Aeonik-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./fonts/Aeonik-Black.ttf", weight: "900", style: "normal" },
    { path: "./fonts/Aeonik-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduPro Owner Console",
  description: "Manage institutions, subscriptions, invoices, plans and domains across the EduPro platform.",
};

/** Owner Console — separate app from the institution admin panel (lms-admin-panel). /login renders bare. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={aeonik.variable}>
      <body className={`${aeonik.className} antialiased min-h-screen font-sans`}>
        <AppProviders>
          <Suspense fallback={<ShellFallback />}>
            <ConsoleShell>{children}</ConsoleShell>
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}

/** Shell-shaped placeholder while the client shell (pathname/session) streams in. */
function ShellFallback() {
  return (
    <div className="flex min-h-screen animate-pulse bg-gray-bg">
      <aside className="hidden w-64 shrink-0 flex-col gap-3 bg-brand-navy p-4 md:flex">
        <div className="mb-4 h-8 w-36 rounded-lg bg-white/10" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-9 rounded-xl bg-white/5" />
        ))}
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-dash bg-white px-6">
          <div className="h-10 w-72 rounded-lg bg-slate-100" />
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-dash bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-9 w-9 rounded-xl bg-slate-100" />
              </div>
              <div className="h-7 w-28 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
