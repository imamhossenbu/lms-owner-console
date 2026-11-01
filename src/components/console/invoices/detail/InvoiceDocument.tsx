"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Institution, Plan, SaasInvoice } from "@/types/saas";
import type { CompanySettings } from "@/validations/consoleSettingsSchema";
import { EduProLogo } from "@/components/ui/EduProLogo";
import { DataTable, type ColumnDef } from "@/components/ui/Datatable";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { INVOICE_STATUS_META, tenantHost } from "@/components/console/shared/consoleMeta";
import { formatDate, formatMoney, formatPeriod, invoiceLineLabel, taxPercent } from "../invoiceUtils";

interface InvoiceDocumentProps {
  invoice: SaasInvoice;
  institution: Institution | undefined;
  plan: Plan | undefined;
  company: CompanySettings;
  footer?: string;
}

interface Line {
  id: string;
  description: string;
  period: string;
  qty: number;
  amount: number;
}

const money = (n: number) => formatMoney(n, { cents: true });

/** On-screen invoice document: company header, bill-to, line items, tax, total and a status stamp. */
export function InvoiceDocument({ invoice, institution, plan, company, footer }: InvoiceDocumentProps) {
  const status = INVOICE_STATUS_META[invoice.status];
  const lines: Line[] = [
    { id: "plan", description: invoiceLineLabel(invoice, plan), period: formatPeriod(invoice.periodStart, invoice.periodEnd), qty: 1, amount: invoice.amount },
  ];
  const columns: ColumnDef<Line>[] = [
    {
      key: "description",
      header: "Description",
      width: "46%",
      render: (row) => (
        <span className="block truncate body-sm-medium text-primary-500" title={row.description}>
          {row.description}
        </span>
      ),
    },
    { key: "period", header: "Period", width: "28%", render: (row) => <span className="block truncate body-sm-regular text-primary-500">{row.period}</span> },
    { key: "qty", header: "Qty", width: "8%", align: "center", render: (row) => row.qty },
    { key: "amount", header: "Amount", width: "18%", align: "right", render: (row) => <span className="body-sm-medium text-primary-500">{money(row.amount)}</span> },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-dash bg-white p-6 shadow-xs sm:p-8"
    >
      <div className="pointer-events-none absolute right-6 top-24 rotate-[-8deg] sm:right-10">
        <ToneBadge tone={status.tone} size="lg" className="border-2 px-4 tracking-widest uppercase">
          {status.label}
        </ToneBadge>
      </div>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-sm">
          <EduProLogo size="md" />
          <p className="mt-3 body-sm-medium text-primary-500">{company.legalName}</p>
          <p className="whitespace-pre-line body-xsm-regular text-primary-300">{company.address}</p>
          {company.taxId && <p className="body-xsm-regular text-primary-300">{company.taxId}</p>}
          <p className="body-xsm-regular text-primary-300">{company.supportEmail}</p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="heading-h4 tracking-tight text-primary-500">INVOICE</p>
          <p className="mt-1 font-mono body-sm-medium text-primary-500">{invoice.number}</p>
          <dl className="mt-3 space-y-0.5 body-xsm-regular">
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-primary-300">Issued</dt>
              <dd className="text-primary-500">{formatDate(invoice.issuedAt)}</dd>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-primary-300">Due</dt>
              <dd className="text-primary-500">{formatDate(invoice.dueAt)}</dd>
            </div>
            {invoice.paidAt && (
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-primary-300">Paid</dt>
                <dd className="text-primary-500">{formatDate(invoice.paidAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 rounded-xl border border-dash bg-gray-bg p-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="body-xsm-medium text-primary-300">Bill to</p>
          {institution ? (
            <>
              <p className="mt-1 truncate body-sm-medium text-primary-500">{institution.name}</p>
              <p className="truncate body-xsm-regular text-primary-400">{institution.ownerName}</p>
              <p className="truncate body-xsm-regular text-primary-400">{institution.ownerEmail}</p>
              <p className="truncate body-xsm-regular text-primary-300">
                {institution.customDomain?.status === "VERIFIED" ? institution.customDomain.domain : tenantHost(institution.slug)} · {institution.country}
              </p>
            </>
          ) : (
            <p className="mt-1 body-sm-regular text-primary-300">Unknown institution</p>
          )}
        </div>
        <div className="min-w-0 sm:text-right">
          <p className="body-xsm-medium text-primary-300">Subscription</p>
          <p className="mt-1 body-sm-medium text-primary-500">
            {plan?.name ?? invoice.planId} · {invoice.cycle === "YEARLY" ? "Yearly" : "Monthly"}
          </p>
          <p className="body-xsm-regular text-primary-400">{formatPeriod(invoice.periodStart, invoice.periodEnd)}</p>
          {institution?.subscription.paymentMethod && (
            <p className="body-xsm-regular text-primary-300">
              {institution.subscription.paymentMethod.brand} •••• {institution.subscription.paymentMethod.last4}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={lines}
          rowKey={(row) => row.id}
          verticalBorders
          tableClassName="table-fixed"
          containerClassName="rounded-lg overflow-x-hidden"
          headerClassName="bg-slate-50 border-b border-dash"
          thClassName="px-3.5 py-3 body-xsm-medium text-primary-400 font-semibold! normal-case"
          cellClassName="px-3.5 py-3"
        />
      </div>

      <dl className="ml-auto mt-4 w-full max-w-xs space-y-2 body-sm-regular">
        <div className="flex justify-between gap-3">
          <dt className="text-primary-400">Subtotal</dt>
          <dd className="text-primary-500">{money(invoice.amount)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-primary-400">Tax ({taxPercent(invoice)}%)</dt>
          <dd className="text-primary-500">{money(invoice.tax)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-dash pt-2">
          <dt className="body-medium text-primary-500">Total (USD)</dt>
          <dd className="body-medium text-primary-500">{money(invoice.total)}</dd>
        </div>
        {invoice.status === "REFUNDED" && (
          <div className="flex justify-between gap-3">
            <dt className="text-purple">Refunded</dt>
            <dd className="text-purple">−{money(invoice.total)}</dd>
          </div>
        )}
      </dl>

      {footer && <p className="mt-8 border-t border-dash pt-4 body-xsm-regular text-primary-300">{footer}</p>}
    </motion.article>
  );
}

export default InvoiceDocument;
