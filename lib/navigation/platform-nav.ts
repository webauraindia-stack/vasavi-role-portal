import type { NavItem } from "@/lib/rbac";
import { PLATFORM } from "@/lib/routes";

export const PLATFORM_NAV: NavItem[] = [
  { href: PLATFORM.branches, label: "Branch management", icon: "Building", permission: "admins.view" },
  { href: PLATFORM.donations, label: "Donations", icon: "Heart", permission: "donations.view" },
  { href: PLATFORM.donors, label: "Donor management", icon: "Shield", permission: "donors.manage" },
  { href: PLATFORM.donorAnalytics, label: "Donor analytics", icon: "BarChart3", permission: "analytics.donations" },
  { href: PLATFORM.coupons, label: "Coupons", icon: "Ticket", permission: "coupons.manage" },
  { href: PLATFORM.cms, label: "CMS", icon: "FileText", permission: "cms.homepage" },
  { href: PLATFORM.finance, label: "Finance", icon: "Wallet", permission: "finance.transactions" },
  { href: PLATFORM.extensions, label: "Extension analytics", icon: "CalendarClock", permission: "audit.view" },
  { href: PLATFORM.settings, label: "Platform settings", icon: "Settings", permission: "settings.view" },
];
