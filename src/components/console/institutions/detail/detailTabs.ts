export const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "usage", label: "Usage" },
  { id: "billing", label: "Billing" },
  { id: "domain", label: "Domain" },
  { id: "activity", label: "Activity" },
] as const;

export type DetailTab = (typeof DETAIL_TABS)[number]["id"];

export const parseDetailTab = (v: string | null | undefined): DetailTab => (DETAIL_TABS.some((t) => t.id === v) ? (v as DetailTab) : "overview");
