"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  description?: string;
  badge?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Trail after the home icon; renders the shared Breadcrumb above the title. */
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  subtitle,
  description,
  badge,
  children,
  action,
  className,
  breadcrumbs,
}: PageHeaderProps) {
  const effectiveSubtitle = subtitle || description;
  const effectiveActions = children || action;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full mb-5",
        className,
      )}
    >
      {/* Left: Title & Subtitle */}
      <div className="flex flex-col gap-1">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-1.5" />}
        <div className="flex items-center gap-2.5">
          <h1 className="h6-medium text-primary-500">{title}</h1>
          {badge}
        </div>
        {effectiveSubtitle && (
          <p className="body-sm-regular subtext-500">{effectiveSubtitle}</p>
        )}
      </div>

      {/* Right: Optional Action Button or Children */}
      {effectiveActions && (
        <div className="flex items-center gap-3 shrink-0">{effectiveActions}</div>
      )}
    </div>
  );
}

export default PageHeader;
