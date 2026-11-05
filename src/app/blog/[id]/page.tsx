"use client";

import React, { Suspense, use } from "react";
import { FileX } from "lucide-react";
import { useBlogPost } from "@/lib/blogStorage";
import { BlogEditor } from "@/components/console/blog/BlogEditor";
import { BlogEditorSkeleton } from "@/components/console/blog/BlogEditorSkeleton";
import { ConsoleEmptyState } from "@/components/console/shared/ConsoleEmptyState";

function EditPost({ id }: { id: string }) {
  const { post, error, loading, retry } = useBlogPost(id);
  if (loading) return <BlogEditorSkeleton />;
  if (!post)
    return (
      <div className="rounded-xl border border-dash bg-white p-10">
        <ConsoleEmptyState icon={<FileX className="h-6 w-6" />} title="Post not found" message={error ?? "It may have been deleted."} actionLabel="Try again" onAction={retry} />
      </div>
    );
  return <BlogEditor key={post.id} post={post} />;
}

/** Owner Console › Blog › Edit post (`?tab=preview` survives reloads). */
export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<BlogEditorSkeleton />}>
      <EditPost id={id} />
    </Suspense>
  );
}
