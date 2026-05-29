"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAccountTypeLabel } from "@/lib/portal-profile";
import type { PortalUser } from "@/lib/rbac";
import { getStoreNotifications, useManagerStore } from "@/stores/manager-store";

export function PortalProfileActions({
  user,
  compact = false,
}: {
  user: PortalUser;
  /** Mobile app bar: icon-only profile chip. */
  compact?: boolean;
}) {
  const hotelId = useManagerStore((s) => s.hotelId);
  const notifications = useManagerStore((s) => s.notifications);
  const markAllNotificationsRead = useManagerStore((s) => s.markAllNotificationsRead);
  const scoped = getStoreNotifications(hotelId, notifications);
  const unread = scoped.filter((n) => !n.read).length;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative h-10 w-10 shrink-0 p-0"
        onClick={markAllNotificationsRead}
        title={unread > 0 ? `${unread} unread alerts` : "Notifications"}
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-0.5 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {compact ? (
        <Link
          href="/profile"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-beige/60 bg-surface text-xs font-bold text-charcoal"
          title="Your profile"
        >
          {initials || <User className="h-4 w-4" />}
        </Link>
      ) : (
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-full border border-beige/60 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-charcoal hover:border-champagne/50 hover:bg-champagne/5"
          title="Your profile"
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
              user.role === "super_admin"
                ? "bg-champagne text-white"
                : "bg-sidebar text-champagne-dark"
            )}
          >
            {initials || <User className="h-4 w-4" />}
          </span>
          <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
          <span className="hidden text-[10px] font-normal text-muted md:inline">
            · {getAccountTypeLabel(user)}
          </span>
        </Link>
      )}
    </div>
  );
}
