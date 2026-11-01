"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | null | undefined;

/**
 * Reads and writes page state (tab, search, filters, page) in the URL so a reload
 * keeps the user exactly where they were. Empty values, "All" and page 1 are
 * dropped to keep URLs clean. Components using this must sit inside <Suspense>.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  );

  const getPage = useCallback(() => {
    const page = Number(searchParams.get("page"));
    return Number.isInteger(page) && page > 0 ? page : 1;
  }, [searchParams]);

  const set = useCallback(
    (updates: Record<string, ParamValue>, options: { replaceAll?: boolean } = {}) => {
      const params = new URLSearchParams(options.replaceAll ? "" : searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        const str = value === null || value === undefined ? "" : String(value);
        if (!str || str === "All" || (key === "page" && str === "1")) params.delete(key);
        else params.set(key, str);
      });
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { get, getPage, set };
}
