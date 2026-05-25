import type { PortalUser, Permission } from "@/lib/rbac";
import { navForUser } from "@/lib/rbac";

/** Branch Admin surface (single property). */
export const BRANCH = {
  home: "/branch",
  bookings: "/branch/bookings",
  checkIn: "/branch/check-in",
  payments: "/branch/payments",
  reports: "/branch/reports",
  property: "/branch/property",
  extensions: "/branch/extensions",
  support: "/branch/support",
  activities: "/branch/activities",
} as const;

/** Super Admin platform modules. */
export const PLATFORM = {
  home: "/platform",
  branches: "/platform/branches",
  branchDetail: (id: string) => `/platform/branches/${id}`,
  donors: "/platform/donors",
  donorNew: "/platform/donors/new",
  donorDetail: (id: string) => `/platform/donors/${id}`,
  donorAnalytics: "/platform/donors/analytics",
  donations: "/platform/donations",
  coupons: "/platform/coupons",
  cms: "/platform/cms",
  finance: "/platform/finance",
  settings: "/platform/settings",
  extensions: "/platform/extensions",
} as const;

/** Super Admin cross-property hotel operations. */
export const OPS = {
  home: "/platform/operations",
  bookings: "/platform/operations/bookings",
  checkIn: "/platform/operations/check-in",
  payments: "/platform/operations/payments",
  reports: "/platform/operations/reports",
  extensions: "/platform/operations/extensions",
  support: "/platform/operations/support",
  activities: "/platform/operations/activities",
} as const;

export const AUTH = {
  login: "/login",
  profile: "/profile",
} as const;

/** Default home after login by role. */
export function homePathForUser(user: PortalUser): string {
  if (user.role === "super_admin") {
    return OPS.home;
  }
  return BRANCH.home;
}

/** Rooms management URL for a branch admin. */
export function branchPropertyPath(branchId: string): string {
  return BRANCH.property;
}

/** Map legacy paths to new canonical paths. */
export function resolveLegacyRedirect(
  pathname: string,
  role: PortalUser["role"] | undefined
): string | null {
  const path = pathname.split("?")[0];

  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    const suffix = path === "/dashboard" ? "" : path.slice("/dashboard".length);
    return role === "super_admin"
      ? `/platform/operations${suffix || ""}`
      : `/branch${suffix || ""}`;
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    const suffix = path === "/admin" ? "" : path.slice("/admin".length);
    if (path === "/admin/login") return AUTH.login;
    return `/platform${suffix}`;
  }

  if (path === "/dashboard/rooms") {
    return role === "super_admin" ? OPS.home : BRANCH.property;
  }

  return null;
}

/** First allowed path from permissions (fallback for preset admins). */
export function defaultLandingPath(permissions: Permission[]): string {
  const nav = navForUser(permissions);
  const first = nav[0]?.href;
  if (!first) return AUTH.login;
  return first;
}
