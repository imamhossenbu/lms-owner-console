import React from "react";
import { EduProLogo } from "@/components/ui/EduProLogo";

interface AuthRightPanelProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  copyrightText?: string | null;
  topRightAction?: React.ReactNode;
  /** Line under the EduPro logo (default "LMS Admin Panel"; the Owner Console passes "Owner Console"). */
  brandSubtitle?: string;
}

export function AuthRightPanel({
  title,
  subtitle,
  children,
  copyrightText = null,
  topRightAction = null,
  brandSubtitle = "LMS Admin Panel",
}: AuthRightPanelProps) {
  return (
    <div className="w-full lg:w-[46%] xl:w-[45%] bg-white p-7 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-y-auto">
      {topRightAction && (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          {topRightAction}
        </div>
      )}

      {/* Centered Form Area with Substantial Width */}
      <div className="max-w-115 lg:max-w-120 xl:max-w-125 w-full mx-auto py-6 sm:py-8">
        {/* Brand Header */}
        <div className="mb-7 sm:mb-8">
          <EduProLogo
            variant="orange"
            size="lg"
            subtitle={brandSubtitle}
            className="mb-5 sm:mb-6"
          />

          <h2 className="heading-h2-bold text-primary-500 tracking-tight">
            {title}
          </h2>
          <div className="body-regular subtext-500 mt-2.5">
            {subtitle}
          </div>
        </div>

        {/* Content Body / Form */}
        {children}
      </div>

      {/* Bottom Copyright (Only if explicitly passed) */}
      {copyrightText && (
        <div className="text-center body-xsm-regular subtext-500 pt-3">
          {copyrightText}
        </div>
      )}
    </div>
  );
}
