"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { useUrlParams } from "@/lib/useUrlParams";
import { formatMoney, mrr } from "@/lib/saasStats";
import { ConsolePageHeader } from "../../shared/ConsolePageHeader";
import { ConsoleEmptyState } from "../../shared/ConsoleEmptyState";
import { useNow } from "../../shared/useNow";
import { useInstitutionActions } from "../actions/useInstitutionActions";
import { useInstitutionDialogs } from "../actions/useInstitutionDialogs";
import { InstitutionsSkeleton } from "./InstitutionsSkeleton";
import { InstitutionStatsRow } from "./InstitutionStatsRow";
import { InstitutionsTable } from "./InstitutionsTable";
import {
  applyFilters,
  isFiltered,
  PAGE_SIZES,
  parsePlan,
  parseSort,
  parseStatus,
  parseType,
  planOptions,
  RESET_PARAMS,
  sortParam,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  type InstitutionFilters,
  type SortKey,
} from "./institutionsFilters";

/** /console/institutions — every tenant with URL-synced search (?q), status / plan / type filters, sort, page. Render inside <Suspense>. */
export function InstitutionsView() {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const { get, getPage, set } = useUrlParams();
  const actions = useInstitutionActions();
  const { open, dialogs } = useInstitutionDialogs(store.plans, actions);

  const filters: InstitutionFilters = { q: get("q"), status: parseStatus(get("status")), plan: parsePlan(get("plan"), store.plans), type: parseType(get("type")) };
  const sort = parseSort(get("sort"));
  const perPageParam = Number(get("perPage"));
  const perPage = PAGE_SIZES.includes(perPageParam) ? perPageParam : PAGE_SIZES[0]!;
  // React Compiler memoizes this; the list is small (tens of institutions).
  const filtered = applyFilters([...store.institutions], store.plans, filters, sort);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(getPage(), totalPages);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  if (!ready) return <InstitutionsSkeleton />;

  const filteredState = isFiltered(filters);
  const reset = () => set(RESET_PARAMS);
  const onSort = (key: SortKey) => {
    const dir = sort.key === key ? (sort.dir === "desc" ? "asc" : "desc") : key === "name" ? "asc" : "desc";
    set({ sort: sortParam({ key, dir }), page: null });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsolePageHeader
        trail={[{ label: "Institutions" }]}
        title="Institutions"
        subtitle={`${store.institutions.length} tenants · ${formatMoney(Math.round(mrr(store)))} MRR`}
        actions={
          <PrimaryButton size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/institutions/new")}>
            Add institution
          </PrimaryButton>
        }
      />

      <InstitutionStatsRow institutions={store.institutions} />

      <div className="bg-white rounded-xl border border-dash shadow-2xs p-5 space-y-4">
        <ListFilters
            query={filters.q}
            searchPlaceholder="Search by name, subdomain, domain, owner or country..."
            onQueryChange={(v) => set({ q: v || null, page: null })}
            selects={[
              { key: "status", value: filters.status, options: STATUS_OPTIONS, onChange: (v) => set({ status: v, page: null }) },
              { key: "plan", value: filters.plan, options: planOptions(store.plans), onChange: (v) => set({ plan: v, page: null }) },
              { key: "type", value: filters.type, options: TYPE_OPTIONS, onChange: (v) => set({ type: v, page: null }) },
            ]}
            onReset={reset}
            isFiltered={filteredState}
          />
          <InstitutionsTable
            rows={rows}
            plans={store.plans}
            sort={sort}
            onSort={onSort}
            open={open}
            now={now}
            emptyMessage={
              filteredState ? (
                <ConsoleEmptyState icon={<Building2 className="h-6 w-6" />} title="No institutions match your filters" message="Try another name, status, plan or type." onReset={reset} />
              ) : (
                <ConsoleEmptyState
                  icon={<Building2 className="h-6 w-6" />}
                  title="No institutions yet"
                  message="Create the first institution or share the signup link."
                  actionLabel="Add institution"
                  actionIcon={<Plus className="h-4 w-4" />}
                  onAction={() => router.push("/institutions/new")}
                />
              )
            }
            footer={
              filtered.length > 0 ? (
              <TablePagination
                currentPage={page}
                pageSize={perPage}
                totalCount={filtered.length}
                itemLabel={filtered.length === 1 ? "institution" : "institutions"}
                onPageChange={(next) => set({ page: next })}
                onPageSizeChange={(size) => set({ perPage: size === PAGE_SIZES[0] ? null : size, page: null })}
                pageSizeOptions={PAGE_SIZES}
              />
              ) : undefined
            }
          />
      </div>
      {dialogs}
    </motion.div>
  );
}

export default InstitutionsView;
