"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, ImageIcon, Lock, PenLine, Save, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useUrlParams } from "@/lib/useUrlParams";
import { Markdown } from "@/lib/markdown";
import { WEBSITE_POST_URL, createBlogPost, slugify, updateBlogPost, type BlogPost } from "@/lib/blogStorage";
import { InputField } from "@/components/ui/InputField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { CharCounter } from "@/components/ui/CharCounter";
import { PillTabs } from "@/components/ui/PillTabs";
import { SettingToggleRow } from "@/components/ui/SettingToggleRow";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { CATEGORY_SUGGESTIONS, EMPTY_POST, blogSchema, type BlogFormValues } from "./blogSchema";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { TagInput } from "./TagInput";

const card = "rounded-xl border border-dash bg-white p-5 shadow-2xs";
const toValues = (p: BlogPost): BlogFormValues => ({
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  content: p.content,
  coverUrl: p.coverUrl,
  category: p.category,
  tags: p.tags,
  authorName: p.authorName,
  authorRole: p.authorRole,
  authorAvatarUrl: p.authorAvatarUrl,
  isPublished: p.isPublished,
  featured: p.featured,
});

/**
 * Write / edit a blog post: title, URL slug (follows the title until you edit it), summary, Markdown body with a
 * formatting toolbar and live preview (`?tab=write|preview` survives reloads), cover, category, tags, author and
 * publishing. zod-validated; loading → success / error toasts; warns before leaving with unsaved changes.
 */
