import type { NavItem } from "@/lib/rbac";
import { BRANCH } from "@/lib/routes";

export const BRANCH_NAV: NavItem[] = [
  { href: BRANCH.home, label: "Dashboard", icon: "LayoutDashboard", permission: "analytics.dashboard" },
  { href: BRANCH.bookings, label: "Bookings", icon: "CalendarCheck", permission: "bookings.view" },
  { href: BRANCH.checkIn, label: "Check-in", icon: "CalendarCheck", permission: "bookings.checkin" },
  { href: BRANCH.extensions, label: "Stay extensions", icon: "CalendarClock", permission: "bookings.extend" },
  { href: BRANCH.payments, label: "Payments", icon: "CreditCard", permission: "payments.view" },
  { href: BRANCH.reports, label: "Reports", icon: "BarChart3", permission: "analytics.bookings" },
  { href: BRANCH.property, label: "Rooms", icon: "BedDouble", permission: "rooms.view" },
  { href: BRANCH.support, label: "Support", icon: "Headphones", permission: "support.view" },
  { href: BRANCH.activities, label: "Community", icon: "Sparkles", permission: "events.view" },
];
