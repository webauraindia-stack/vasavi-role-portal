"use client";

import { useMemo } from "react";
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
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { BookingTable } from "@/components/dashboard/booking-table";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import {
  useManagerStore,
  getStoreBookings,
  getStoreRooms,
  getStoreNotifications,
  revenueFromBookings,
} from "@/stores/manager-store";

export default function DashboardOverviewPage() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";
  const { hotelId, hotelName, viewAll } = useHotelScope();
  const {
    bookings,
    rooms,
    notifications,
    markNotificationRead,
    updateBookingStatus,
    dataLoaded,
    isRefreshing,
    dataError,
  } = useManagerStore();

  const filteredBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [hotelId, bookings]
  );

  const filtered = useMemo(
    () => filteredBookings.slice(0, 5),
    [filteredBookings]
  );

  const filteredRooms = useMemo(
    () => getStoreRooms(hotelId, rooms),
    [hotelId, rooms]
  );

  const scopedNotifications = useMemo(
    () => getStoreNotifications(hotelId, notifications).slice(0, 6),
    [hotelId, notifications]
  );

  const revenueChart = useMemo(
    () => revenueFromBookings(filteredBookings),
    [filteredBookings]
  );

  return (
    <>
      <DashboardHeader
        title="Operations overview"
        subtitle="Real-time bookings, donor benefits, and occupancy — Vasavi community hospitality"
      />
      <div className="p-6 space-y-6">
        {!dataLoaded && isRefreshing && (
          <p className="text-sm text-muted">Loading live data from server…</p>
        )}
        {dataError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {dataError}
          </p>
        )}
        {unauthorized && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You tried to open a module your role cannot access. Use the sidebar for your assigned areas.
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <ManualBookingTrigger
            hotelId={hotelId}
            hotelName={hotelName}
            viewAll={viewAll}
          />
        </div>
        <StatsGrid bookings={filteredBookings} rooms={filteredRooms} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-manager p-4">
            <h2 className="font-display text-base mb-4">Recent bookings (live feed)</h2>
            <BookingTable
              bookings={filtered}
              onStatusChange={updateBookingStatus}
              compact
            />
          </div>
          <div>
            <h2 className="font-display text-base mb-3">Alerts</h2>
            <NotificationsPanel
              notifications={scopedNotifications}
              onMarkRead={markNotificationRead}
            />
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-4">7-day revenue & donor savings</h2>
          <div className="h-64">
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
          </div>
        </div>
      </div>
    </>
  );
}
