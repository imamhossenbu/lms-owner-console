"use client";

import { useEffect, useState } from "react";
import type { SaasStore } from "@/types/saas";
import { fetchSaas } from "@/lib/saasStorage";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";

/** Live SaaS store + `ready` once the first (simulated) fetch resolved — render skeletons until then. */
export function useConsoleSaas(): { store: SaasStore; ready: boolean } {
  const store = useSaasStore();
  const hydrated = useSaasReady();
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSaas().finally(() => alive && setFetched(true));
    return () => {
      alive = false;
    };
  }, []);

  return { store, ready: hydrated && fetched };
}

export default useConsoleSaas;
