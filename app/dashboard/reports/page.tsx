"use client";

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
import { formatCurrency } from "@/lib/utils";
import { MOCK_REVENUE } from "@/stores/manager-store";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function ReportsPage() {
  const { bookings, hotelId } = useManagerStore();
  const filtered = getStoreBookings(hotelId, bookings);
  const couponRedemptions = filtered.reduce((s, b) => s + b.appliedCoupons.length, 0);
  const freeStays = filtered.filter((b) => b.paymentStatus === "free_stay").length;

  return (
    <>
      <DashboardHeader
        title="Reports & analytics"
        subtitle="Occupancy, festival rush, donation impact, and coupon redemption"
      />
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Coupon redemptions</p>
            <p className="font-display text-2xl font-bold">{couponRedemptions}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Free stays issued</p>
            <p className="font-display text-2xl font-bold">{freeStays}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold uppercase text-muted">Festival period</p>
            <p className="font-display text-lg font-bold text-champagne">Vasavi Utsav</p>
            <p className="text-xs text-muted">May 22–26 · High occupancy expected</p>
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-4">Daily revenue trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_REVENUE}>
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
          </div>
        </div>

        <div className="card-manager p-4">
          <h2 className="font-display text-base mb-3">Donation & KCGF impact (mock)</h2>
          <p className="text-sm text-muted leading-relaxed">
            This week, donor-tier discounts and coupons reduced guest payments by{" "}
            <strong className="text-champagne">
              {formatCurrency(
                filtered.reduce(
                  (s, b) => s + b.tierDiscount + b.couponDiscount + b.walletApplied,
                  0
                )
              )}
            </strong>{" "}
            while maintaining full occupancy for community members and pilgrims.
          </p>
        </div>
      </div>
    </>
  );
}
