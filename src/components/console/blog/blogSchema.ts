import { z } from "zod";

const httpsOrEmpty = (what: string) =>
  z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), `${what} must be an https:// URL`);

/** Blog post editor (mirrors the API's DTO rules). */
export const blogSchema = z.object({
  title: z.string().trim().min(8, "The title needs at least 8 characters").max(140, "Keep the title under 140 characters"),
  slug: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().min(30, "The summary needs at least 30 characters").max(300, "Keep the summary under 300 characters"),
  content: z.string().min(200, "The article needs at least 200 characters").max(100_000, "The article is too long"),
  coverUrl: httpsOrEmpty("Cover image"),
  category: z.string().trim().min(2, "Pick or type a category").max(40),
  tags: z.array(z.string().trim().min(1).max(30)).max(8, "Use at most 8 tags"),
  authorName: z.string().trim().min(2, "Enter the author's name").max(80),
  authorRole: z.string().trim().max(80),
  authorAvatarUrl: httpsOrEmpty("Author photo"),
  isPublished: z.boolean(),
  featured: z.boolean(),
});
export type BlogFormValues = z.infer<typeof blogSchema>;

export const EMPTY_POST: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  category: "Guides",
  tags: [],
  authorName: "EduPro Team",
  authorRole: "",
  authorAvatarUrl: "",
  isPublished: false,
  featured: false,
};

export const CATEGORY_SUGGESTIONS = ["Guides", "Teaching", "Live Classes", "Payments", "Product Updates"];
