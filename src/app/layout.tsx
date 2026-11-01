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

/** Shell-shaped placeholder (white sidebar + navbar + KPI row) while the client shell (pathname/session) streams in. */
function ShellFallback() {
  return (
    <div className="flex min-h-screen animate-pulse bg-gray-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-dash bg-white md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-dash px-4">
          <div className="h-9 w-9 rounded-xl bg-slate-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 rounded bg-slate-200" />
            <div className="h-2.5 w-20 rounded bg-slate-100" />
          </div>
        </div>
        <div className="space-y-4 px-2.5 py-3">
          {[1, 3, 2, 1].map((n, s) => (
            <div key={s} className="space-y-1.5">
              <div className="mx-3 h-2.5 w-16 rounded bg-slate-100" />
              {Array.from({ length: n }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="h-4.5 w-4.5 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-dash bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl border border-dash bg-slate-50" />
            <div className="h-10 w-64 rounded-xl border border-dash bg-slate-50 md:w-96" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-40 rounded-xl border border-dash bg-slate-50 sm:block" />
            <div className="h-10 w-10 rounded-xl border border-dash bg-slate-50" />
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="space-y-3 p-3">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="h-3.5 w-72 rounded bg-slate-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="rounded-xl border border-dash bg-white px-4 py-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-6 w-20 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="h-3 w-28 rounded bg-slate-100" />
                  <div className="h-6 w-20 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
