/** Chart colours & axis styles — CSS variables from globals.css only. */
export const CHART = {
  red: "var(--color-red)",
  orange: "var(--color-brand-orange)",
  yellow: "var(--color-yellow)",
  blue: "var(--color-blue)",
  purple: "var(--color-purple)",
  green: "var(--color-green)",
  grid: "var(--dash-border)",
  tick: "var(--color-primary-300)",
} as const;

/** Histogram buckets low → high: red → orange → yellow → blue → blue → purple. */
export const HISTOGRAM_COLORS = [CHART.red, CHART.orange, CHART.yellow, CHART.blue, CHART.blue, CHART.purple];

/** Criteria bar colours in fixed order (follows the criterion, not its rank). */
export const CRITERIA_COLORS = [CHART.green, CHART.blue, CHART.yellow, CHART.purple, CHART.orange, CHART.red];

export const AXIS_TICK = { fill: CHART.tick, fontSize: 11 };
