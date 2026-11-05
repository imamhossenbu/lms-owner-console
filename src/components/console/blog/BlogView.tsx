"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Eye, EyeOff, Newspaper, Pencil, Plus, SearchX, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUrlParams } from "@/lib/useUrlParams";
import { WEBSITE_POST_URL, deleteBlogPost, updateBlogPost, useBlogPostsPage, type BlogPost } from "@/lib/blogStorage";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { RowMoreMenu } from "@/components/ui/RowMoreMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { ConsoleEmptyState } from "@/components/console/shared/ConsoleEmptyState";
import { BlogSkeleton } from "./BlogSkeleton";
import { CATEGORY_SUGGESTIONS } from "./blogSchema";

const PAGE_SIZES = [10, 20, 50];
const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];
const CATEGORY_OPTIONS = [{ value: "All", label: "All categories" }, ...CATEGORY_SUGGESTIONS.map((c) => ({ value: c, label: c }))];
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** /blog — posts on the marketing website: search, status + category filters, write / edit / publish / feature / delete. */
export function BlogView() {
  const router = useRouter();
  const { get, getPage, set } = useUrlParams();
  const query = get("q");
  const status = get("status", "All");
  const category = get("category", "All");
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;
  const page = getPage();
  const { rows, total, isLoading, error, retry } = useBlogPostsPage({ q: query.trim(), status, category }, page, pageSize);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  if (isLoading) return <BlogSkeleton />;

  const toggle = async (p: BlogPost, patch: Partial<BlogPost>, pending: string, done: string) => {
    const id = toast.loading(pending, { description: p.title });
    try {
      await updateBlogPost(p.id, patch);
      toast.success(done, { id, description: p.title });
    } catch (err) {
      toast.error("Couldn't update the post", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      key: "post",
      header: "Post",
      width: "40%",
      render: (p) => (
        <button type="button" onClick={() => router.push(`/blog/${p.id}`)} className="flex min-w-0 items-center gap-3 text-left">
          {p.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- any https host
            <img src={p.coverUrl} alt="" className="h-11 w-16 shrink-0 rounded-lg border border-dash object-cover" />
          ) : (
            <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-brand-orange">
              <Newspaper className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0">
            <span className="body-sm-medium block truncate text-primary-500 hover:text-brand-orange">{p.title}</span>
            <span className="body-2xsm-regular block truncate text-primary-300">/blog/{p.slug}</span>
          </span>
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "150px",
      align: "center",
      render: (p) => (
        <ToneBadge tone="blue" size="sm">
          {p.category}
        </ToneBadge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "170px",
      align: "center",
      render: (p) => (
        <div className="flex items-center justify-center gap-1.5">
          <ToneBadge tone={p.isPublished ? "green" : "gray"} size="sm">
            {p.isPublished ? "Published" : "Draft"}
          </ToneBadge>
          {p.featured && (
            <ToneBadge tone="orange" size="sm">
              Featured
            </ToneBadge>
          )}
        </div>
      ),
    },
    { key: "read", header: "Read time", width: "110px", align: "center", render: (p) => <span className="body-sm-regular text-primary-400">{p.readMinutes} min</span> },
    { key: "updated", header: "Updated", width: "130px", align: "center", render: (p) => <span className="body-sm-regular whitespace-nowrap text-primary-400">{fmt(p.updatedAt)}</span> },
    {
      key: "actions",
      header: "",
      width: "60px",
      align: "center",
      render: (p) => (
        <RowMoreMenu
          label={`Actions for ${p.title}`}
          items={[
            { key: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => router.push(`/blog/${p.id}`) },
            ...(p.isPublished ? [{ key: "view", label: "View on website", icon: <ExternalLink className="h-4 w-4" />, onClick: () => window.open(WEBSITE_POST_URL(p.slug), "_blank", "noopener") }] : []),
            p.isPublished
              ? { key: "unpublish", label: "Unpublish", icon: <EyeOff className="h-4 w-4" />, onClick: () => void toggle(p, { isPublished: false }, "Unpublishing...", "Hidden from the website") }
              : { key: "publish", label: "Publish", icon: <Eye className="h-4 w-4" />, onClick: () => void toggle(p, { isPublished: true }, "Publishing...", "Live on the website") },
            { key: "feature", label: p.featured ? "Remove from featured" : "Feature on /blog", icon: <Star className="h-4 w-4" />, onClick: () => void toggle(p, { featured: !p.featured }, "Saving...", p.featured ? "No longer featured" : "Featured at the top of the blog") },
            { key: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, danger: true, separatorBefore: true, onClick: () => setDeleting(p) },
          ]}
        />
      ),
    },
  ];

  const isFiltered = !!query || status !== "All" || category !== "All";
  const reset = () => set({ q: null, status: null, category: null, page: null });
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Blog" }]}
        title="Blog"
        subtitle="Articles on the marketing website's /blog. Drafts stay private until you publish them."
        actions={
          <PrimaryButton size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/blog/new")}>
            Write a post
          </PrimaryButton>
        }
      />
      <div className="space-y-4 rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <ListFilters
          query={query}
          searchPlaceholder="Search title, summary or category..."
          onQueryChange={(q) => set({ q: q || null, page: null })}
          selects={[
            { key: "status", value: status, options: STATUS_OPTIONS, onChange: (v) => set({ status: v === "All" ? null : v, page: null }), className: "xl:w-44" },
            { key: "category", value: category, options: CATEGORY_OPTIONS, onChange: (v) => set({ category: v === "All" ? null : v, page: null }), className: "xl:w-48" },
          ]}
          onReset={reset}
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
          rowKey={(p) => p.id}
          verticalBorders
          emptyMessage={
            isFiltered ? (
              <ConsoleEmptyState icon={<SearchX className="h-6 w-6" />} title="No posts match" message="Try another search, status or category." onReset={reset} />
            ) : (
              <ConsoleEmptyState
                icon={<Newspaper className="h-6 w-6" />}
                title="No posts yet"
                message="Write your first article — it appears on the website's blog once published."
                actionLabel="Write a post"
                actionIcon={<Plus className="h-4 w-4" />}
                onAction={() => router.push("/blog/new")}
              />
            )
          }
        />
        {total > 0 && (
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalCount={total}
            itemLabel={total === 1 ? "post" : "posts"}
            onPageChange={(next) => set({ page: next })}
            onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
            pageSizeOptions={PAGE_SIZES}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={deleting !== null}
        title="Delete this post?"
        message={deleting ? `"${deleting.title}" will be removed from the website. This can't be undone.` : ""}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        confirmIcon={<Trash2 className="h-4 w-4" />}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const id = toast.loading("Deleting post...", { description: deleting.title });
          try {
            await deleteBlogPost(deleting.id);
            toast.success("Post deleted", { id, description: deleting.title });
            setDeleting(null);
          } catch (err) {
            toast.error("Couldn't delete the post", { id, description: err instanceof Error ? err.message : "Please try again." });
          }
        }}
      />
    </motion.div>
  );
}

export default BlogView;
