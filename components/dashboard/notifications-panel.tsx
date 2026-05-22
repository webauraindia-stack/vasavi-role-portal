"use client";

import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarClock,
  Crown,
  Gift,
  Wallet,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ManagerNotification, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationType, typeof Bell> = {
  new_booking: Calendar,
  vip_arrival: Crown,
  coupon_expiry: Gift,
  payment_pending: Wallet,
  low_inventory: AlertTriangle,
  festival_rush: Bell,
  stay_extension: CalendarClock,
};

export function NotificationsPanel({
  notifications,
  onMarkRead,
}: {
  notifications: ManagerNotification[];
  onMarkRead: (id: string) => void;
}) {
  return (
    <div className="card-manager divide-y divide-beige/40 max-h-[420px] overflow-y-auto">
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onMarkRead(n.id)}
            className={cn(
              "w-full text-left p-4 flex gap-3 hover:bg-surface/50 transition-colors",
              !n.read && "bg-champagne/5"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                n.priority === "high"
                  ? "bg-champagne/15 text-champagne"
                  : "bg-surface text-muted"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-charcoal">{n.title}</p>
              <p className="text-xs text-muted mt-0.5 leading-snug">{n.message}</p>
              <p className="text-[10px] text-muted mt-1">{formatDateTime(n.time)}</p>
            </div>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-champagne shrink-0 mt-2" />
            )}
          </button>
        );
      })}
    </div>
  );
}
