import React from "react";

interface EduProLogoProps {
  variant?: "light" | "dark" | "orange";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * EduPro logo-mark shading palette. These are fixed brand-artwork shades of the
 * brand orange (no globals.css token exists for them), so they live here in one place.
 */
const BRAND_COLORS = {
  capShadow: "#C93F00",
  capHighlight: "#FF8038",
  capPin: "#D94800",
  tasselString: "#FFB073",
  tasselBobble: "#FFA05C",
} as const;

export function EduProCapIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cap Underside / Base Arc with Rich Shadow Depth */}
      <path
        d="M12 21.5V30C12 34 17.5 37 24 37C30.5 37 36 34 36 30V21.5L24 27.5L12 21.5Z"
        fill={BRAND_COLORS.capShadow}
      />

      {/* Main Top Mortarboard Rhombus */}
      <path
        d="M24 7L44 17L24 27L4 17L24 7Z"
        fill="var(--color-brand-orange)"
      />

      {/* Subtle Top Cap Highlight Rim */}
      <path
        d="M24 8L42 17L24 26L6 17L24 8Z"
        stroke={BRAND_COLORS.capHighlight}
        strokeWidth="1"
        fill="none"
      />

      {/* Center Cap Pin */}
      <circle cx="24" cy="17" r="1.5" fill={BRAND_COLORS.capPin} />

      {/* Tassel String */}
      <path
        d="M40 18.5V32.5C40 34 38.5 35 37 35"
        stroke={BRAND_COLORS.tasselString}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Tassel Bobble */}
      <circle cx="36.5" cy="35" r="2.5" fill={BRAND_COLORS.tasselBobble} />
    </svg>
  );
}

export function EduProLogo({
  variant = "orange",
  size = "md",
  showText = true,
  subtitle = "LMS Admin Panel",
  className = "",
}: EduProLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };


  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0 flex items-center justify-center">
        <EduProCapIcon className={iconSizes[size]} />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`${
              size === "lg" ? "body-xl-regular" : size === "md" ? "title-regular" : "body-l-regular"
            } font-extrabold! tracking-tight ${
              isLight ? "text-white" : "text-primary-500"
            }`}
          >
            {isLight ? (
              "EduPro"
            ) : variant === "orange" ? (
              <>
                <span className="text-primary-500">Edu</span>
                <span className="text-brand-orange">Pro</span>
              </>
            ) : (
              "EduPro"
            )}
          </span>
          {subtitle && (
            <span
              className={`body-xsm-regular ${
                isLight ? "text-white/60" : "subtext-500"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
