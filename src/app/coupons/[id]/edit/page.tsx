"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CouponFormView } from "@/components/console/coupons/form/CouponFormView";

/** Owner Console › Coupons › Edit. */
export default function ConsoleEditCouponPage() {
  const { id } = useParams<{ id: string }>();
  return <CouponFormView couponId={id} />;
}
