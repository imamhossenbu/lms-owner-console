"use client";

import React, { Suspense } from "react";
import { BlogView } from "@/components/console/blog/BlogView";
import { BlogSkeleton } from "@/components/console/blog/BlogSkeleton";

/** Owner Console › Blog for the marketing website (`?q`, `?status`, `?category`, `?page`, `?size` survive reloads). */
export default function ConsoleBlogPage() {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogView />
    </Suspense>
  );
}
