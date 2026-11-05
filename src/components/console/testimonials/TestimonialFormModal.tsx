"use client";

import React, { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "@/components/ui/ModalShell";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { CharCounter } from "@/components/ui/CharCounter";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { createTestimonial, updateTestimonial, type Testimonial } from "@/lib/testimonialStorage";
import { EMPTY_TESTIMONIAL, testimonialSchema, type TestimonialFormValues } from "./testimonialSchema";

interface TestimonialFormModalProps {
  isOpen: boolean;
  /** null = create. */
  testimonial: Testimonial | null;
  onClose: () => void;
}

/** Add / edit a testimonial (zod-validated; loading → success / error toasts). */
export function TestimonialFormModal({ isOpen, testimonial, onClose }: TestimonialFormModalProps) {
  const editing = !!testimonial;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({ resolver: zodResolver(testimonialSchema), mode: "onTouched", defaultValues: EMPTY_TESTIMONIAL });
  const quote = useWatch({ control, name: "quote" }) ?? "";

  useEffect(() => {
    if (!isOpen) return;
    reset(
      testimonial
        ? { quote: testimonial.quote, name: testimonial.name, role: testimonial.role, avatarUrl: testimonial.avatarUrl, isPublished: testimonial.isPublished, featured: testimonial.featured, order: testimonial.order }
        : EMPTY_TESTIMONIAL
    );
  }, [isOpen, testimonial, reset]);

  const onSubmit = async (values: TestimonialFormValues) => {
    const id = toast.loading(editing ? "Saving testimonial..." : "Adding testimonial...", { description: values.name });
    try {
      if (testimonial) await updateTestimonial(testimonial.id, values);
      else await createTestimonial(values);
      toast.success(editing ? "Testimonial saved" : "Testimonial added", { id, description: values.isPublished ? "It's live on the website." : "Saved as a draft — publish it when ready." });
      onClose();
    } catch (err) {
      toast.error(editing ? "Couldn't save the testimonial" : "Couldn't add the testimonial", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={editing ? "Edit testimonial" : "Add testimonial"}
      subtitle="Only real, approved quotes from customers. Published ones appear on the marketing website."
      titleIcon={<MessageSquareQuote className="h-5 w-5" />}
      maxWidth="lg"
      footer={
        <>
          <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="testimonial-form" isLoading={isSubmitting} disabled={isSubmitting}>
            {editing ? "Save changes" : "Add testimonial"}
          </PrimaryButton>
        </>
      }
    >
      <form id="testimonial-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="t-quote" label="Quote" required />
            <CharCounter count={quote.length} max={400} />
          </div>
          <TextAreaField id="t-quote" rows={4} placeholder="What did they say about EduPro?" error={errors.quote?.message} {...register("quote")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField id="t-name" label="Name" required placeholder="e.g. Nusrat Jahan" error={errors.name?.message} {...register("name")} />
          <InputField id="t-role" label="Role & institution" placeholder="e.g. Principal, Greenfield School" error={errors.role?.message} {...register("role")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <InputField id="t-avatar" label="Photo URL" placeholder="https://… (optional — initials are shown without)" error={errors.avatarUrl?.message} {...register("avatarUrl")} />
          </div>
          <InputField id="t-order" label="Order" type="number" min={0} max={999} error={errors.order?.message} {...register("order", { valueAsNumber: true })} />
        </div>
        <div className="space-y-3 rounded-xl border border-dash p-4">
          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => <SettingToggleRow title="Published" description="Show it on the marketing website." checked={field.value} onChange={field.onChange} />}
          />
          <Controller
            control={control}
            name="featured"
            render={({ field }) => <SettingToggleRow title="Featured" description="Highlight it as the orange card." checked={field.value} onChange={field.onChange} />}
          />
        </div>
      </form>
    </ModalShell>
  );
}

export default TestimonialFormModal;
