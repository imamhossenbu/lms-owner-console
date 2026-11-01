"use client";

import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface AuthAlertBannerProps {
  message: string | null;
  title?: string;
  type?: "error" | "success" | "warning";
  onClose?: () => void;
  className?: string;
}

export function AuthAlertBanner({
  message,
  title,
  type = "error",
  onClose,
  className = "",
}: AuthAlertBannerProps) {
  if (!message) return null;

  const isError = type === "error";
  const defaultTitle = isError ? "Action Required" : "Notice";

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border flex items-start gap-3 mb-5 text-left animate-in fade-in duration-200 ${
        isError
          ? "bg-red-14 border-red/30"
          : "bg-green-bg border-green/30"
      } ${className}`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-dark shrink-0 mt-0.5" strokeWidth={2} />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green shrink-0 mt-0.5" strokeWidth={2} />
      )}
      <div className="flex-1 space-y-1">
        <p
          className={`body-sm-medium ${
            isError ? "text-red-dark" : "text-green"
          }`}
        >
          {title || defaultTitle}
        </p>
        <p
          className={`body-sm-regular ${
            isError ? "text-red-dark" : "text-green"
          }`}
        >
          {message}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
            isError
              ? "text-red-dark hover:bg-red-14"
              : "text-green hover:bg-green/10"
          }`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
