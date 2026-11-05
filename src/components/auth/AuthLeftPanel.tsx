import React from "react";
import { EduProLogo } from "@/components/ui/EduProLogo";
import { WEBSITE_URL } from "@/lib/website";
import { AuthFeature, AuthFeatureList } from "./AuthFeatureList";

/** Alpha mask that fades the mockup image in from the left (black = fully visible). */
const MOCKUP_FADE_MASK =
  "linear-gradient(to right, transparent 0%, color-mix(in srgb, black 5%, transparent) 15%, color-mix(in srgb, black 50%, transparent) 38%, black 65%)";

interface AuthLeftPanelProps {
  title: React.ReactNode;
  description: React.ReactNode;
  features: AuthFeature[];
  mockupSrc: string;
  mockupAlt: string;
  /** Line under the EduPro logo (default "LMS Admin Panel"). */
  brandSubtitle?: string;
  topBadge?: React.ReactNode;
  footerTagline?: string;
}

export function AuthLeftPanel({
  title,
  description,
  features,
  mockupSrc,
  mockupAlt,
  brandSubtitle = "LMS Admin Panel",
  topBadge,
  footerTagline = "A modern LMS for a brighter future",
}: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex w-full lg:w-[54%] xl:w-[55%] bg-gradient-to-b from-brand-card via-brand-surface to-brand-navy text-white relative flex-col justify-between overflow-hidden select-none min-h-195 xl:min-h-205">
      {/* Ambient Lighting Behind Mockup */}
      <div className="absolute top-35 right-0 w-115 h-115 rounded-full bg-brand-orange-20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-87.5 h-87.5 rounded-full bg-brand-card/60 blur-[90px] pointer-events-none" />

      {/* Right-Flush Large 3D Mockup Image with Gradual Soft Mask */}
      <div
        className="absolute right-0 inset-y-0 h-full w-[56%] xl:w-[60%] pointer-events-none select-none overflow-hidden z-0"
        style={{
          WebkitMaskImage: MOCKUP_FADE_MASK,
          maskImage: MOCKUP_FADE_MASK,
        }}
      >
        <img
          src={mockupSrc}
          alt={mockupAlt}
          className="h-full w-full object-cover object-right-bottom"
        />
      </div>

      {/* Top Brand Header Row */}
      <div className="relative z-10 flex items-center justify-between p-7 sm:p-10 lg:pl-12 xl:pl-14 lg:pr-8 xl:pr-10 lg:pt-12 xl:pt-14 pb-0">
        <EduProLogo href={WEBSITE_URL} variant="light" size="md" subtitle={brandSubtitle} />
        {topBadge}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 my-auto p-7 sm:p-10 lg:pl-12 xl:pl-14 lg:pr-4 xl:pr-4 py-6 max-w-full lg:max-w-100 xl:max-w-112.5">
        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="heading-display-h1 text-white tracking-tight">
            {title}
          </h1>
          <p className="body-regular text-white/75 mt-3">
            {description}
          </p>
        </div>

        {/* Feature Items List */}
        <AuthFeatureList features={features} className="space-y-4 pt-6" />
      </div>

      {/* Bottom Footnote */}
      <div className="relative z-10 p-7 sm:p-10 lg:pl-12 xl:pl-14 lg:pb-12 xl:pb-14 pt-0 flex items-center gap-2 body-xsm-regular text-white/60">
        <span className="w-4 h-0.5 bg-brand-orange rounded-full inline-block" />
        <span>{footerTagline}</span>
      </div>
    </div>
  );
}
