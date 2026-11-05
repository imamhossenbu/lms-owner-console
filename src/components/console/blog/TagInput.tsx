"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FieldLabel } from "@/components/ui/FieldLabel";

/** Tags as removable chips; Enter or comma adds one (max 8, no duplicates). */
export function TagInput({ id, value, onChange, error }: { id: string; value: string[]; onChange: (tags: string[]) => void; error?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().replace(/,$/, "").slice(0, 30);
    if (t && !value.includes(t) && value.length < 8) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <FieldLabel htmlFor={id} label="Tags" />
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-dash bg-white px-2 py-1.5 focus-within:border-brand-orange">
        <AnimatePresence initial={false}>
          {value.map((t) => (
            <motion.span
              key={t}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-brand-orange-light px-2 py-1 body-xsm-medium text-brand-orange"
            >
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="rounded hover:text-brand-orange-hover">
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            if (e.target.value.endsWith(",")) add();
            else setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length >= 8 ? "8 tags max" : "Type and press Enter"}
          disabled={value.length >= 8}
          className="min-w-28 flex-1 bg-transparent px-1 py-1 body-sm-regular text-primary-500 outline-none placeholder:text-primary-300"
        />
      </div>
      {error && <p className="mt-1 body-xsm-regular text-red">{error}</p>}
    </div>
  );
}

export default TagInput;
