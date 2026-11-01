"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";

interface RetryScheduleChipsProps {
  value: number[];
  onChange: (days: number[]) => void;
  error?: string;
  max?: number;
}

/** Editable "Day 1 · Day 3 · Day 7" chips for failed-payment retries (sorted, unique, 1–30). */
export function RetryScheduleChips({ value, onChange, error, max = 6 }: RetryScheduleChipsProps) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const add = () => {
    const day = Number(draft);
    if (!Number.isInteger(day) || day < 1 || day > 30) return setDraftError("Enter a whole day between 1 and 30.");
    if (value.includes(day)) return setDraftError(`Day ${day} is already scheduled.`);
    if (value.length >= max) return setDraftError(`At most ${max} retries.`);
    onChange([...value, day].sort((a, b) => a - b));
    setDraft("");
    setDraftError(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        <AnimatePresence initial={false}>
          {value.map((day) => (
            <motion.span
              key={day}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.16 }}
              className="inline-flex shrink-0"
            >
              <ToneBadge tone="orange" variant="pill" className="pr-1">
                Day {day}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onChange(value.filter((d) => d !== day))}
                  aria-label={`Remove day ${day} retry`}
                  className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-brand-orange/10"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </ToneBadge>
            </motion.span>
          ))}
        </AnimatePresence>
        {value.length === 0 && <span className="body-xsm-regular text-primary-300">No retries scheduled.</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={30}
          value={draft}
          aria-label="Retry day"
          placeholder="Day"
          onChange={(e) => {
            setDraft(e.target.value);
            setDraftError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className={cn(
            "h-8.5 w-24 rounded-lg border bg-white px-3 body-sm-regular text-primary-500 outline-none placeholder:text-primary-300 focus:border-brand-orange",
            draftError ? "border-red" : "border-dash"
          )}
        />
        <CardActionButton icon={<Plus />} onClick={add} disabled={value.length >= max}>
          Add retry
        </CardActionButton>
      </div>
      {(draftError || error) && <p className="body-xsm-regular text-red">{draftError ?? error}</p>}
    </div>
  );
}

export default RetryScheduleChips;
