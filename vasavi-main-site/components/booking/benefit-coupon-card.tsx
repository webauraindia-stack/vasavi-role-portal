"use client";

import { Check, Ticket, Percent, Wallet, Sparkles, Crown, Gift } from "lucide-react";
import type { Coupon } from "@/types";
import { cn } from "@/lib/utils";
import { validateCoupon } from "@/lib/donor-engine";

const TYPE_META: Record<
  string,
  { label: string; color: string; icon: typeof Ticket }
> = {
  free_booking: {
    label: "Free Stay",
    color: "bg-amber-600",
    icon: Ticket,
  },
  percentage_discount: {
    label: "Discount",
    color: "bg-champagne",
    icon: Percent,
  },
  fixed_compensation: {
    label: "Compensation",
    color: "bg-emerald-600",
    icon: Wallet,
  },
  festival_special: {
    label: "Festival",
    color: "bg-rose-600",
    icon: Sparkles,
  },
  premium_benefit: {
    label: "VIP Benefit",
    color: "bg-violet-600",
    icon: Crown,
  },
  special_access: {
    label: "Seva Access",
    color: "bg-blue-600",
    icon: Gift,
  },
};

export function BenefitCouponCard({
  coupon,
  isSelected,
  isDisabled,
  disabledReason,
  onToggle,
}: {
  coupon: Coupon;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  onToggle: () => void;
}) {
  const meta = TYPE_META[coupon.type] ?? TYPE_META.premium_benefit;
  const Icon = meta.icon;

  const valueLabel =
    coupon.type === "free_booking"
      ? "Full stay"
      : coupon.type === "percentage_discount" || coupon.type === "festival_special"
      ? `${coupon.value}% off`
      : formatValue(coupon.value);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        "w-full text-left p-3.5 rounded-xl border transition-all flex gap-3",
        isSelected
          ? "border-champagne-dark bg-amber-50/40 shadow-warm ring-1 ring-champagne-dark/20"
          : isDisabled
          ? "border-beige/40 bg-surface/50 opacity-55 cursor-not-allowed"
          : "border-beige/60 bg-white hover:border-champagne/40 hover:shadow-warm"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
          isSelected
            ? "border-champagne-dark bg-champagne-dark text-white"
            : "border-beige"
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-white", meta.color)}>
            {meta.label}
          </span>
          <span className="font-mono text-[10px] font-bold text-muted">{coupon.code}</span>
        </div>
        <p className="font-display text-sm font-bold text-charcoal leading-tight">
          {coupon.name}
        </p>
        <p className="text-[11px] text-muted leading-snug">{coupon.description}</p>
        {isDisabled && disabledReason && (
          <p className="text-[10px] text-rose-700 font-semibold">{disabledReason}</p>
        )}
        <p className="text-[10px] text-muted">
          Source: {coupon.source} · Expires {coupon.expiryDate}
        </p>
      </div>

      <div className="text-right shrink-0">
        <Icon className="h-4 w-4 text-champagne-dark mx-auto mb-1" />
        <p className="text-xs font-black text-champagne-dark font-mono">{valueLabel}</p>
      </div>
    </button>
  );
}

function formatValue(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validateCouponForBooking(coupon: Coupon, subtotal: number) {
  return validateCoupon(coupon, subtotal);
}
