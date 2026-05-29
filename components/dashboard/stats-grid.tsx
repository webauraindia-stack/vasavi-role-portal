"use client";

import {
  CalendarCheck,
  Crown,
  IndianRupee,
  BedDouble,
  Percent,
  Users,
} from "lucide-react";
import type { DashboardAnalyticsStats } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

export function StatsGrid({
  stats,
  loading,
}: {
  stats: DashboardAnalyticsStats | null;
  loading?: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse h-24 bg-beige/20" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Collected today",
      value: stats.today_revenue_display,
      sub: `${stats.today_collected_bookings ?? 0} payment(s) today · rolling 7d ${stats.revenue_7d_display ?? "—"}`,
      icon: IndianRupee,
      tone: "text-champagne",
    },
    {
      label: "Active bookings",
      value: String(stats.active_bookings),
      icon: CalendarCheck,
      tone: "text-charcoal",
    },
    {
      label: "Check-ins today",
      value: String(stats.check_ins_today),
      icon: Users,
      tone: "text-charcoal",
    },
    {
      label: "Occupancy",
      value: `${stats.occupancy_percent}%`,
      sub: `${stats.available_rooms} rooms free`,
      icon: BedDouble,
      tone: "text-charcoal",
    },
    {
      label: "Donor savings (rolling 7d)",
      value: stats.donor_savings_display,
      icon: Crown,
      tone: "text-champagne-dark",
    },
    {
      label: "VIP arrivals",
      value: String(stats.vip_arrivals),
      icon: Percent,
      tone: "text-charcoal",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="stat-card">
            <Icon className={cn("h-4 w-4", s.tone)} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className={cn("font-display text-lg font-bold sm:text-xl", s.tone)}>{s.value}</p>
            {s.sub && <p className="text-[10px] text-muted">{s.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}
