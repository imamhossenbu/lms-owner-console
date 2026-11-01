"use client";

import React from "react";
import { useParams } from "next/navigation";
import { InvoiceDetailView } from "@/components/console/invoices/detail/InvoiceDetailView";

/** Owner Console › Invoices › invoice detail. */
export default function ConsoleInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  return <InvoiceDetailView invoiceId={params.id} />;
}
