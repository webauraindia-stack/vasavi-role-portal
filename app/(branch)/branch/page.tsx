"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ManualBookingTrigger } from "@/components/dashboard/manual-booking-dialog";
import { PeriodFilter } from "@/components/booking/period-filter";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import {
  useDashboardCollectionsChart,
  useDashboardStats,
} from "@/hooks/use-analytics";
import { chartPointsToDailyRevenue } from "@/lib/api/analytics";
import type { BookingListQuery } from "@/lib/booking-filters";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { BookingTable } from "@/components/dashboard/booking-table";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { useManagerStore, getStoreNotifications } from "@/stores/manager-store";
import { listBookingsFiltered } from "@/lib/api/bookings";
import { useAuthStore } from "@/stores/auth-store";
import { PageContent } from "@/components/layout/page-content";

export default function DashboardOverviewPage() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";
  const { hotelId, hotelName, viewAll } = useHotelScope();
  const accessToken = useAuthStore((s) => s.accessToken);
  const branchApiId = hotelId === "all" ? undefined : hotelId;

  const [chartPeriod, setChartPeriod] = useState<
    Pick<BookingListQuery, "period" | "dateFrom" | "dateTo">
  >({ period: "7d" });

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    reload: reloadStats,
  } = useDashboardStats();

  const {
    data: collections,
    loading: chartLoading,
    error: chartError,
    reload: reloadChart,
  } = useDashboardCollectionsChart(chartPeriod);

  const {
    notifications,
    markNotificationRead,
    dataLoaded,
    isRefreshing,
    dataError,
  } = useManagerStore();

  const [recentBookings, setRecentBookings] = useState<
    Awaited<ReturnType<typeof listBookingsFiltered>>["bookings"]
  >([]);

  useEffect(() => {
    if (!accessToken) return;
    void listBookingsFiltered(
      accessToken,
      { branchId: branchApiId, period: "30d" },
      { maxResults: 5 }
    ).then((r) => setRecentBookings(r.bookings));
  }, [accessToken, branchApiId]);

  const scopedNotifications = useMemo(
    () => getStoreNotifications(hotelId, notifications).slice(0, 6),
    [hotelId, notifications]
  );

  const revenueChart = useMemo(
    () =>
      collections?.revenue_chart
        ? chartPointsToDailyRevenue(collections.revenue_chart)
        : [],
    [collections]
  );

  const handleRefreshAll = () => {
    void reloadStats();
    void reloadChart();
    if (!accessToken) return;
    void listBookingsFiltered(
      accessToken,
      { branchId: branchApiId, period: "30d" },
      { maxResults: 5 }
    ).then((r) => setRecentBookings(r.bookings));
  };

  return (
    <>
      <DashboardHeader
        title="Operations overview"
        subtitle="Live occupancy, today's collections, and property alerts"
        actions={
          <ManualBookingTrigger
            hotelId={hotelId}
            hotelName={hotelName}
            viewAll={viewAll}
            onCreated={handleRefreshAll}
          />
        }
      />
      <PageContent>
        {!dataLoaded && isRefreshing && (
          <p className="text-sm text-muted">Loading live data from server…</p>
        )}
        {dataError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {dataError}
          </p>
        )}
        {statsError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {statsError}
          </p>
        )}
        {unauthorized && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You tried to open a module your role cannot access. Use the sidebar for your assigned areas.
          </div>
        )}

        <StatsGrid stats={stats ?? null} loading={statsLoading} />

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="card-manager p-3 sm:p-4 lg:col-span-2">
            <h2 className="font-display text-base mb-4">Recent bookings (live feed)</h2>
            <BookingTable bookings={recentBookings} compact />
          </div>
          <div>
            <h2 className="font-display text-base mb-3">Alerts</h2>
            <NotificationsPanel
              notifications={scopedNotifications}
              onMarkRead={markNotificationRead}
            />
          </div>
        </div>

        <div className="card-manager p-3 sm:p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-base">
                Collections & donor savings
                {collections?.period
                  ? ` (${collections.period.start} – ${collections.period.end})`
                  : ""}
              </h2>
              <p className="mt-1 text-xs text-muted">
                Paid bookings by payment date for the selected period.
              </p>
            </div>
            <PeriodFilter value={chartPeriod} onChange={setChartPeriod} />
          </div>
          {chartError && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {chartError}
            </p>
          )}
          <div className="h-52 sm:h-64">
            {chartLoading ? (
              <p className="text-sm text-muted">Loading chart…</p>
            ) : revenueChart.length === 0 ? (
              <p className="text-sm text-muted">No revenue data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5e6ca" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Bar dataKey="revenue" fill="#7f1d1d" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="donorSavings"
                    fill="#c9a84c"
                    name="Donor savings"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </PageContent>
    </>
  );
}
