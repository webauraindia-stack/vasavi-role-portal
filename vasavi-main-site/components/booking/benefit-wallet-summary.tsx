"use client";

import { motion } from "framer-motion";
import { Crown, Gift, Sparkles, Wallet, Ticket } from "lucide-react";
import type { BenefitWalletSummary } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export function BenefitWalletSummaryPanel({
  summary,
  memberName,
  tierLabel,
}: {
  summary: BenefitWalletSummary;
  memberName: string;
  tierLabel?: string;
}) {
  const chips = [
    summary.freeStayCoupons > 0 && {
      icon: Ticket,
      text: `${summary.freeStayCoupons} Free Stay Coupon${summary.freeStayCoupons > 1 ? "s" : ""} Available`,
      tone: "bg-amber-50 border-amber-200/80 text-amber-900",
    },
    summary.compensationBalance > 0 && {
      icon: Wallet,
      text: `${formatCurrency(summary.compensationBalance)} Compensation Balance`,
      tone: "bg-emerald-50 border-emerald-200/80 text-emerald-900",
    },
    summary.festivalCoupons > 0 && {
      icon: Sparkles,
      text: "Festival Special Coupon",
      tone: "bg-rose-50 border-rose-200/80 text-rose-900",
    },
    summary.donorRewardActive && {
      icon: Gift,
      text: "Donor Reward Benefit",
      tone: "bg-violet-50 border-violet-200/80 text-violet-900",
    },
    summary.tierDiscountPercent > 0 && {
      icon: Crown,
      text: `${summary.tierDiscountPercent}% Tier Blessing Active`,
      tone: "bg-champagne/5 border-champagne/30 text-champagne",
    },
  ].filter(Boolean) as {
    icon: typeof Crown;
    text: string;
    tone: string;
  }[];

  return (
    <div className="rounded-2xl border border-beige/50 bg-gradient-to-br from-surface via-white to-amber-50/30 p-4 space-y-3">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Community blessings for
        </p>
        <p className="font-display text-base font-bold text-charcoal">{memberName}</p>
        {tierLabel && <p className="text-xs text-muted mt-0.5">{tierLabel}</p>}
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => {
          const Icon = chip.icon;
          return (
            <motion.div
              key={chip.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-bold",
                chip.tone
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {chip.text}
            </motion.div>
          );
        })}
        {chips.length === 0 && (
          <p className="text-xs text-muted">
            Sign in with your Vasavi member ID to unlock community rewards.
          </p>
        )}
      </div>
    </div>
  );
}
