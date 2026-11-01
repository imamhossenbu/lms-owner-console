"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type IconSectionTone = "blue" | "green" | "orange" | "purple" | "yellow" | "red";

const TONE: Record<IconSectionTone, string> = {
  blue: "bg-blue-14 text-blue",
  green: "bg-green-bg text-green",
  orange: "bg-brand-orange-light text-brand-orange",
  purple: "bg-purple-14 text-purple",
  yellow: "bg-yellow-bg text-yellow",
  red: "bg-red-14 text-red",
};

export interface IconSectionCardProps {
  /** Pass a sized icon, e.g. <Lock className="h-5 w-5" />. */
  icon: React.ReactNode;
  title: string;
  description?: string;
  tone?: IconSectionTone;
  /** Right side of the header (toggle, "+ Add" button …). */
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Card with a rounded icon tile + title + description header (Edit Lesson tabs, Assignments …): rounded icon tile + title + description header, then body.
 * (Design: "Lesson Content", "Publish & Status", "Video Settings", "Access Settings" …)
 */
export function IconSectionCard({
  icon,
  title,
  description,
  tone = "blue",
  action,
  children,
  className,
  bodyClassName,
}: IconSectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("dashboard-card shadow-2xs p-5", className)}
    >
      <header className="flex items-center gap-3.5">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONE[tone])}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="body-md-medium font-semibold! text-primary-500">{title}</h3>
          {description && <p className="mt-0.5 body-sm-regular text-primary-300">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children && <div className={cn("mt-5", bodyClassName)}>{children}</div>}
    </motion.section>
  );
}

export default IconSectionCard;
