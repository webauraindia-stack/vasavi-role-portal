"use client";

import { motion } from "framer-motion";
import { Crown, Gift, Wallet, Sparkles } from "lucide-react";
import type { BookingPricingResult } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export function PaymentBreakdownPanel({
  pricing,
  compact = false,
}: {
  pricing: BookingPricingResult;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-beige/50 bg-surface/80 p-4 space-y-2",
        compact ? "text-xs" : "text-sm"
      )}
    >
      <p className="font-display font-bold text-charcoal text-xs uppercase tracking-wider border-b border-beige/40 pb-2 mb-1">
        Payment breakdown
      </p>

      <Row label={`Room (${pricing.nights} night${pricing.nights > 1 ? "s" : ""})`} value={pricing.subtotal} />

      {pricing.tierDiscount > 0 && (
        <Row
          label="Tier blessing"
          value={-pricing.tierDiscount}
          tone="text-champagne"
          icon={<Crown className="h-3.5 w-3.5" />}
        />
      )}

      {pricing.appliedLines
        .filter((l) => l.type === "coupon")
        .map((line) => (
          <Row
            key={line.id}
            label={line.label}
            value={-line.amount}
            tone="text-emerald-700"
            icon={<Gift className="h-3.5 w-3.5" />}
            detail={line.detail}
          />
        ))}

      {pricing.walletApplied > 0 && (
        <Row
          label="Compensation wallet"
          value={-pricing.walletApplied}
          tone="text-emerald-700"
          icon={<Wallet className="h-3.5 w-3.5" />}
        />
      )}

      {pricing.promoDiscount > 0 && (
        <Row label="Promo" value={-pricing.promoDiscount} tone="text-emerald-700" />
      )}

      <Row label="GST (12%)" value={pricing.taxes} />

      {pricing.sevaDonation > 0 && (
        <Row
          label="Seva donation"
          value={pricing.sevaDonation}
          tone="text-champagne"
          icon={<Sparkles className="h-3.5 w-3.5" />}
        />
      )}

      <div className="border-t border-beige/50 pt-2.5 mt-1 flex justify-between items-center">
        <span className="font-display font-bold text-charcoal">Total payable</span>
        <motion.span
          key={pricing.total}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className={cn(
            "font-mono font-black text-base",
            pricing.isFullyCovered ? "text-emerald-700" : "text-champagne-dark"
          )}
        >
          {pricing.isFullyCovered && pricing.sevaDonation === 0
            ? "₹0 — Blessed stay"
            : formatCurrency(pricing.total)}
        </motion.span>
      </div>

      {(pricing.remainingFreeStays > 0 || pricing.remainingCompensation > 0) && (
        <div className="mt-2 pt-2 border-t border-dashed border-beige/40 text-[11px] text-muted space-y-0.5">
          {pricing.remainingFreeStays > 0 && (
            <p>After booking: {pricing.remainingFreeStays} free stay coupon(s) remain</p>
          )}
          {pricing.remainingCompensation > 0 && (
            <p>
              Compensation wallet balance: {formatCurrency(pricing.remainingCompensation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  icon,
  detail,
}: {
  label: string;
  value: number;
  tone?: string;
  icon?: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className={cn("flex items-center gap-1.5 text-muted font-medium", tone)}>
        {icon}
        <span>
          {label}
          {detail && (
            <span className="block text-[10px] font-mono opacity-70">{detail}</span>
          )}
        </span>
      </span>
      <span className={cn("font-mono font-bold shrink-0", tone ?? "text-charcoal")}>
        {value < 0 ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
