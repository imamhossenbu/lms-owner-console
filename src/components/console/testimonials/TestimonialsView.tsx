"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, MessageSquareQuote, Pencil, Plus, SearchX, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUrlParams } from "@/lib/useUrlParams";
import { deleteTestimonial, updateTestimonial, useTestimonialsPage, type Testimonial } from "@/lib/testimonialStorage";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { ConsoleEmptyState } from "@/components/console/shared/ConsoleEmptyState";
import { TestimonialFormModal } from "./TestimonialFormModal";
import { TestimonialsSkeleton } from "./TestimonialsSkeleton";

const PAGE_SIZES = [10, 20, 50];
const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];
const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** /testimonials — quotes shown on the marketing website: search, status filter, add / edit / publish / feature / delete. */
export function TestimonialsView() {
  const { get, getPage, set } = useUrlParams();
  const query = get("q");
  const status = get("status", "All");
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;
  const page = getPage();
  const { rows, total, isLoading, error, retry } = useTestimonialsPage({ q: query.trim(), status }, page, pageSize);
  const [editing, setEditing] = useState<Testimonial | null | "new">(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  if (isLoading) return <TestimonialsSkeleton />;

  /** Quick update from the row menu: loading → `done` / error toast. */
  const toggle = async (t: Testimonial, patch: Partial<Testimonial>, pending: string, done: string) => {
    const id = toast.loading(pending, { description: t.name });
    try {
      await updateTestimonial(t.id, patch);
      toast.success(done, { id, description: t.name });
    } catch (err) {
      toast.error("Couldn't update the testimonial", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const columns: ColumnDef<Testimonial>[] = [
    {
      key: "person",
      header: "Person",
      width: "26%",
      render: (t) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange-light body-sm-medium text-brand-orange">{initials(t.name)}</span>
          <div className="min-w-0">
            <span className="body-sm-medium text-primary-500 block truncate">{t.name}</span>
            <span className="body-2xsm-regular text-primary-300 block truncate">{t.role || "—"}</span>
          </div>
        </div>
      ),
    },
    { key: "quote", header: "Quote", render: (t) => <p className="body-sm-regular text-primary-400 line-clamp-2">“{t.quote}”</p> },
    {
      key: "status",
      header: "Status",
      width: "150px",
      align: "center",
      render: (t) => (
        <div className="flex items-center justify-center gap-1.5">
          <ToneBadge tone={t.isPublished ? "green" : "gray"} size="sm">
            {t.isPublished ? "Published" : "Draft"}
          </ToneBadge>
          {t.featured && (
            <ToneBadge tone="orange" size="sm">
              Featured
            </ToneBadge>
          )}
        </div>
      ),
    },
    { key: "order", header: "Order", width: "80px", align: "center", render: (t) => <span className="body-sm-medium text-primary-500">{t.order}</span> },
    {
      key: "actions",
      header: "",
      width: "60px",
      align: "center",
      render: (t) => (
        <RowMoreMenu
          label={`Actions for ${t.name}`}
          items={[
            { key: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setEditing(t) },
            t.isPublished
              ? { key: "unpublish", label: "Unpublish", icon: <EyeOff className="h-4 w-4" />, onClick: () => void toggle(t, { isPublished: false }, "Unpublishing...", "Hidden from the website") }
              : { key: "publish", label: "Publish", icon: <Eye className="h-4 w-4" />, onClick: () => void toggle(t, { isPublished: true }, "Publishing...", "Live on the website") },
            { key: "feature", label: t.featured ? "Remove highlight" : "Highlight as featured", icon: <Star className="h-4 w-4" />, onClick: () => void toggle(t, { featured: !t.featured }, "Saving...", t.featured ? "No longer featured" : "Featured on the website") },
            { key: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, danger: true, separatorBefore: true, onClick: () => setDeleting(t) },
          ]}
        />
      ),
    },
  ];

  const isFiltered = !!query || status !== "All";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Testimonials" }]}
        title="Testimonials"
        subtitle="Customer quotes on the marketing website. Only published ones are shown — add real, approved quotes only."
        actions={
          <PrimaryButton size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing("new")}>
            Add testimonial
          </PrimaryButton>
        }
      />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <ListFilters
          query={query}
          searchPlaceholder="Search quote, name or role..."
          onQueryChange={(q) => set({ q: q || null, page: null })}
          selects={[{ key: "status", value: status, options: STATUS_OPTIONS, onChange: (v) => set({ status: v === "All" ? null : v, page: null }), className: "xl:w-44" }]}
          onReset={() => set({ q: null, status: null, page: null })}
          isFiltered={isFiltered}
        />
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red bg-red-14 px-4 py-3">
            <span className="body-sm-regular text-red">{error}</span>
            <button type="button" onClick={retry} className="body-sm-medium text-red underline">
              Try again
            </button>
          </div>
        )}
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(t) => t.id}
          verticalBorders
          emptyMessage={
            isFiltered ? (
              <ConsoleEmptyState icon={<SearchX className="h-6 w-6" />} title="No testimonials match" message="Try another search or status." onReset={() => set({ q: null, status: null, page: null })} />
            ) : (
              <ConsoleEmptyState
                icon={<MessageSquareQuote className="h-6 w-6" />}
                title="No testimonials yet"
                message="Add a quote from a real customer — it appears on the website once published."
                actionLabel="Add testimonial"
                actionIcon={<Plus className="h-4 w-4" />}
                onAction={() => setEditing("new")}
              />
            )
          }
        />
        {total > 0 && (
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={total}
            itemLabel={total === 1 ? "testimonial" : "testimonials"}
            onPageChange={(next) => set({ page: next })}
            onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
            pageSizeOptions={PAGE_SIZES}
          />
        )}
      </div>

      <TestimonialFormModal isOpen={editing !== null} testimonial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      <ConfirmModal
        isOpen={deleting !== null}
        title="Delete this testimonial?"
        message={deleting ? `"${deleting.name}" will be removed from the website.` : ""}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        confirmIcon={<Trash2 className="h-4 w-4" />}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const id = toast.loading("Deleting testimonial...", { description: deleting.name });
          try {
            await deleteTestimonial(deleting.id);
            toast.success("Testimonial deleted", { id, description: deleting.name });
            setDeleting(null);
          } catch (err) {
            toast.error("Couldn't delete the testimonial", { id, description: err instanceof Error ? err.message : "Please try again." });
          }
        }}
      />
    </motion.div>
  );
}

export default TestimonialsView;
