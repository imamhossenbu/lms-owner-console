import { z } from "zod";

/** Mirrors the API's TestimonialFormDto. */
export const testimonialSchema = z.object({
  quote: z.string().trim().min(20, "The quote needs at least 20 characters").max(400, "Keep the quote under 400 characters"),
  name: z.string().trim().min(2, "Enter the person's name").max(80, "Name is too long"),
  role: z.string().trim().max(120, "Role is too long"),
  avatarUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Photo must be an https:// URL"),
  isPublished: z.boolean(),
  featured: z.boolean(),
  order: z.number({ error: "Enter a number" }).int("Whole numbers only").min(0, "0 or more").max(999, "999 or less"),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export const EMPTY_TESTIMONIAL: TestimonialFormValues = { quote: "", name: "", role: "", avatarUrl: "", isPublished: true, featured: false, order: 0 };
