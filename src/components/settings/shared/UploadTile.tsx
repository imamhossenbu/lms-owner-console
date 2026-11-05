"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ImageIcon, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { uploadConsoleImage } from "@/lib/upload";
import { cn } from "@/lib/cn";

export interface UploadTileProps {
  label: string;
  /** Hosted URL ("" = nothing uploaded). Never a blob: URL. */
  value: string;
  onChange: (url: string) => void;
  /** e.g. "image/png,image/svg+xml". */
  accept: string;
  maxMb: number;
  aspect: "square" | "wide";
  helper?: string;
  /** Optional: receives the on-screen (blob:) preview so live previews elsewhere can show it. */
  onPreviewChange?: (localUrl: string | null) => void;
  /** Dark checkerboard-free backdrop for logos meant for dark backgrounds. */
  dark?: boolean;
  id?: string;
}

const humanTypes = (accept: string) =>
  accept
    .split(",")
    .map((t) => t.trim().replace(/^image\//, "").replace("svg+xml", "svg").replace("x-icon", "ico").replace("vnd.microsoft.icon", "ico").toUpperCase())
    .filter((t, i, a) => a.indexOf(t) === i)
    .join(", ");

/**
 * Dashed drop/click tile → uploadConsoleImage (real upload) with loading/success/error toasts, then a preview
 * with Replace / Remove. Only the hosted URL reaches the form; the blob preview is screen-only.
 */
export function UploadTile({ label, value, onChange, accept, maxMb, aspect, helper, onPreviewChange, dark, id }: UploadTileProps) {
  const autoId = useId();
  const inputId = id ?? `upload-${autoId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  /** Screen-only blob preview + the hosted URL it belongs to (null while uploading). */
  const [local, setLocal] = useState<{ url: string; forValue: string | null } | null>(null);
  const localUrl = local?.url ?? null;
  // A preview is stale once the value moved on from the URL it was uploaded as (Discard / reset).
  const isStale = !!local && local.forValue !== null && local.forValue !== value;
  const [uploading, setUploading] = useState(false);
  /** The source that failed to load (so a new source gets a fresh try). */
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Free the object URL when it is replaced or the tile unmounts.
  useEffect(() => () => void (localUrl && URL.revokeObjectURL(localUrl)), [localUrl]);

  // Tell the parent's live preview to drop a stale image too.
  useEffect(() => {
    if (isStale) onPreviewChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStale]);

  const types = accept.split(",").map((t) => t.trim());

  const handleFile = async (file: File) => {
    const okType = types.some((t) => (t.endsWith("/*") ? file.type.startsWith(t.slice(0, -1)) : file.type === t));
    if (!okType) {
      toast.error("Unsupported file type", { description: `Please choose a ${humanTypes(accept)} file.` });
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      toast.error("File is too large", { description: `${label} can be at most ${maxMb} MB.` });
      return;
    }
    const blob = URL.createObjectURL(file);
    setLocal({ url: blob, forValue: null });
    onPreviewChange?.(blob);
    setUploading(true);
    const toastId = toast.loading(`Uploading ${label.toLowerCase()}...`, { description: file.name });
    try {
      const { url } = await uploadConsoleImage(file);
      if (!url) throw new Error("Missing URL");
      if (alive.current) {
        setLocal({ url: blob, forValue: url });
        onChange(url);
      }
      toast.success(`${label} uploaded`, { id: toastId, description: "Save changes to publish it." });
    } catch {
      if (alive.current) {
        setLocal(null);
        onPreviewChange?.(null);
      }
      toast.error("Upload failed", { id: toastId, description: "We couldn't upload this file. Please try again." });
    } finally {
      if (alive.current) setUploading(false);
    }
  };

  const remove = () => {
    onChange("");
    setLocal(null);
    onPreviewChange?.(null);
  };

  const src = (isStale ? null : localUrl) ?? value;
  const box = aspect === "square" ? "h-24 w-24" : "h-24 w-full";
  const meta = `${humanTypes(accept)} · max ${maxMb} MB`;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        {src ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn("flex gap-3 rounded-xl border border-dash bg-white p-3", aspect === "square" ? "items-center" : "flex-col")}
          >
            <div className={cn("relative shrink-0 overflow-hidden rounded-lg border border-dash", box, dark ? "bg-brand-navy" : "bg-gray-bg")}>
              {brokenSrc === src ? (
                <span className={cn("flex h-full w-full flex-col items-center justify-center gap-1", dark ? "text-white/70" : "text-primary-300")}>
                  <ImageIcon className="h-5 w-5" />
                  <span className="body-2xsm-regular">Preview unavailable</span>
                </span>
              ) : (
                <Image src={src} alt={`${label} preview`} fill unoptimized sizes="320px" className="object-contain p-2" onError={() => setBrokenSrc(src)} />
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-brand-orange">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate body-xsm-medium font-semibold! text-primary-500">{uploading ? "Uploading…" : label}</p>
                <p className="truncate body-2xsm-regular text-primary-300">{meta}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  aria-label={`Replace ${label}`}
                  title="Replace"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-slate-100 hover:text-primary-500 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={remove}
                  disabled={uploading}
                  aria-label={`Remove ${label}`}
                  title="Remove"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-300 transition-colors hover:bg-red-14 hover:text-red disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-colors",
              aspect === "wide" && "min-h-24",
              dragOver ? "border-brand-orange bg-brand-orange-light" : "border-dash bg-white hover:border-brand-orange hover:bg-brand-orange-light"
            )}
          >
            <span className={cn("flex shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-brand-orange", aspect === "square" ? "h-16 w-16" : "h-11 w-11")}>
              <UploadCloud className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block body-xsm-medium font-semibold! text-primary-500">
                <span className="text-brand-orange">Click to upload</span> or drag and drop
              </span>
              <span className="mt-0.5 block body-2xsm-regular text-primary-300">{meta}</span>
              {helper && <span className="mt-0.5 block body-2xsm-regular text-primary-300">{helper}</span>}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UploadTile;
