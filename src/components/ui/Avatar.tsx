"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AvatarProps {
  src?: string | null;
  name?: string;
  alt?: string;
  size?: number | "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

export function Avatar({
  src,
  name = "",
  alt = "",
  size = 28,
  className,
  iconClassName,
}: AvatarProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 28
      : size === "lg"
      ? 40
      : 32;

  const hasImage = Boolean(src && src.trim());

  const getInitials = (str: string) => {
    if (!str) return "";
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-bg",
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {hasImage ? (
        <Image
          src={src!}
          alt={alt || name}
          fill
          unoptimized
          sizes={`${pixelSize}px`}
          className="object-cover"
        />
      ) : name ? (
        <span className="body-xsm-medium text-primary-500 select-none">
          {getInitials(name)}
        </span>
      ) : (
        <User
          className={cn("text-primary-300", iconClassName)}
          style={{
            width: pixelSize * 0.5,
            height: pixelSize * 0.5,
          }}
        />
      )}
    </span>
  );
}

export default Avatar;
