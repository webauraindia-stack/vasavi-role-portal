"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Crown,
  Users,
  BedDouble,
  BarChart3,
  CreditCard,
  Headphones,
  Sparkles,
  QrCode,
  LogOut,
  ExternalLink,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useManagerStore } from "@/stores/manager-store";
import { MANAGER_HOTELS } from "@/lib/data/mock-data";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/check-in", label: "Check-in / out", icon: QrCode },
  { href: "/dashboard/donors", label: "Donors (view)", icon: Crown },
  { href: "/dashboard/members", label: "Members", icon: Users },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/support", label: "Support", icon: Headphones },
  { href: "/dashboard/activities", label: "Community", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useManagerStore((s) => s.logout);
  const hotelId = useManagerStore((s) => s.hotelId);
  const managerName = useManagerStore((s) => s.managerName);
  const notifications = useManagerStore((s) => s.notifications);
  const hotel = MANAGER_HOTELS.find((h) => h.id === hotelId);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-white flex flex-col min-h-screen border-r border-champagne/20">
      <div className="p-5 border-b border-white/10">
        <p className="font-display text-champagne-dark text-lg font-bold tracking-tight">
          Vasavi Super Admin
        </p>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
          Platform & hotel operations
        </p>
        {hotel && (
          <p className="text-xs text-white/70 mt-3 leading-snug">{hotel.name}</p>
        )}
        <p className="text-[10px] text-champagne-dark/80 mt-1">{managerName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                active
                  ? "bg-champagne text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {label === "Bookings" && unread > 0 && (
                <span className="ml-auto bg-champagne-dark text-charcoal text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/admin/donors"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-champagne-dark hover:bg-white/10"
        >
          <Shield className="h-3.5 w-3.5" />
          Donor management (full)
        </Link>
        <a
          href={process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-champagne-dark"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Hotel portal (vasavi-admin)
        </a>
        <a
          href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "http://localhost:3000"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-white/60 hover:text-champagne-dark"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Public booking site
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
