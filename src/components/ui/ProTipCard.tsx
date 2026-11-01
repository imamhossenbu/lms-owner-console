import React from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ProTipCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Orange "Pro Tip" hint box used in side panels (lesson editor, course steps). */
export function ProTipCard({ title = "Pro Tip", children, className }: ProTipCardProps) {
  return (
    <aside className={cn("flex items-start gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange-light p-4", className)}>
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
      <div className="min-w-0">
        <p className="body-sm-medium text-brand-orange">{title}</p>
        <div className="mt-1 body-xsm-regular text-primary-400">{children}</div>
      </div>
    </aside>
  );
}

export default ProTipCard;
