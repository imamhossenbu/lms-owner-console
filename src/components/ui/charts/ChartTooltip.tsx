import React from "react";

/** Small white tooltip box used by every analytics chart. */
export function ChartTooltip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dash bg-white px-3.5 py-2.5 text-left shadow-md">
      <p className="mb-1 body-2xsm-regular text-primary-300">{title}</p>
      <div className="body-xsm-medium text-primary-500">{children}</div>
    </div>
  );
}

export default ChartTooltip;
