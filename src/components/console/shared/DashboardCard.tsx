import React from "react";
import { cn } from "@/lib/cn";

export interface DashboardCardProps {
  title: string;
  description?: React.ReactNode;
  /** Right side of the header: "View all" link, select, badge… */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Overview card — the panel dashboard's chart/table card: white, p-5, heading-h5 title + muted subtitle, action on the right. */
export function DashboardCard({ title, description, action, children, className, bodyClassName }: DashboardCardProps) {
  return (
    <section className={cn("bg-white rounded-xl border border-dash p-5 shadow-xs flex flex-col text-left", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="heading-h5 text-primary-500">{title}</h3>
          {description && <p className="body-sm-regular text-primary-300 mt-0.5 truncate">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("flex-1 min-h-0", bodyClassName)}>{children}</div>
    </section>
  );
}

export default DashboardCard;
