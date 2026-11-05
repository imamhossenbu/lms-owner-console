"use client";

import { useEffect, useState } from "react";
import type { SaasInvoice } from "@/types/saas";
import { api, fetchAllPages } from "@/lib/api/client";
import { SAAS_UPDATED_EVENT } from "@/lib/saasStorage";

/**
 * Invoices for the console's Invoices page, read from the server one page at a time
 * (`GET /saas/owner/invoices/page`), with KPIs over every invoice (`/invoices/stats`). The store snapshot only
 * carries the last ~15 months (plus unpaid ones) for the charts.
 */

export interface InvoiceFilters {
  q?: string;
  status?: string;
  planId?: string;
  from?: string;
  to?: string;
  sort: "issued" | "amount";
  dir: "asc" | "desc";
}

export interface InvoiceStats {
  collectedThisMonth: number;
  collectedLastMonth: number;
  open: { count: number; total: number };
  failed: { count: number; total: number };
  refunded: { count: number; total: number };
}

interface Page<T> {
  data: T[];
  meta: { total: number; page: number; totalPages: number };
}

const query = (f: InvoiceFilters) => ({
  ...(f.q ? { q: f.q } : {}),
  ...(f.status ? { status: f.status } : {}),
  ...(f.planId ? { planId: f.planId } : {}),
  ...(f.from ? { from: f.from } : {}),
  ...(f.to ? { to: f.to } : {}),
  sort: f.sort,
  dir: f.dir,
});

export const fetchInvoicePage = (f: InvoiceFilters, page: number, limit: number) => api.get<Page<SaasInvoice>>("/saas/owner/invoices/page", { ...query(f), page, limit });
export const fetchInvoiceStats = () => api.get<InvoiceStats>("/saas/owner/invoices/stats");
export const fetchInvoice = (id: string) => api.get<SaasInvoice>(`/saas/owner/invoices/${encodeURIComponent(id)}`);
/** Every invoice matching the filters (CSV export). */
export const fetchInvoicesMatching = (f: InvoiceFilters) => fetchAllPages<SaasInvoice>("/saas/owner/invoices/page", query(f));

/** One page + the KPIs, re-read whenever the SaaS store changes (an invoice was paid, refunded…). */
export function useInvoicePage(filters: InvoiceFilters, page: number, limit: number) {
  const key = JSON.stringify([filters, page, limit]);
  const [state, setState] = useState<{ key: string; rows: SaasInvoice[]; total: number; stats: InvoiceStats | null; error: unknown } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(SAAS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(SAAS_UPDATED_EVENT, bump);
  }, []);

  useEffect(() => {
    let alive = true;
    const [f, p, l] = JSON.parse(key) as [InvoiceFilters, number, number];
    Promise.all([fetchInvoicePage(f, p, l), fetchInvoiceStats()]).then(
      ([res, stats]) => alive && setState({ key, rows: res.data, total: res.meta.total, stats, error: null }),
      (error) => alive && setState((prev) => ({ key, rows: prev?.rows ?? [], total: prev?.total ?? 0, stats: prev?.stats ?? null, error }))
    );
    return () => {
      alive = false;
    };
  }, [key, tick]);

  return {
    rows: state?.rows ?? [],
    total: state?.total ?? 0,
    stats: state?.stats ?? null,
    error: state?.error ?? null,
    /** First load (no data yet); later filter changes keep the previous rows until the new page arrives. */
    isLoading: state === null,
  };
}
