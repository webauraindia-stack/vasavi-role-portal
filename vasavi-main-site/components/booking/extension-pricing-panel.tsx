"use client";

import type { ExtensionPricing } from "@/lib/stay-extension/client";
import { formatCurrency } from "@/lib/utils";

export function ExtensionPricingPanel({ pricing }: { pricing: ExtensionPricing }) {
  return (
    <div className="rounded-xl border border-beige/50 bg-surface/80 p-4 space-y-2 text-sm">
      <p className="font-display font-bold text-charcoal text-xs uppercase tracking-wider border-b border-beige/40 pb-2">
        Extension cost breakdown
      </p>
      <Row
        label={`${pricing.extraNights} extra night${pricing.extraNights > 1 ? "s" : ""}`}
        value={pricing.subtotal}
      />
      {pricing.tierDiscount > 0 && (
        <Row label="Tier blessing" value={-pricing.tierDiscount} tone="text-champagne" />
      )}
      <Row label="GST (12%)" value={pricing.taxes} />
      {pricing.waivedAmount > 0 && (
        <Row label="Waived by hotel" value={-pricing.waivedAmount} tone="text-emerald-700" />
      )}
      <div className="border-t border-beige/50 pt-2 flex justify-between items-center">
        <span className="font-display font-bold text-charcoal">Total payable</span>
        <span className="font-mono font-black text-champagne-dark">
          {formatCurrency(pricing.totalDue)}
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "text-charcoal",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted font-medium">{label}</span>
      <span className={`font-mono font-bold ${tone}`}>
        {value < 0 ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
