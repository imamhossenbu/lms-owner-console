import { Bell, Building2, CreditCard, FileText, Globe, LayoutDashboard, LineChart, Settings, Tags, TicketPercent, type LucideIcon } from "lucide-react";

export interface ConsoleNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ConsoleNavSection {
  category: string;
  items: ConsoleNavItem[];
}

/** Owner Console navigation (sidebar + search palette quick links). */
export const CONSOLE_NAV: ConsoleNavSection[] = [
  {
    category: "Platform",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/revenue", label: "Revenue", icon: LineChart },
    ],
  },
  {
    category: "Customers",
    items: [
      { href: "/institutions", label: "Institutions", icon: Building2 },
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    category: "Catalogue",
    items: [
      { href: "/plans", label: "Plans & pricing", icon: Tags },
      { href: "/coupons", label: "Coupons", icon: TicketPercent },
      { href: "/domains", label: "Domains", icon: Globe },
    ],
  },
  { category: "System", items: [{ href: "/settings", label: "Settings", icon: Settings }] },
];

export const isNavActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
