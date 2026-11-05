"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

/** A marketing website blog post, written here and shown on the website's /blog when published. */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatarUrl: string;
  readMinutes: number;
  isPublished: boolean;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export type BlogPostInput = Pick<BlogPost, "title" | "slug" | "excerpt" | "content" | "coverUrl" | "category" | "tags" | "authorName" | "authorRole" | "authorAvatarUrl" | "isPublished" | "featured">;

export const BLOG_UPDATED_EVENT = "edupro_console_blog_updated";
const announce = () => window.dispatchEvent(new Event(BLOG_UPDATED_EVENT));
const BASE = "/saas/owner/blog";

export async function createBlogPost(input: BlogPostInput) {
  const p = await api.post<BlogPost>(BASE, input);
  announce();
  return p;
}
export async function updateBlogPost(id: string, patch: Partial<BlogPostInput>) {
  const p = await api.patch<BlogPost>(`${BASE}/${encodeURIComponent(id)}`, patch);
  announce();
  return p;
}
export async function deleteBlogPost(id: string) {
  await api.delete(`${BASE}/${encodeURIComponent(id)}`);
  announce();
}

type Filters = { q: string; status: string; category: string };

/** One page of posts (`q`, `status` = published | draft, `category`), re-read after every change. */
export function useBlogPostsPage(filters: Filters, page: number, limit: number) {
  const key = JSON.stringify([filters, page, limit]);
  const [state, setState] = useState<{ rows: BlogPost[]; total: number; error: string | null } | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(BLOG_UPDATED_EVENT, bump);
    return () => window.removeEventListener(BLOG_UPDATED_EVENT, bump);
  }, []);
  useEffect(() => {
    let alive = true;
    const [f, p, l] = JSON.parse(key) as [Filters, number, number];
    api
      .get<{ data: BlogPost[]; meta: { total: number } }>(BASE, { ...(f.q ? { q: f.q } : {}), ...(f.status !== "All" ? { status: f.status } : {}), ...(f.category !== "All" ? { category: f.category } : {}), page: p, limit: l })
      .then(
        (res) => alive && setState({ rows: res.data, total: res.meta.total, error: null }),
        (err) => alive && setState((prev) => ({ rows: prev?.rows ?? [], total: prev?.total ?? 0, error: err instanceof Error ? err.message : "Couldn't load posts." }))
      );
    return () => {
      alive = false;
    };
  }, [key, tick]);
  return { rows: state?.rows ?? [], total: state?.total ?? 0, error: state?.error ?? null, isLoading: state === null, retry: () => setTick((n) => n + 1) };
}

/** One post for the editor (`null` id = new post). */
export function useBlogPost(id: string | null) {
  const [state, setState] = useState<{ post: BlogPost | null; error: string | null; loading: boolean }>({ post: null, error: null, loading: !!id });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    api.get<BlogPost>(`${BASE}/${encodeURIComponent(id)}`).then(
      (post) => alive && setState({ post, error: null, loading: false }),
      (err) => alive && setState({ post: null, error: err instanceof Error ? err.message : "Couldn't load this post.", loading: false })
    );
    return () => {
      alive = false;
    };
  }, [id, tick]);
  return { ...state, retry: () => setTick((n) => n + 1) };
}

/** Lowercase, hyphenated slug (matches the API's rules). */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

/** Public URL of a post on the marketing website. */
export const WEBSITE_POST_URL = (slug: string) => `${(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3002").replace(/\/$/, "")}/blog/${slug}`;
