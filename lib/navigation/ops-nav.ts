import type { NavItem } from "@/lib/rbac";
import { OPS } from "@/lib/routes";

export const OPS_NAV: NavItem[] = [
  { href: OPS.home, label: "Operations overview", icon: "LayoutDashboard", permission: "analytics.dashboard" },
  { href: OPS.bookings, label: "Bookings", icon: "CalendarCheck", permission: "bookings.view" },
  { href: OPS.checkIn, label: "Check-in", icon: "CalendarCheck", permission: "bookings.checkin" },
  { href: OPS.extensions, label: "Stay extensions", icon: "CalendarClock", permission: "bookings.extend" },
  { href: OPS.payments, label: "Payments", icon: "CreditCard", permission: "payments.view" },
  { href: OPS.reports, label: "Reports", icon: "BarChart3", permission: "analytics.bookings" },
  { href: OPS.support, label: "Support", icon: "Headphones", permission: "support.view" },
  { href: OPS.activities, label: "Community", icon: "Sparkles", permission: "events.view" },
];