export function BlogEditor({ post }: { post: BlogPost | null }) {
  const router = useRouter();
  const { get, set } = useUrlParams();
  const tab = get("tab") === "preview" ? "preview" : "write";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  /** Slug edited by hand (then it stops following the title). */
  const [slugManual, setSlugManual] = useState(!!post);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BlogFormValues>({ resolver: zodResolver(blogSchema), mode: "onTouched", defaultValues: post ? toValues(post) : EMPTY_POST });

  const [title, slug, excerpt, content, coverUrl, isPublished] = useWatch({ control, name: ["title", "slug", "excerpt", "content", "coverUrl", "isPublished"] });
  const words = (content ?? "").split(/\s+/).filter(Boolean).length;

  // The slug follows the title for a new post until it's edited by hand.
  useEffect(() => {
    if (!slugManual) setValue("slug", slugify(title ?? ""), { shouldValidate: false });
  }, [title, slugManual, setValue]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [isDirty]);

  const onSubmit = async (values: BlogFormValues) => {
    const id = toast.loading(post ? "Saving post..." : "Creating post...", { description: values.title });
    try {
      const saved = post ? await updateBlogPost(post.id, values) : await createBlogPost(values);
      reset(toValues(saved));
      toast.success(post ? "Post saved" : "Post created", { id, description: saved.isPublished ? "It's live on the website's blog." : "Saved as a draft — publish it when ready." });
      if (!post) router.replace(`/blog/${saved.id}`);
    } catch (err) {
      toast.error(post ? "Couldn't save the post" : "Couldn't create the post", { id, description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const { ref: contentRef, ...contentField } = register("content");

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit(onSubmit, () => toast.error("Check the highlighted fields", { description: "Some details are missing or too short." }))}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-5 pb-8 text-left"
    >
      <ConsoleHeader
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post ? "Edit post" : "New post" }]}
        title={post ? "Edit post" : "Write a post"}
        subtitle={post ? `/blog/${post.slug}` : "Drafts stay private until you publish them."}
        badge={
          post ? (
            <ToneBadge tone={post.isPublished ? "green" : "gray"} size="sm">
              {post.isPublished ? "Published" : "Draft"}
            </ToneBadge>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            {post?.isPublished && (
              <SecondaryButton type="button" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => window.open(WEBSITE_POST_URL(post.slug), "_blank", "noopener")}>
                View on website
              </SecondaryButton>
            )}
            <PrimaryButton type="submit" size="lg" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {isSubmitting ? "Saving..." : post ? "Save changes" : isPublished ? "Publish post" : "Save draft"}
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Main column */}
        <div className="space-y-5 xl:col-span-8">
          <div className={`${card} space-y-4`}>
            <InputField id="b-title" label="Title" required placeholder="e.g. How to run your first live class" error={errors.title?.message} {...register("title")} />
            <InputField
              id="b-slug"
              label="URL slug"
              placeholder="how-to-run-your-first-live-class"
              error={errors.slug?.message}
              leftElement={<span className="body-sm-regular text-primary-300">/blog/</span>}
              rightElement={
                <button
                  type="button"
                  onClick={() => {
                    if (slugManual) setValue("slug", slugify(title ?? ""), { shouldDirty: true });
                    setSlugManual(!slugManual);
                  }}
                  title={slugManual ? "Follow the title again" : "Edit by hand"}
                  aria-label={slugManual ? "Follow the title again" : "Edit by hand"}
                  className="text-primary-300 hover:text-brand-orange"
                >
                  {slugManual ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </button>
              }
              {...register("slug", { onChange: () => setSlugManual(true) })}
            />
            <div>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="b-excerpt" label="Summary" required />
                <CharCounter count={(excerpt ?? "").length} max={300} />
              </div>
              <TextAreaField id="b-excerpt" rows={3} placeholder="One or two sentences shown on the blog cards and in search results." error={errors.excerpt?.message} {...register("excerpt")} />
            </div>
          </div>

          <div className={card}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="body-l-medium font-semibold text-primary-500">Article</h2>
                <p className="body-xsm-regular text-primary-300">
                  {words.toLocaleString("en-US")} words · about {Math.max(1, Math.round(words / 200))} min read · Markdown
                </p>
              </div>
              <PillTabs
                tabs={[
                  { id: "write", label: "Write", icon: <PenLine /> },
                  { id: "preview", label: "Preview", icon: <Eye /> },
                ]}
                activeId={tab}
                onChange={(id) => set({ tab: id === "write" ? null : id })}
                ariaLabel="Editor mode"
              />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {tab === "write" ? (
                <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MarkdownToolbar textarea={textareaRef} onChange={(v) => setValue("content", v, { shouldDirty: true, shouldValidate: !!errors.content })} />
                  <textarea
                    id="b-content"
                    rows={22}
                    placeholder={"Start with a short intro.\n\n## A section heading\n\nWrite paragraphs, **bold** words, lists:\n\n- first point\n- second point"}
                    className={`w-full resize-y rounded-b-lg border bg-white p-4 font-mono body-sm-regular leading-relaxed text-primary-500 outline-none transition-colors placeholder:text-primary-300 focus:border-brand-orange ${errors.content ? "border-red" : "border-dash"}`}
                    {...contentField}
                    ref={(el) => {
                      contentRef(el);
                      textareaRef.current = el;
                    }}
                  />
                  {errors.content && <p className="mt-1 body-xsm-regular text-red">{errors.content.message}</p>}
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="min-h-96 rounded-lg border border-dash px-6 py-2">
                  {content?.trim() ? (
                    <Markdown source={content} />
                  ) : (
                    <p className="py-24 text-center body-sm-regular text-primary-300">Nothing to preview yet — write something in the Write tab.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 xl:col-span-4">
          <div className={`${card} space-y-3`}>
            <h2 className="body-l-medium font-semibold text-primary-500">Publishing</h2>
            <Controller control={control} name="isPublished" render={({ field }) => <SettingToggleRow title="Published" description="Show it on the website's blog." checked={field.value} onChange={field.onChange} />} />
            <Controller control={control} name="featured" render={({ field }) => <SettingToggleRow title="Featured" description="The large post at the top of /blog." checked={field.value} onChange={field.onChange} />} />
            {post?.publishedAt && <p className="body-xsm-regular text-primary-300">First published {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
          </div>

          <div className={`${card} space-y-3`}>
            <h2 className="body-l-medium font-semibold text-primary-500">Cover image</h2>
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dash bg-gray-bg">
              {coverUrl && /^https:\/\//.test(coverUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element -- any https host
                <img src={coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-center body-xsm-regular text-primary-300">
                  <ImageIcon className="h-6 w-6" />
                  No cover — the website draws a branded one
                </span>
              )}
            </div>
            <InputField id="b-cover" placeholder="https://… (optional)" error={errors.coverUrl?.message} {...register("coverUrl")} />
          </div>

          <div className={`${card} space-y-4`}>
            <h2 className="body-l-medium font-semibold text-primary-500">Organize</h2>
            <div>
              <InputField id="b-category" label="Category" required list="blog-categories" placeholder="e.g. Guides" error={errors.category?.message} {...register("category")} />
              <datalist id="blog-categories">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <Controller control={control} name="tags" render={({ field }) => <TagInput id="b-tags" value={field.value} onChange={field.onChange} error={errors.tags?.message} />} />
          </div>

          <div className={`${card} space-y-4`}>
            <h2 className="body-l-medium font-semibold text-primary-500">Author</h2>
            <InputField id="b-author" label="Name" required error={errors.authorName?.message} {...register("authorName")} />
            <InputField id="b-author-role" label="Role" placeholder="e.g. Head of Teaching" error={errors.authorRole?.message} {...register("authorRole")} />
            <InputField id="b-author-photo" label="Photo URL" placeholder="https://… (optional)" error={errors.authorAvatarUrl?.message} {...register("authorAvatarUrl")} />
          </div>
          {slug && <p className="px-1 body-xsm-regular text-primary-300">Will be at /blog/{slug}</p>}
        </div>
      </div>
    </motion.form>
  );
}

export default BlogEditor;
