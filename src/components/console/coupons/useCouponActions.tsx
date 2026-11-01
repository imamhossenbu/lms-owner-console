"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { deleteCoupon, setCouponActive } from "@/lib/couponStorage";

const message = (err: unknown) => (err instanceof Error ? err.message : "Please try again.");

/** Row actions for coupons (edit, copy code, enable / disable, delete) with toasts and confirm modals. */
export function useCouponActions() {
  const router = useRouter();
  const [confirm, setConfirm] = useState<{ kind: "disable" | "delete"; coupon: Coupon } | null>(null);

  const copyCode = async (c: Coupon) => {
    try {
      await navigator.clipboard.writeText(c.code);
      toast.success("Code copied", { description: `${c.code} is on your clipboard.` });
    } catch {
      toast.error("Couldn't copy the code", { description: "Select it and copy manually." });
    }
  };

  const toggle = async (c: Coupon, active: boolean) => {
    const id = toast.loading(active ? "Enabling coupon..." : "Disabling coupon...", { description: c.code });
    try {
      await setCouponActive(c.id, active);
      toast.success(active ? "Coupon enabled" : "Coupon disabled", {
        id,
        description: active ? `${c.code} can be redeemed again.` : `${c.code} can't be redeemed. Existing discounts keep running.`,
      });
    } catch (err) {
      toast.error(active ? "Couldn't enable the coupon" : "Couldn't disable the coupon", { id, description: message(err) });
      throw err;
    }
  };

  const remove = async (c: Coupon) => {
    const id = toast.loading("Deleting coupon...", { description: c.code });
    try {
      await deleteCoupon(c.id);
      toast.success("Coupon deleted", { id, description: `${c.code} has been removed.` });
    } catch (err) {
      toast.error("Couldn't delete the coupon", { id, description: message(err) });
      throw err;
    }
  };

  const getMenuItems = (c: Coupon): DropdownActionItem[] => [
    { key: "edit", label: "Edit coupon", icon: <Pencil className="h-4 w-4" />, onClick: () => router.push(`/coupons/${c.id}/edit`) },
    { key: "copy", label: "Copy code", icon: <Copy className="h-4 w-4" />, onClick: () => void copyCode(c) },
    c.active
      ? { key: "disable", label: "Disable", icon: <PowerOff className="h-4 w-4" />, onClick: () => setConfirm({ kind: "disable", coupon: c }), separatorBefore: true }
      : { key: "enable", label: "Enable", icon: <Power className="h-4 w-4" />, onClick: () => void toggle(c, true).catch(() => {}), separatorBefore: true },
    {
      key: "delete",
      label: c.redemptions.length ? "Delete (redeemed — disable instead)" : "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      disabled: c.redemptions.length > 0,
      onClick: () => setConfirm({ kind: "delete", coupon: c }),
    },
  ];

  const modals = (
    <ConfirmModal
      isOpen={!!confirm}
      title={confirm?.kind === "delete" ? "Delete this coupon?" : "Disable this coupon?"}
      subtitle={confirm?.coupon.code}
      message={
        confirm?.kind === "delete"
          ? "It has never been redeemed, so nothing else changes. This can't be undone."
          : "Institutions won't be able to redeem it any more. Discounts already applied keep running until they end."
      }
      confirmLabel={confirm?.kind === "delete" ? "Delete coupon" : "Disable coupon"}
      pendingLabel={confirm?.kind === "delete" ? "Deleting..." : "Disabling..."}
      confirmIcon={confirm?.kind === "delete" ? <Trash2 className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
      onClose={() => setConfirm(null)}
      onConfirm={async () => {
        if (!confirm) return;
        if (confirm.kind === "delete") await remove(confirm.coupon);
        else await toggle(confirm.coupon, false);
      }}
    />
  );

  return { getMenuItems, copyCode, toggle, modals };
}
