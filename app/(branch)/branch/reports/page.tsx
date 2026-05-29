"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PeriodFilter } from "@/components/booking/period-filter";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useReportsAnalytics } from "@/hooks/use-analytics";
import { chartPointsToDailyRevenue } from "@/lib/api/analytics";
import type { BookingListQuery } from "@/lib/booking-filters";
import { formatCurrency } from "@/lib/utils";
import { PageContent } from "@/components/layout/page-content";

export default function ReportsPage() {
  const { locked } = useHotelScope();
  const [periodQuery, setPeriodQuery] = useState<
    Pick<BookingListQuery, "period" | "dateFrom" | "dateTo">
  >({ period: "7d" });
  const { data, loading, error } = useReportsAnalytics(periodQuery);

  const chartData = data?.revenue_chart
    ? chartPointsToDailyRevenue(data.revenue_chart)
    : [];

  return (
    <>
      <DashboardHeader
        title="Reports & analytics"
        subtitle="Occupancy, festival rush, donation impact, and coupon redemption"
        hidePropertyBar={locked}
      />
      <PageContent>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <PeriodFilter value={periodQuery} onChange={setPeriodQuery} />

        {data?.period && (
          <p className="text-xs text-muted">
            Showing data for {data.period.start} – {data.period.end}
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Coupon redemptions</p>
            <p className="font-display text-2xl font-bold">
              {loading ? "…" : (data?.coupon_redemptions ?? 0)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Free stays issued</p>
            <p className="font-display text-2xl font-bold">
              {loading ? "…" : (data?.free_stays ?? 0)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Festival period</p>
            <p className="font-display text-lg font-bold text-champagne">Vasavi Utsav</p>
            <p className="text-xs text-muted">May 22–26 · High occupancy expected</p>
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-4">Daily revenue trend</h2>
          <div className="h-56 sm:h-72">
            {loading ? (
              <p className="text-sm text-muted">Loading chart…</p>
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted">No revenue data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5e6ca" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7f1d1d"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-3">Donation & KCGF impact</h2>
          <p className="text-sm text-muted leading-relaxed">
            Donor-tier discounts and coupons have reduced guest payments by{" "}
            <strong className="text-champagne">
              {loading ? "…" : (data?.total_discount_display ?? formatCurrency(0))}
            </strong>{" "}
            across your scoped bookings while supporting community stays and pilgrim visits.
          </p>
        </div>
      </PageContent>
    </>
  );
}
