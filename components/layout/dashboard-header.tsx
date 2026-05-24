"use client";

import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useManagerStore, getStoreNotifications } from "@/stores/manager-store";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardHeader({
  title,
  subtitle,
  hidePropertyBar = false,
}: {
  title: string;
  subtitle?: string;
  /** Hide property selector / label (for branch-scoped admins). */
  hidePropertyBar?: boolean;
}) {
  const { hotelId, viewAll, setHotelId, branches } = useHotelScope();
  const accessToken = useAuthStore((s) => s.accessToken);
  const notifications = useManagerStore((s) => s.notifications);
  const isRefreshing = useManagerStore((s) => s.isRefreshing);
  const dataError = useManagerStore((s) => s.dataError);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);
  const scopedNotifications = getStoreNotifications(hotelId, notifications);
  const unread = scopedNotifications.filter((n) => !n.read).length;
  const { markAllNotificationsRead } = useManagerStore();

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-beige/40 px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          {dataError && <p className="mt-1 text-xs text-red-700">{dataError}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!hidePropertyBar && viewAll && setHotelId && (
            <select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
            >
              <option value="all">All properties</option>
              {branches.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.city} — {h.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isRefreshing || !accessToken}
            onClick={() => accessToken && void refreshFromApi(accessToken)}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
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
