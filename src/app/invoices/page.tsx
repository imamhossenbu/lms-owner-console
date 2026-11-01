"use client";

import React, { Suspense } from "react";
import { InvoicesView } from "@/components/console/invoices/InvoicesView";
import { InvoicesSkeleton } from "@/components/console/invoices/InvoicesSkeleton";

/** Owner Console › Invoices (`?q=`, `?status=`, `?plan=`, `?from=`/`?to=`, `?sort=`, `?page=` survive reloads). */
export default function ConsoleInvoicesPage() {
  return (
    <Suspense fallback={<InvoicesSkeleton />}>
      <InvoicesView />
    </Suspense>
  );
}
