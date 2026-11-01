"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string; // backwards compatibility
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  headerActions?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"; // backwards compatibility
  /** Icon shown before the title (hero header). */
  titleIcon?: React.ReactNode;
  /**
   * "default": compact header with divider. "hero": large title + icon, no divider (feature modals).
   * "none": no header, only a floating close button (full-bleed content such as progress screens).
   */
  headerVariant?: "default" | "hero" | "none";
}

export function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  footer,
  className,
  bodyClassName,
  footerClassName,
  headerActions,
  maxWidth,
  titleIcon,
  headerVariant = "default",
}: ModalShellProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const effectiveSubtitle = subtitle || description;

  const maxWidthClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  }[maxWidth || "lg"];

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none border border-dash",
              maxWidthClass,
              className
            )}
          >
            {headerVariant === "none" ? (
              <div className="relative shrink-0">
                <h2 id={titleId} className="sr-only">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-5 top-5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-primary-400 transition-colors hover:bg-slate-100 hover:text-primary-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
            <div
              className={cn(
                "flex shrink-0 items-start justify-between gap-4",
                headerVariant === "hero" ? "px-8 pt-7 pb-1" : "border-b border-dash px-6 py-4"
              )}
            >
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className={cn(
                    "text-primary-500 flex items-center gap-3",
                    headerVariant === "hero" ? "heading-h4" : "h6-medium"
                  )}
                >
                  {titleIcon && <span className="shrink-0 flex [&>svg]:w-8 [&>svg]:h-8">{titleIcon}</span>}
                  {title}
                </h2>
                {effectiveSubtitle && (
                  <p
                    className={cn(
                      headerVariant === "hero" ? "body-regular text-primary-400 mt-2 max-w-3xl" : "body-sm-regular subtext-500 mt-0.5"
                    )}
                  >
                    {effectiveSubtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {headerActions}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dash text-primary-300 transition-colors hover:bg-slate-100 hover:text-primary-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            )}

            <div className={cn("min-h-0 flex-1 overflow-y-auto p-6 bg-white", bodyClassName)}>
              {children}
            </div>

            {footer && (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-end gap-3 border-t border-dash px-6 py-4 bg-white",
                  footerClassName
                )}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ModalShell;
