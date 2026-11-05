"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

/** Marketing website testimonials, managed here and shown on the website when published. */
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
  isPublished: boolean;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export type TestimonialInput = Pick<Testimonial, "quote" | "name" | "role" | "avatarUrl" | "isPublished" | "featured" | "order">;

export const TESTIMONIALS_UPDATED_EVENT = "edupro_console_testimonials_updated";
const announce = () => window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
const BASE = "/saas/owner/testimonials";

export async function createTestimonial(input: TestimonialInput) {
  const t = await api.post<Testimonial>(BASE, input);
  announce();
  return t;
}
export async function updateTestimonial(id: string, patch: Partial<TestimonialInput>) {
  const t = await api.patch<Testimonial>(`${BASE}/${encodeURIComponent(id)}`, patch);
  announce();
  return t;
}
export async function deleteTestimonial(id: string) {
  await api.delete(`${BASE}/${encodeURIComponent(id)}`);
  announce();
}

/** One page of testimonials (`q`, `status` = published | draft), re-read after every change. */
export function useTestimonialsPage(filters: { q: string; status: string }, page: number, limit: number) {
  const key = JSON.stringify([filters, page, limit]);
  const [state, setState] = useState<{ rows: Testimonial[]; total: number; error: string | null } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(TESTIMONIALS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(TESTIMONIALS_UPDATED_EVENT, bump);
  }, []);
  useEffect(() => {
    let alive = true;
    const [f, p, l] = JSON.parse(key) as [{ q: string; status: string }, number, number];
    api
      .get<{ data: Testimonial[]; meta: { total: number } }>(BASE, { ...(f.q ? { q: f.q } : {}), ...(f.status !== "All" ? { status: f.status } : {}), page: p, limit: l })
      .then(
        (res) => alive && setState({ rows: res.data, total: res.meta.total, error: null }),
        (err) => alive && setState((prev) => ({ rows: prev?.rows ?? [], total: prev?.total ?? 0, error: err instanceof Error ? err.message : "Couldn't load testimonials." }))
      );
    return () => {
      alive = false;
    };
  }, [key, tick]);
  return { rows: state?.rows ?? [], total: state?.total ?? 0, error: state?.error ?? null, isLoading: state === null, retry: () => setTick((n) => n + 1) };
}
