"use client";

import { Bell, Radio, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useManagerStore } from "@/stores/manager-store";
import { MANAGER_HOTELS } from "@/lib/data/mock-data";

export function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const {
    notifications,
    liveFeedEnabled,
    toggleLiveFeed,
    simulateIncomingBooking,
    setHotelId,
    hotelId,
    markAllNotificationsRead,
  } = useManagerStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-beige/40 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input placeholder="Search bookings, guests…" className="pl-9 w-56 h-9" />
          </div>

          <select
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
          >
            <option value="all">All properties</option>
            {MANAGER_HOTELS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.city}
              </option>
            ))}
          </select>

          <Button
            variant={liveFeedEnabled ? "gold" : "outline"}
            size="sm"
            onClick={toggleLiveFeed}
            className="gap-1.5"
          >
            <Radio className={cn("h-3.5 w-3.5", liveFeedEnabled && "animate-pulse")} />
            Live feed
          </Button>

          <Button variant="outline" size="sm" onClick={simulateIncomingBooking}>
            + Simulate booking
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={markAllNotificationsRead}
            title={`${unread} unread`}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-champagne text-white text-[9px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
