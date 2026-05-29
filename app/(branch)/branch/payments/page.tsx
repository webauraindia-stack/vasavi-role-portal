"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PeriodFilter } from "@/components/booking/period-filter";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useFinanceAnalytics } from "@/hooks/use-analytics";
import { useBookingsList } from "@/hooks/use-bookings-list";
import type { BookingListQuery } from "@/lib/booking-filters";
import { formatCurrency, PAYMENT_STATUS_COLORS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageContent } from "@/components/layout/page-content";

export default function PaymentsPage() {
  const { hotelId, locked } = useHotelScope();
  const branchApiId = hotelId === "all" ? undefined : hotelId;

  const [periodQuery, setPeriodQuery] = useState<
    Pick<BookingListQuery, "period" | "dateFrom" | "dateTo">
  >({ period: "30d" });

  const { data: finance, loading: financeLoading, error: financeError } =
    useFinanceAnalytics(periodQuery);

  const { bookings, loading: listLoading, setFilters } = useBookingsList(branchApiId);

  useEffect(() => {
    setFilters({
      status: "all",
      period: periodQuery.period ?? "30d",
      dateFrom: periodQuery.dateFrom,
      dateTo: periodQuery.dateTo,
    });
  }, [periodQuery, branchApiId, setFilters]);

  const loading = financeLoading || listLoading;

  return (
    <>
      <DashboardHeader
        title="Payments"
        subtitle="Cash receipts, tracking, and refunds"
        hidePropertyBar={locked}
      />
      <PageContent>
        {financeError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {financeError}
          </p>
        )}

        <PeriodFilter value={periodQuery} onChange={setPeriodQuery} />

        {finance?.period && (
          <p className="text-xs text-muted">
            {finance.period.start} – {finance.period.end}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Collected</p>
            <p className="font-display text-xl font-bold text-emerald-700">
              {loading ? "…" : (finance?.collected_display ?? formatCurrency(0))}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Pending</p>
            <p className="font-display text-xl font-bold text-amber-700">
              {loading ? "…" : (finance?.pending_display ?? formatCurrency(0))}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Discounts applied</p>
            <p className="font-display text-xl font-bold text-champagne-dark">
              {loading ? "…" : (finance?.discounts_display ?? formatCurrency(0))}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Free stays</p>
            <p className="font-display text-xl font-bold">
              {loading ? "…" : (finance?.free_stays ?? 0)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Refunds pending</p>
            <p className="font-display text-xl font-bold text-violet-700">
              {loading ? "…" : (finance?.refunds_queue ?? 0)}
            </p>
          </div>
        </div>

        <div className="card-manager overflow-hidden">
          <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[36rem] text-sm">
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
              {listLoading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted">
                    Loading payments…
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted">
                    No bookings in this period.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-beige/30">
                    <td className="p-3 font-mono text-xs">{b.reference}</td>
                    <td className="p-3">{b.guestName}</td>
                    <td className="p-3 font-mono">
                      {b.baseAmountDisplay || formatCurrency(b.baseAmountPaise / 100)}
                    </td>
                    <td className="p-3 text-xs text-emerald-700">
                      {b.discountAmountPaise > 0
                        ? `−${b.discountDisplay || formatCurrency(b.discountAmountPaise / 100)}`
                        : "—"}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {b.finalAmountDisplay || formatCurrency(b.finalAmountPaise / 100)}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={cn(
                          PAYMENT_STATUS_COLORS[b.paymentStatus] ||
                            "bg-slate-100 text-slate-700"
                        )}
                      >
                        {b.paymentStatus.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </PageContent>
    </>
  );
}
