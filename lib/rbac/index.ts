export type UserRole = "super_admin" | "admin";

export type Permission =
  | "admins.view"
  | "admins.create"
  | "admins.edit"
  | "admins.delete"
  | "admins.assign_permissions"
  | "hotels.view"
  | "hotels.create"
  | "hotels.edit"
  | "hotels.delete"
  | "rooms.view"
  | "rooms.create"
  | "rooms.edit"
  | "rooms.delete"
  | "rooms.pricing"
  | "rooms.availability"
  | "bookings.view"
  | "bookings.create"
  | "bookings.update"
  | "bookings.checkin"
  | "bookings.checkout"
  | "bookings.cancel"
  | "bookings.extend"
  | "guests.view"
  | "guests.edit"
  | "donations.view"
  | "donations.manage"
  | "donors.view"
  | "donors.manage"
  | "donors.receipts"
  | "donors.certificates"
  | "coupons.view"
  | "coupons.manage"
  | "events.view"
  | "events.manage"
  | "cms.homepage"
  | "cms.news"
  | "cms.gallery"
  | "cms.pages"
  | "finance.transactions"
  | "finance.revenue"
  | "finance.refunds"
  | "analytics.dashboard"
  | "analytics.bookings"
  | "analytics.donations"
  | "payments.view"
  | "payments.manage"
  | "settings.view"
  | "settings.manage"
  | "support.view"
  | "support.resolve"
  | "audit.view"
  | "notifications.manage";

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  /** Set for hotel-scoped admins — they only see this property */
  hotelId?: string;
  hotelName?: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission: Permission;
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  "admins.view": "View admin accounts",
  "admins.create": "Create admins",
  "admins.edit": "Edit admins",
  "admins.delete": "Delete admins",
  "admins.assign_permissions": "Assign permissions",
  "hotels.view": "View hotels",
  "hotels.create": "Add hotels",
  "hotels.edit": "Edit hotels",
  "hotels.delete": "Delete hotels",
  "rooms.view": "View rooms",
  "rooms.create": "Create rooms",
  "rooms.edit": "Edit rooms",
  "rooms.delete": "Delete rooms",
  "rooms.pricing": "Manage pricing",
  "rooms.availability": "Manage availability",
  "bookings.view": "View bookings",
  "bookings.create": "Create manual bookings",
  "bookings.update": "Update bookings",
  "bookings.checkin": "Check-in",
  "bookings.checkout": "Check-out",
  "bookings.cancel": "Cancel bookings",
  "bookings.extend": "Stay extensions",
  "guests.view": "View guests",
  "guests.edit": "Edit guests",
  "donations.view": "View donations",
  "donations.manage": "Manage donations",
  "donors.view": "View donors (hotel)",
  "donors.manage": "Manage donors (platform)",
  "donors.receipts": "Generate receipts",
  "donors.certificates": "Generate certificates",
  "coupons.view": "View coupons",
  "coupons.manage": "Create & dispatch coupons",
  "events.view": "View events",
  "events.manage": "Manage events",
  "cms.homepage": "Homepage CMS",
  "cms.news": "News CMS",
  "cms.gallery": "Gallery CMS",
  "cms.pages": "Pages CMS",
  "finance.transactions": "Transactions",
  "finance.revenue": "Revenue reports",
  "finance.refunds": "Process refunds",
  "analytics.dashboard": "Dashboard analytics",
  "analytics.bookings": "Booking reports",
  "analytics.donations": "Donation reports",
  "payments.view": "View payments",
  "payments.manage": "Manage payments",
  "settings.view": "View settings",
  "settings.manage": "Platform settings",
  "support.view": "View support",
  "support.resolve": "Resolve tickets",
  "audit.view": "Audit logs",
  "notifications.manage": "Notifications",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];

