import React from "react";
import { BarChart3 } from "lucide-react";

/** In-card empty state for a chart with no data yet. */
export function ChartEmpty({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-dash bg-gray-bg px-4 text-center">
      <BarChart3 className="h-7 w-7 text-primary-300" />
      <p className="mt-2 body-sm-medium text-primary-500">{title}</p>
      <p className="mt-0.5 max-w-xs body-xsm-regular text-primary-300">{message}</p>
    </div>
  );
}

export default ChartEmpty;
