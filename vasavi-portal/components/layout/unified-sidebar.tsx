"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  Crown,
  ExternalLink,
  FileText,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navForUser, type NavItem, type PortalUser } from "@/lib/rbac";
import { isHotelScopedAdmin } from "@/lib/hotel-scope";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { getStoreNotifications, useManagerStore } from "@/stores/manager-store";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  QrCode,
  Crown,
  Users,
  BedDouble,
  CreditCard,
  BarChart3,
  Headphones,
  Sparkles,
  Shield,
  Settings,
  UserCog,
  Heart,
  FileText,
  Wallet,
};

const PLATFORM_HREFS = new Set([
  "/admin/donations",
  "/admin/donors",
  "/admin/donors/analytics",
  "/admin/cms",
  "/admin/finance",
  "/admin/extensions",
  "/admin/admins",
  "/admin/settings",
]);

function NavLink({
  item,
  pathname,
  unread,
}: {
  item: NavItem;
  pathname: string;
  unread: number;
}) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  const active =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
        active
          ? "bg-champagne text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
      {item.href === "/dashboard/bookings" && unread > 0 && (
        <span className="ml-auto bg-champagne-dark text-charcoal text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {unread}
        </span>
      )}
    </Link>
  );
}

export function UnifiedSidebar({
  user,
  onLogout,
}: {
  user: PortalUser;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { hotelId } = useHotelScope();
  const notifications = useManagerStore((s) => s.notifications);
  const unread = getStoreNotifications(hotelId, notifications).filter((n) => !n.read)
    .length;
  const navItems = useMemo(() => navForUser(user.permissions), [user.permissions]);

  const hotelNav = navItems.filter((i) => !PLATFORM_HREFS.has(i.href));
  const platformNav = navItems.filter((i) => PLATFORM_HREFS.has(i.href));

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-white min-h-screen border-r border-champagne/20">
      <div className="p-5 border-b border-white/10">
        <p className="font-display text-champagne-dark text-lg font-bold tracking-tight">
          Vasavi Super Admin
        </p>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
          Management portal
        </p>
        <p className="text-xs text-white/80 mt-3">{user.name}</p>
        <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase">
          {user.role.replace("_", " ")}
        </span>
        {isHotelScopedAdmin(user) && user.hotelName && (
          <p className="text-[10px] text-champagne-dark/90 mt-2 leading-snug">
            {user.hotelName}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navItems.length === 0 ? (
          <p className="px-3 text-xs text-white/50">No modules assigned</p>
        ) : (
          <>
            {hotelNav.length > 0 && (
              <div className="space-y-0.5">
                <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  Hotel operations
                </p>
                {hotelNav.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} unread={unread} />
                ))}
              </div>
            )}
            {platformNav.length > 0 && (
              <div className="space-y-0.5">
                <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                  Platform (Super Admin)
                </p>
                {platformNav.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} unread={unread} />
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <a
          href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-champagne-dark"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Public website
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
