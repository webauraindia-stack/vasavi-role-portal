"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { formatCurrency, PAYMENT_STATUS_COLORS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function PaymentsPage() {
  const { hotelId } = useHotelScope();
  const { bookings } = useManagerStore();
  const filtered = getStoreBookings(hotelId, bookings);

  const summary = useMemo(() => {
    const paid = filtered.filter((b) => b.paymentStatus === "paid");
    const pending = filtered.filter((b) => b.paymentStatus === "unpaid" || b.paymentStatus === "partial");
    const free = filtered.filter((b) => b.paymentStatus === "free_stay");
    return {
      collected: paid.reduce((s, b) => s + (b.finalAmountPaise / 100), 0),
      pending: pending.reduce((s, b) => s + (b.finalAmountPaise / 100), 0),
      discountsApplied: filtered.reduce((s, b) => s + (b.discountAmountPaise / 100), 0),
      freeNights: free.length,
      refundsProcessing: filtered.filter(b => b.paymentStatus === "refund_pending").length,
    };
  }, [filtered]);

  return (
    <>
      <DashboardHeader
        title="Payments"
        subtitle="Cash receipts, tracking, and refunds"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Collected</p>
            <p className="font-display text-xl font-bold text-emerald-700">
              {formatCurrency(summary.collected)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Pending</p>
            <p className="font-display text-xl font-bold text-amber-700">
              {formatCurrency(summary.pending)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Discounts applied</p>
            <p className="font-display text-xl font-bold text-champagne-dark">
              {formatCurrency(summary.discountsApplied)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Free stays</p>
            <p className="font-display text-xl font-bold">{summary.freeNights}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Refunds pending</p>
            <p className="font-display text-xl font-bold text-violet-700">{summary.refundsProcessing}</p>
          </div>
        </div>

        <div className="card-manager overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige/50 text-left text-[10px] font-bold uppercase text-muted">
                <th className="p-3">Reference</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Base amount</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Final amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-beige/30">
                  <td className="p-3 font-mono text-xs">{b.reference}</td>
                  <td className="p-3">{b.guestName}</td>
                  <td className="p-3 font-mono">{b.baseAmountDisplay || formatCurrency(b.baseAmountPaise / 100)}</td>
                  <td className="p-3 text-xs text-emerald-700">
                    {b.discountAmountPaise > 0 ? `−${b.discountDisplay || formatCurrency(b.discountAmountPaise / 100)}` : "—"}
                  </td>
                  <td className="p-3 font-mono font-bold">{b.finalAmountDisplay || formatCurrency(b.finalAmountPaise / 100)}</td>
                  <td className="p-3">
                    <Badge className={cn(PAYMENT_STATUS_COLORS[b.paymentStatus] || "bg-slate-100 text-slate-700")}>
                      {b.paymentStatus.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
