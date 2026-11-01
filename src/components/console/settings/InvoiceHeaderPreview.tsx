"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { EduProLogo } from "@/components/ui/EduProLogo";

export interface InvoiceHeaderPreviewProps {
  legalName: string;
  address: string;
  supportEmail: string;
  taxId: string;
  invoicePrefix: string;
  taxRate: number;
}

const SAMPLE_AMOUNT = 79;

/** Live mini-invoice showing how the company + billing settings print on a subscription invoice. */
export function InvoiceHeaderPreview({ legalName, address, supportEmail, taxId, invoicePrefix, taxRate }: InvoiceHeaderPreviewProps) {
  const year = new Date().getFullYear();
  const tax = Math.round(SAMPLE_AMOUNT * (Number(taxRate) || 0)) / 100;
  const money = (n: number) => `$${n.toFixed(2)}`;

  return (
    <SettingsCard title="Invoice preview" description="Updates as you type." icon={<Eye className="h-5 w-5" />} tone="purple" divided={false}>
      <motion.div layout className="overflow-hidden rounded-xl border border-dash bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-dash bg-gray-bg px-4 py-3">
          <div className="min-w-0">
            <EduProLogo size="sm" />
            <p className="mt-2 truncate body-xsm-medium text-primary-500" title={legalName}>
              {legalName || "Your legal name"}
            </p>
            <p className="line-clamp-2 body-2xsm-regular text-primary-300">{address || "Registered address"}</p>
            {taxId && <p className="truncate body-2xsm-regular text-primary-300">{taxId}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="body-xsm-medium text-primary-500">{`${invoicePrefix || "EDP"}-${year}-00128`}</p>
            <ToneBadge tone="green" size="sm" className="mt-1">
              Paid
            </ToneBadge>
          </div>
        </div>
        <div className="space-y-2 px-4 py-3 body-xsm-regular">
          <div className="flex justify-between gap-3">
            <span className="text-primary-400">Growth plan · Monthly</span>
            <span className="text-primary-500">{money(SAMPLE_AMOUNT)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-primary-400">Tax ({Number(taxRate) || 0}%)</span>
            <span className="text-primary-500">{money(tax)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-dash pt-2">
            <span className="body-xsm-medium text-primary-500">Total</span>
            <span className="body-xsm-medium text-primary-500">{money(SAMPLE_AMOUNT + tax)}</span>
          </div>
          <p className="truncate pt-1 body-2xsm-regular text-primary-300">Questions? {supportEmail || "billing@yourcompany.com"}</p>
        </div>
      </motion.div>
    </SettingsCard>
  );
}

export default InvoiceHeaderPreview;
