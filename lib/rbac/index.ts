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
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", permission: "analytics.dashboard" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "CalendarCheck", permission: "bookings.view" },
  { href: "/dashboard/extensions", label: "Stay extensions", icon: "CalendarClock", permission: "bookings.extend" },
  { href: "/dashboard/payments", label: "Payments", icon: "CreditCard", permission: "payments.view" },
  { href: "/dashboard/reports", label: "Reports", icon: "BarChart3", permission: "analytics.bookings" },
  { href: "/dashboard/support", label: "Support", icon: "Headphones", permission: "support.view" },
  { href: "/dashboard/activities", label: "Community", icon: "Sparkles", permission: "events.view" },
  { href: "/admin/donations", label: "Donations", icon: "Heart", permission: "donations.view" },
  { href: "/admin/donors", label: "Donor management", icon: "Shield", permission: "donors.manage" },
  { href: "/admin/donors/analytics", label: "Donor analytics", icon: "BarChart3", permission: "analytics.donations" },
  { href: "/admin/coupons", label: "Coupons", icon: "Ticket", permission: "coupons.manage" },
  { href: "/admin/cms", label: "CMS", icon: "FileText", permission: "cms.homepage" },
  { href: "/admin/finance", label: "Finance", icon: "Wallet", permission: "finance.transactions" },
  { href: "/admin/extensions", label: "Extension analytics", icon: "CalendarClock", permission: "audit.view" },
  { href: "/admin/branches", label: "Branch Management", icon: "Building", permission: "admins.view" },
  { href: "/admin/settings", label: "Platform settings", icon: "Settings", permission: "settings.view" },
];

/** Route prefix → required permission (most specific match wins) */
export const ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin/donations", permission: "donations.view" },
  { prefix: "/admin/cms", permission: "cms.homepage" },
  { prefix: "/admin/finance", permission: "finance.transactions" },
  { prefix: "/admin/donors/analytics", permission: "analytics.donations" },
  { prefix: "/admin/coupons", permission: "coupons.manage" },
  { prefix: "/admin/donors/new", permission: "donors.manage" },
  { prefix: "/admin/donors", permission: "donors.manage" },
  { prefix: "/admin/settings", permission: "settings.view" },
  { prefix: "/dashboard/extensions", permission: "bookings.extend" },
  { prefix: "/admin/extensions", permission: "audit.view" },
  { prefix: "/dashboard/bookings", permission: "bookings.view" },
  { prefix: "/dashboard/payments", permission: "payments.view" },
  { prefix: "/dashboard/reports", permission: "analytics.bookings" },
  { prefix: "/dashboard/support", permission: "support.view" },
  { prefix: "/dashboard/activities", permission: "events.view" },
  { prefix: "/dashboard", permission: "analytics.dashboard" },
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
    if (item.href === "/dashboard") {
      return hasAnyPermission(permissions, [
        "analytics.dashboard",
        "bookings.view",
        "rooms.view",
        "donors.manage",
      ]);
    }
    if (item.href === "/admin/donations") {
      return hasAnyPermission(permissions, [
        "donations.view",
        "donations.manage",
        "donors.manage",
      ]);
    }
    if (item.href === "/admin/cms") {
      return hasAnyPermission(permissions, [
        "cms.homepage",
        "cms.news",
        "cms.gallery",
        "cms.pages",
        "events.view",
        "events.manage",
      ]);
    }
    if (item.href === "/admin/finance") {
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

export function defaultLandingPath(permissions: Permission[]): string {
  const sorted = [...permissions].sort().join(",");
  for (const [key, preset] of Object.entries(ADMIN_PRESETS)) {
    if ([...preset].sort().join(",") === sorted) {
      if (key === "donations") return "/admin/donations";
      if (key === "cms") return "/admin/cms";
      if (key === "finance") return "/admin/finance";
      break;
    }
  }
  const nav = navForUser(permissions);
  return nav[0]?.href ?? "/login";
}

export function permissionForPath(pathname: string): Permission | null {
  const sorted = [...ROUTE_PERMISSIONS].sort(
    (a, b) => b.prefix.length - a.prefix.length
  );
  for (const { prefix, permission } of sorted) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return permission;
    }
  }
  return null;
}

export type PortalAccessContext = {
  hotelId?: string;
};

export function branchRoomsHref(branchId: string): string {
  return `/admin/branches/${branchId}`;
}

/** Branch-scoped nav for hotel admins (rooms live under branch detail). */
export function extraNavForUser(user: PortalUser): NavItem[] {
  if (
    user.role === "admin" &&
    user.hotelId &&
    user.permissions.includes("rooms.view")
  ) {
    return [
      {
        href: branchRoomsHref(user.hotelId),
        label: "Rooms",
        icon: "BedDouble",
        permission: "rooms.view",
      },
    ];
  }
  return [];
}

export function canAccessPath(
  pathname: string,
  permissions: Permission[],
  context?: PortalAccessContext
): boolean {
  const path = pathname.split("?")[0];
  if (path === "/profile") return true;
  if (path === "/dashboard/rooms") {
    return permissions.includes("rooms.view");
  }
  if (path === "/admin/branches") {
    return permissions.includes("admins.view");
  }
  const branchDetail = path.match(/^\/admin\/branches\/([^/]+)$/);
  if (branchDetail) {
    if (permissions.includes("admins.view")) return true;
    const branchId = branchDetail[1];
    return (
      permissions.includes("rooms.view") &&
      !!context?.hotelId &&
      context.hotelId === branchId
    );
  }
  if (path === "/dashboard") {
    return canAccessDashboard(permissions);
  }
  if (path === "/admin/donations" || path.startsWith("/admin/donations/")) {
    return hasAnyPermission(permissions, [
      "donations.view",
      "donations.manage",
      "donors.manage",
    ]);
  }
  if (path === "/admin/cms" || path.startsWith("/admin/cms/")) {
    return hasAnyPermission(permissions, [
      "cms.homepage",
      "cms.news",
      "cms.gallery",
      "cms.pages",
      "events.view",
      "events.manage",
    ]);
  }
  if (path === "/admin/finance" || path.startsWith("/admin/finance/")) {
    return hasAnyPermission(permissions, [
      "finance.transactions",
      "finance.revenue",
      "finance.refunds",
      "payments.view",
    ]);
  }
  const required = permissionForPath(path);
  if (!required) return true;
  return permissions.includes(required);
}
