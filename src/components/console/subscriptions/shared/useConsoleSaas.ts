"use client";

import type { SaasStore } from "@/types/saas";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";

/** Live SaaS store + `ready` once the snapshot request settled — render skeletons until then. */
export function useConsoleSaas(): { store: SaasStore; ready: boolean } {
  const store = useSaasStore();
  const ready = useSaasReady();
  return { store, ready };
}

export default useConsoleSaas;
