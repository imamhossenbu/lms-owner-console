"use client";

import React, { useId } from "react";

export type SparkColor = "orange" | "blue" | "green" | "purple" | "red" | "yellow";

const STROKE: Record<SparkColor, string> = {
  orange: "var(--color-brand-orange)",
  blue: "var(--color-blue)",
  green: "var(--color-green)",
  purple: "var(--color-purple)",
  red: "var(--color-red)",
  yellow: "var(--color-yellow)",
};

/** Mini trend line with a soft fill — same drawing as the panel dashboard's Sparkline. */
export function Sparkline({ data, color, width = 96, height = 36 }: { data: number[]; color: SparkColor; width?: number; height?: number }) {
  const gradientId = useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => ({
    x: (idx / (data.length - 1)) * (width - 6) + 3,
    y: max === min ? height / 2 : height - 4 - ((val - min) / range) * (height - 8),
  }));

  let pathD = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }
  const areaD = `${pathD} L ${points[points.length - 1]!.x} ${height} L ${points[0]!.x} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={STROKE[color]} stopOpacity="0.18" />
          <stop offset="100%" stopColor={STROKE[color]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path d={pathD} fill="none" stroke={STROKE[color]} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Sparkline;
