"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
  const { hotelId } = useHotelScope();
  const { bookings } = useManagerStore();
  const filtered = getStoreBookings(hotelId, bookings);

  const summary = useMemo(() => {
    const paid = filtered.filter((b) => b.paymentStatus === "paid");
    const pending = filtered.filter((b) => b.paymentStatus === "pending");
    const free = filtered.filter((b) => b.paymentStatus === "free_stay");
    return {
      collected: paid.reduce((s, b) => s + b.total, 0),
      pending: pending.reduce((s, b) => s + b.total, 0),
      donorValue: filtered.reduce(
        (s, b) => s + b.tierDiscount + b.couponDiscount + b.walletApplied,
        0
      ),
      freeNights: free.length,
    };
  }, [filtered]);

  return (
    <>
      <DashboardHeader
        title="Payments"
        subtitle="UPI, card, free stays, and transparent coupon deduction logs"
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <p className="text-[10px] font-bold uppercase text-muted">Donor benefits applied</p>
            <p className="font-display text-xl font-bold text-champagne-dark">
              {formatCurrency(summary.donorValue)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Free stays</p>
            <p className="font-display text-xl font-bold">{summary.freeNights}</p>
          </div>
        </div>

        <div className="card-manager overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige/50 text-left text-[10px] font-bold uppercase text-muted">
                <th className="p-3">Reference</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">Deductions</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-beige/30">
                  <td className="p-3 font-mono text-xs">{b.reference}</td>
                  <td className="p-3">{b.guestName}</td>
                  <td className="p-3 font-mono">{formatCurrency(b.subtotal)}</td>
                  <td className="p-3 text-xs text-emerald-700">
                    −{formatCurrency(b.tierDiscount + b.couponDiscount + b.walletApplied)}
                  </td>
                  <td className="p-3 font-mono font-bold">{formatCurrency(b.total)}</td>
                  <td className="p-3">
                    <Badge className={cn(PAYMENT_STATUS_COLORS[b.paymentStatus])}>
                      {b.paymentStatus}
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
