import React from "react";

/** The editor's shape while a post loads: header, title / slug / summary inputs, the article box and sidebar cards. */
export function BlogEditorSkeleton() {
  const input = <div className="space-y-2"><div className="h-3 w-20 rounded bg-slate-200" /><div className="h-11 rounded-lg border border-dash bg-slate-100" /></div>;
  return (
    <div className="space-y-5 pb-8 animate-pulse" aria-busy="true" aria-label="Loading post">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-7 w-44 rounded bg-slate-200" />
          <div className="h-3.5 w-64 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-40 rounded-xl bg-slate-200" />
      </div>
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <div className="space-y-4 rounded-xl border border-dash bg-white p-5">
            {input}
            {input}
            <div className="space-y-2"><div className="h-3 w-20 rounded bg-slate-200" /><div className="h-20 rounded-lg border border-dash bg-slate-100" /></div>
          </div>
          <div className="space-y-3 rounded-xl border border-dash bg-white p-5">
            <div className="flex justify-between"><div className="h-5 w-24 rounded bg-slate-200" /><div className="h-10 w-48 rounded-full bg-slate-100" /></div>
            <div className="h-10 rounded-t-lg bg-slate-100" />
            <div className="h-96 rounded-b-lg border border-dash bg-slate-50" />
          </div>
        </div>
        <div className="space-y-5 xl:col-span-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-dash bg-white p-5">
              <div className="h-5 w-28 rounded bg-slate-200" />
              {i === 1 ? <div className="aspect-video rounded-lg bg-slate-100" /> : null}
              <div className="h-11 rounded-lg border border-dash bg-slate-100" />
              <div className="h-11 rounded-lg border border-dash bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogEditorSkeleton;
