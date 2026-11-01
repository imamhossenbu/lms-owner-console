"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { SAAS_CNAME_TARGET, SAAS_ROOT_DOMAIN } from "@/types/saas";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToneBadge } from "@/components/ui/ToneBadge";

const STEPS = [
  { title: "Institution adds its domain", body: "From Settings › Domain on a Pro or Enterprise plan (or you add it here for them)." },
  { title: "They create two DNS records", body: "A CNAME pointing the domain at EduPro, and a TXT record proving ownership." },
  { title: "EduPro verifies & issues SSL", body: "Checks run automatically every hour; you can force a check with Verify." },
];

const RECORDS = [
  { type: "CNAME", host: "learn.yourschool.com", value: SAAS_CNAME_TARGET },
  { type: "TXT", host: "_edupro-verify.learn.yourschool.com", value: "edupro-verify=<token>" },
];

/** "How custom domains work" explainer with the exact DNS records institutions need. */
export function DomainHelpCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
      className="dashboard-card shadow-2xs p-5"
    >
      <header className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-14 text-blue">
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="body-md-medium font-semibold! text-primary-500">How custom domains work</h3>
          <p className="mt-0.5 body-sm-regular text-primary-300">Every institution also keeps its free {`<slug>.${SAAS_ROOT_DOMAIN}`} address.</p>
        </div>
      </header>

      <ol className="mt-5 space-y-3.5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange-light body-xsm-medium text-brand-orange">{i + 1}</span>
            <div className="min-w-0">
              <p className="body-sm-medium text-primary-500">{step.title}</p>
              <p className="body-xsm-regular text-primary-300">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 space-y-2.5">
        <p className="body-xsm-medium text-primary-400">DNS records</p>
        {RECORDS.map((r) => (
          <div key={r.type} className="rounded-xl border border-dash bg-gray-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <ToneBadge tone={r.type === "CNAME" ? "blue" : "purple"} size="sm">
                {r.type}
              </ToneBadge>
              <CopyButton value={r.value} label={`${r.type} value copied`} />
            </div>
            <p className="mt-2 truncate font-mono body-xsm-regular text-primary-300" title={r.host}>
              {r.host}
            </p>
            <p className="truncate font-mono body-xsm-medium text-primary-500" title={r.value}>
              → {r.value}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default DomainHelpCard;
