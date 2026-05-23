"use client";

import {
  CalendarCheck,
  Crown,
  IndianRupee,
  BedDouble,
  Percent,
  Users,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ManagerBooking, RoomInventory } from "@/lib/types";

export function StatsGrid({
  bookings,
  rooms,
}: {
  bookings: ManagerBooking[];
  rooms: RoomInventory[];
}) {
  const today = bookings.filter((b) => b.bookingStatus !== "cancelled");
  const revenue = today.reduce((s, b) => s + b.total, 0);
  const donorSavings = today.reduce(
    (s, b) => s + b.tierDiscount + b.couponDiscount + b.walletApplied,
    0
  );
  const checkInsToday = bookings.filter((b) => b.checkIn === "2026-05-20").length;
  const vip = bookings.filter((b) => b.isVip && b.bookingStatus === "confirmed").length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const available = rooms.filter((r) => r.status === "available").length;
  const occupancy = rooms.length
    ? Math.round((occupied / rooms.length) * 100)
    : 0;

  const stats = [
    {
      label: "Today's revenue",
      value: formatCurrency(revenue),
      icon: IndianRupee,
      tone: "text-champagne",
    },
    {
      label: "Active bookings",
      value: String(today.length),
      icon: CalendarCheck,
      tone: "text-charcoal",
    },
    {
      label: "Check-ins today",
      value: String(checkInsToday),
      icon: Users,
      tone: "text-charcoal",
    },
    {
      label: "Occupancy",
      value: `${occupancy}%`,
      sub: `${available} rooms free`,
      icon: BedDouble,
      tone: "text-charcoal",
    },
    {
      label: "Donor savings applied",
      value: formatCurrency(donorSavings),
      icon: Crown,
      tone: "text-champagne-dark",
    },
    {
      label: "VIP arrivals",
      value: String(vip),
      icon: Percent,
      tone: "text-charcoal",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="stat-card">
            <Icon className={cn("h-4 w-4", s.tone)} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className={cn("font-display text-xl font-bold", s.tone)}>{s.value}</p>
            {s.sub && <p className="text-[10px] text-muted">{s.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}
