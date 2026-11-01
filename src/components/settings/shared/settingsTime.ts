/** "just now", "5m ago", "3h ago", "4d ago", then "Oct 12" — for "Last updated" and audit lists. */
export function settingsTimeAgo(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return "never";
  const ms = now.getTime() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "never";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Full timestamp for tooltips: "Nov 1, 2026, 3:42 PM". */
export const settingsFullDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default settingsTimeAgo;
