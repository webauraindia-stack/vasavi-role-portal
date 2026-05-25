"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  ExternalLink,
  FileText,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, PortalUser } from "@/lib/rbac";
import { OPS } from "@/lib/routes";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  BedDouble,
  CreditCard,
  BarChart3,
  Headphones,
  Sparkles,
  Shield,
  Settings,
  Heart,
  FileText,
  Wallet,
  Ticket,
  Building: Building2,
};

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
    item.href === "/branch" || item.href === "/platform/operations"
      ? pathname === item.href
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
      {item.href.endsWith("/bookings") && unread > 0 && (
        <span className="ml-auto bg-champagne-dark text-charcoal text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {unread}
        </span>
      )}
    </Link>
  );
}

export function PortalSidebar({
  user,
  title,
  subtitle,
  navItems,
  sections,
  onLogout,
  unread = 0,
}: {
  user: PortalUser;
  title: string;
  subtitle: string;
  navItems?: NavItem[];
  sections?: { label: string; items: NavItem[] }[];
  onLogout: () => void;
  unread?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-white min-h-screen border-r border-champagne/20">
      <div className="p-5 border-b border-white/10">
        <p className="font-display text-champagne-dark text-lg font-bold tracking-tight">
          {title}
        </p>
        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
          {subtitle}
        </p>
        <p className="text-xs text-white/80 mt-3">{user.name}</p>
        {user.role === "admin" && user.hotelName && (
          <p className="text-[10px] text-champagne-dark/90 mt-2 leading-snug">
            {user.hotelName}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections ? (
          sections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                {section.label}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  unread={unread}
                />
              ))}
            </div>
          ))
        ) : navItems && navItems.length > 0 ? (
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                unread={unread}
              />
            ))}
          </div>
        ) : (
          <p className="px-3 text-xs text-white/50">No modules assigned</p>
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
