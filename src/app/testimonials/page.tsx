"use client";

import React, { Suspense } from "react";
import { TestimonialsView } from "@/components/console/testimonials/TestimonialsView";
import { TestimonialsSkeleton } from "@/components/console/testimonials/TestimonialsSkeleton";

/** Owner Console › Testimonials for the marketing website (`?q`, `?status`, `?page`, `?size` survive reloads). */
export default function ConsoleTestimonialsPage() {
  return (
    <Suspense fallback={<TestimonialsSkeleton />}>
      <TestimonialsView />
    </Suspense>
  );
}
