"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Save, StickyNote, X } from "lucide-react";
import { NOTES_MAX } from "@/validations/saasSchema";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { CardActionButton } from "@/components/ui/CardActionButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { CharCounter } from "@/components/ui/CharCounter";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

const schema = z.object({ notes: z.string().trim().max(NOTES_MAX, `${NOTES_MAX} characters or less`) });
type Values = z.infer<typeof schema>;

/** Owner-only internal notes with inline edit (react-hook-form + zod). */
export function NotesCard({ notes, onSave }: { notes: string; onSave: (notes: string) => Promise<unknown> }) {
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, reset, control, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { notes } });
  const value = useWatch({ control, name: "notes" }) ?? "";

  useEffect(() => {
    if (!editing) reset({ notes });
  }, [notes, editing, reset]);

  const submit = handleSubmit(async (v) => {
    try {
      await onSave(v.notes);
      setEditing(false);
    } catch {
      /* toast shown */
    }
  });

  return (
    <IconSectionCard
      icon={<StickyNote className="h-5 w-5" />}
      tone="yellow"
      title="Internal notes"
      description="Only platform owners see these."
      action={
        !editing ? (
          <CardActionButton icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
            Edit
          </CardActionButton>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.form key="edit" onSubmit={submit} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="space-y-2">
            <TextAreaField id="detail-notes" aria-label="Internal notes" rows={5} autoFocus placeholder="Contract details, contacts, follow-ups…" error={formState.errors.notes?.message} {...register("notes")} />
            <div className="flex items-center justify-between gap-3">
              <CharCounter count={value.length} max={NOTES_MAX} />
              <div className="flex gap-2">
                <SecondaryButton size="sm" leftIcon={<X className="h-4 w-4" />} disabled={formState.isSubmitting} onClick={() => setEditing(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton size="sm" type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={formState.isSubmitting} disabled={formState.isSubmitting || !formState.isDirty}>
                  {formState.isSubmitting ? "Saving..." : "Save notes"}
                </PrimaryButton>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div key="view" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            {notes ? (
              <p className="whitespace-pre-wrap break-words body-sm-regular text-primary-400">{notes}</p>
            ) : (
              <p className="rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-6 text-center body-sm-regular text-primary-300">No notes yet — add contract details or follow-ups.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </IconSectionCard>
  );
}

export default NotesCard;
