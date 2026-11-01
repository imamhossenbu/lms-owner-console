"use client";

import React, { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Activity, Send } from "lucide-react";
import type { Institution, SaasEvent, SaasEventType } from "@/types/saas";
import { addNote } from "@/lib/saasStorage";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { AppSelect } from "@/components/ui/AppSelect";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useUrlParams } from "@/lib/useUrlParams";
import { EventTimeline } from "../../../shared/EventTimeline";
import { errorMessage } from "../../../shared/consoleMeta";

const GROUPS: { value: string; label: string; types: SaasEventType[] | null }[] = [
  { value: "All", label: "All events", types: null },
  { value: "billing", label: "Payments", types: ["PAYMENT_SUCCEEDED", "PAYMENT_FAILED"] },
  { value: "plan", label: "Plan & trial", types: ["TRIAL_STARTED", "TRIAL_CONVERTED", "TRIAL_EXPIRED", "PLAN_UPGRADED", "PLAN_DOWNGRADED", "CYCLE_CHANGED"] },
  { value: "account", label: "Account", types: ["SIGNED_UP", "CANCELLED", "REACTIVATED", "SUSPENDED"] },
  { value: "domain", label: "Domains", types: ["DOMAIN_ADDED", "DOMAIN_VERIFIED"] },
  { value: "notes", label: "Notes", types: ["NOTE"] },
];

const noteSchema = z.object({ note: z.string().trim().min(2, "Write a note first").max(1000, "1,000 characters or less") });
type NoteValues = z.infer<typeof noteSchema>;

/** Institution timeline (filter in ?events=) with a quick "add note" composer. */
export function ActivityTab({ institution: inst, events, now }: { institution: Institution; events: SaasEvent[]; now: number }) {
  const { get, set } = useUrlParams();
  const group = GROUPS.find((g) => g.value === get("events")) ?? GROUPS[0]!;
  const rows = useMemo(
    () => events.filter((e) => e.institutionId === inst.id && (!group.types || group.types.includes(e.type))).sort((a, b) => b.at.localeCompare(a.at)),
    [events, inst.id, group]
  );
  const { register, handleSubmit, reset, control, formState } = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { note: "" } });
  const note = useWatch({ control, name: "note" }) ?? "";

  const submit = handleSubmit(async (v) => {
    const id = toast.loading("Adding note...", { description: inst.name });
    try {
      await addNote(inst.id, v.note);
      toast.success("Note added", { id, description: "It's now on the activity timeline." });
      reset({ note: "" });
    } catch (e) {
      toast.error("Couldn't add the note", { id, description: errorMessage(e) });
    }
  });

  return (
    <IconSectionCard
      icon={<Activity className="h-5 w-5" />}
      tone="green"
      title="Activity"
      description={`${rows.length} event${rows.length === 1 ? "" : "s"}`}
      action={<AppSelect size="sm" value={group.value} onValueChange={(v) => set({ events: v })} options={GROUPS.map((g) => ({ value: g.value, label: g.label }))} />}
    >
      <form onSubmit={submit} className="mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextAreaField id="activity-note" aria-label="Add a note" rows={2} placeholder="Add an internal note to the timeline…" error={formState.errors.note?.message} {...register("note")} />
        </div>
        <PrimaryButton type="submit" leftIcon={<Send className="h-4 w-4" />} isLoading={formState.isSubmitting} disabled={formState.isSubmitting || note.trim().length < 2}>
          {formState.isSubmitting ? "Adding..." : "Add note"}
        </PrimaryButton>
      </form>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dash bg-gray-bg px-4 py-8 text-center body-sm-regular text-primary-300">No {group.value === "All" ? "" : `${group.label.toLowerCase()} `}events yet.</p>
      ) : (
        <EventTimeline events={rows} groupByDay now={now} />
      )}
    </IconSectionCard>
  );
}

export default ActivityTab;
