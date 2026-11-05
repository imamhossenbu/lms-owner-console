"use client";

import React, { Suspense } from "react";
import { BlogEditor } from "@/components/console/blog/BlogEditor";
import { BlogEditorSkeleton } from "@/components/console/blog/BlogEditorSkeleton";

/** Owner Console › Blog › New post (`?tab=preview` survives reloads). */
export default function NewBlogPostPage() {
  return (
    <Suspense fallback={<BlogEditorSkeleton />}>
      <BlogEditor post={null} />
    </Suspense>
  );
}
