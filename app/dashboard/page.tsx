"use client";

import { useMemo } from "react";
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
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { BookingTable } from "@/components/dashboard/booking-table";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import {
  useManagerStore,
  getStoreBookings,
  MOCK_REVENUE,
} from "@/stores/manager-store";

export default function DashboardOverviewPage() {
  const {
    bookings,
    rooms,
    hotelId,
    notifications,
    markNotificationRead,
    updateBookingStatus,
  } = useManagerStore();

  const filtered = useMemo(
    () => getStoreBookings(hotelId, bookings).slice(0, 5),
    [hotelId, bookings]
  );

  const filteredRooms = useMemo(
    () => (hotelId === "all" ? rooms : rooms.filter((r) => r.hotelId === hotelId)),
    [hotelId, rooms]
  );

  return (
    <>
      <DashboardHeader
        title="Operations overview"
        subtitle="Real-time bookings, donor benefits, and occupancy — Vasavi community hospitality"
      />
      <div className="p-6 space-y-6">
        <StatsGrid bookings={getStoreBookings(hotelId, bookings)} rooms={filteredRooms} />

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
              notifications={notifications.slice(0, 6)}
              onMarkRead={markNotificationRead}
            />
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-4">7-day revenue & donor savings</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE}>
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