export const ADMIN_PRESETS: Record<string, Permission[]> = {
  hotel_ops: [
    "hotels.view",
    "hotels.edit",
    "rooms.view",
    "rooms.edit",
    "rooms.availability",
    "bookings.view",
    "bookings.create",
    "bookings.update",
    "bookings.checkin",
    "bookings.checkout",
    "bookings.extend",
    "guests.view",
    "donors.view",
    "payments.view",
    "analytics.dashboard",
    "analytics.bookings",
    "support.view",
  ],
  donations: [
    "donations.view",
    "donations.manage",
    "donors.view",
    "donors.manage",
    "donors.receipts",
    "donors.certificates",
    "coupons.view",
    "coupons.manage",
    "analytics.donations",
  ],
  cms: ["cms.homepage", "cms.news", "cms.gallery", "cms.pages", "events.view"],
  finance: [
    "finance.transactions",
    "finance.revenue",
    "finance.refunds",
    "payments.view",
    "analytics.dashboard",
  ],
};

export const PORTAL_NAV: NavItem[] = [
  { href: "/branch", label: "Dashboard", icon: "LayoutDashboard", permission: "analytics.dashboard" },
  { href: "/branch/bookings", label: "Bookings", icon: "CalendarCheck", permission: "bookings.view" },
  { href: "/branch/extensions", label: "Stay extensions", icon: "CalendarClock", permission: "bookings.extend" },
  { href: "/branch/payments", label: "Payments", icon: "CreditCard", permission: "payments.view" },
  { href: "/branch/reports", label: "Reports", icon: "BarChart3", permission: "analytics.bookings" },
  { href: "/branch/support", label: "Support", icon: "Headphones", permission: "support.view" },
  { href: "/branch/activities", label: "Community", icon: "Sparkles", permission: "events.view" },
  { href: "/platform/donations", label: "Donations", icon: "Heart", permission: "donations.view" },
  { href: "/platform/donors", label: "Donor management", icon: "Shield", permission: "donors.manage" },
  { href: "/platform/donors/analytics", label: "Donor analytics", icon: "BarChart3", permission: "analytics.donations" },
  { href: "/platform/coupons", label: "Coupons", icon: "Ticket", permission: "coupons.manage" },
  { href: "/platform/cms", label: "CMS", icon: "FileText", permission: "cms.homepage" },
  { href: "/platform/finance", label: "Finance", icon: "Wallet", permission: "finance.transactions" },
  { href: "/platform/extensions", label: "Extension analytics", icon: "CalendarClock", permission: "audit.view" },
  { href: "/platform/branches", label: "Branch Management", icon: "Building", permission: "admins.view" },
  { href: "/platform/settings", label: "Platform settings", icon: "Settings", permission: "settings.view" },
];

export function permissionsForRole(role: UserRole): Permission[] {
  if (role === "super_admin") return ALL_PERMISSIONS;
  return [];
}

export function hasPermission(
  userPermissions: Permission[],
  required: Permission | Permission[]
): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => userPermissions.includes(p));
}

export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  return required.some((p) => userPermissions.includes(p));
}

export function navForUser(permissions: Permission[]): NavItem[] {
  return PORTAL_NAV.filter((item) => {
    if (item.href === "/branch") {
      return hasAnyPermission(permissions, [
        "analytics.dashboard",
        "bookings.view",
        "rooms.view",
        "donors.manage",
      ]);
    }
    if (item.href === "/platform/donations") {
      return hasAnyPermission(permissions, [
        "donations.view",
        "donations.manage",
        "donors.manage",
      ]);
    }
    if (item.href === "/platform/cms") {
      return hasAnyPermission(permissions, [
        "cms.homepage",
        "cms.news",
        "cms.gallery",
        "cms.pages",
        "events.view",
        "events.manage",
      ]);
    }
    if (item.href === "/platform/finance") {
      return hasAnyPermission(permissions, [
        "finance.transactions",
        "finance.revenue",
        "finance.refunds",
        "payments.view",
      ]);
    }
    return permissions.includes(item.permission);
  });
}

export function canAccessDashboard(permissions: Permission[]): boolean {
  return hasAnyPermission(permissions, [
    "analytics.dashboard",
    "bookings.view",
    "rooms.view",
    "donors.manage",
  ]);
}

