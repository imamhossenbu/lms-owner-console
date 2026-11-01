import React from "react";
import { ArrowRightLeft, Ban, CalendarPlus, Eye, LogIn, Pencil, PlayCircle, RotateCcw, XCircle } from "lucide-react";
import type { Institution } from "@/types/saas";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import type { InstitutionDialogOpeners } from "../actions/useInstitutionDialogs";

/**
 * Status-aware owner actions for an institution (row ⋮ menu and the detail header "More" menu).
 * `includeView` adds View / Edit (list rows); the detail page already shows those.
 */
export function institutionMenuItems(inst: Institution, open: InstitutionDialogOpeners, nav: { view: () => void; edit: () => void } | null): DropdownActionItem[] {
  const s = inst.subscription;
  const items: DropdownActionItem[] = [];
  if (nav) {
    items.push({ key: "view", label: "View details", icon: <Eye className="h-4 w-4" />, onClick: nav.view });
    items.push({ key: "edit", label: "Edit details", icon: <Pencil className="h-4 w-4" />, onClick: nav.edit });
  }
  if (s.status !== "CANCELLED" && s.status !== "SUSPENDED")
    items.push({ key: "plan", label: "Change plan", icon: <ArrowRightLeft className="h-4 w-4" />, onClick: () => open.changePlan(inst), separatorBefore: !!nav });
  if (s.status === "TRIALING") items.push({ key: "trial", label: "Extend trial", icon: <CalendarPlus className="h-4 w-4" />, onClick: () => open.extendTrial(inst) });
  if (s.status === "CANCELLED" || s.cancelAtPeriodEnd) items.push({ key: "reactivate", label: s.cancelAtPeriodEnd ? "Undo cancellation" : "Reactivate", icon: <RotateCcw className="h-4 w-4" />, onClick: () => open.reactivate(inst) });
  if (s.status !== "CANCELLED")
    items.push({ key: "open", label: "Open as owner (impersonate)", icon: <LogIn className="h-4 w-4" />, onClick: () => open.impersonate(inst), disabled: s.status === "SUSPENDED" });
  if (s.status === "SUSPENDED") items.push({ key: "unsuspend", label: "Unsuspend", icon: <PlayCircle className="h-4 w-4" />, onClick: () => open.unsuspend(inst), separatorBefore: true });
  else if (s.status !== "CANCELLED") items.push({ key: "suspend", label: "Suspend", icon: <Ban className="h-4 w-4" />, onClick: () => open.suspend(inst), danger: true, separatorBefore: true });
  if (s.status !== "CANCELLED") items.push({ key: "cancel", label: "Cancel subscription", icon: <XCircle className="h-4 w-4" />, onClick: () => open.cancel(inst), danger: true });
  return items;
}
