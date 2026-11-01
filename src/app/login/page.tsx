"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { BarChart3, Building2, CreditCard, Globe } from "lucide-react";
import { AuthCardContainer } from "@/components/auth/AuthCardContainer";
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel";
import { AuthRightPanel } from "@/components/auth/AuthRightPanel";
import type { AuthFeature } from "@/components/auth/AuthFeatureList";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { FieldSkeleton } from "@/components/console/shared/ConsoleSkeletonParts";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConsoleLoginForm } from "@/components/console/login/ConsoleLoginForm";

const FEATURES: AuthFeature[] = [
  { icon: Building2, title: "Every institution", description: "Schools, coaching centres and companies in one place" },
  { icon: CreditCard, title: "Subscriptions & billing", description: "Plans, trials, invoices and dunning" },
  { icon: BarChart3, title: "Revenue metrics", description: "MRR, churn and trial conversion at a glance" },
  { icon: Globe, title: "Domains", description: "Subdomains and custom domains with SSL" },
];

function LoginFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <FieldSkeleton />
      <FieldSkeleton />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-13 w-full rounded-xl" />
    </div>
  );
}

/** /console/login — platform owner sign-in (no console shell). */
export default function ConsoleLoginPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      <AuthCardContainer>
        <AuthLeftPanel
          title={
            <>
              Run the
              <br />
              whole platform.
              <br />
              <span className="text-brand-orange">One console.</span>
            </>
          }
          description="Manage every institution, plan, invoice and domain on EduPro."
          features={FEATURES}
          mockupSrc="/images/edupro_mockup_clean_flush.png"
          mockupAlt="EduPro Owner Console preview"
          footerTagline="EduPro Owner Console — for platform administrators only"
          topBadge={
            <ToneBadge tone="orange" variant="pill" size="sm">
              Owner Console
            </ToneBadge>
          }
        />
        <AuthRightPanel title="Owner sign-in" subtitle="Sign in with your platform owner account to manage institutions and billing.">
          <Suspense fallback={<LoginFormSkeleton />}>
            <ConsoleLoginForm />
          </Suspense>
        </AuthRightPanel>
      </AuthCardContainer>
    </motion.div>
  );
}
