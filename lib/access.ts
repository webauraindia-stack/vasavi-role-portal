import {
  hasAnyPermission,
  hasPermission,
  type Permission,
  type PortalUser,
} from "@/lib/rbac";
import { BRANCH, OPS, PLATFORM, AUTH } from "@/lib/routes";

const PLATFORM_PREFIXES = [
  PLATFORM.branches,
  PLATFORM.donors,
  PLATFORM.donations,
  PLATFORM.coupons,
  PLATFORM.cms,
  PLATFORM.finance,
  PLATFORM.settings,
  PLATFORM.extensions,
  PLATFORM.home,
];

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + "/");
}

export function canAccessBranchSurface(user: PortalUser): boolean {
  return user.role === "admin";
}

export function canAccessPlatformSurface(user: PortalUser): boolean {
  return user.role === "super_admin";
}

export function canAccessPath(
  pathname: string,
  user: PortalUser
): boolean {
  const path = pathname.split("?")[0];
  const { permissions: perms } = user;

  if (path === AUTH.profile || path === AUTH.login) return true;

  /** Legacy bookmarks; layouts redirect to canonical paths. */
  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    return true;
  }

  if (matchesPrefix(path, "/branch")) {
    if (!canAccessBranchSurface(user)) return false;
    return canAccessBranchRoute(path, perms, user);
  }

  if (matchesPrefix(path, "/platform/operations")) {
    if (!canAccessPlatformSurface(user)) return false;
    return canAccessOpsRoute(path, perms);
  }

  if (matchesPrefix(path, "/platform")) {
    if (!canAccessPlatformSurface(user)) return false;
    return canAccessPlatformRoute(path, perms);
  }

  return false;
}

function canAccessBranchRoute(
  path: string,
  perms: Permission[],
  user: PortalUser
): boolean {
  if (path === BRANCH.property) {
    return perms.includes("rooms.view") && !!user.hotelId;
  }
  if (path === BRANCH.home) {
    return hasAnyPermission(perms, [
      "analytics.dashboard",
      "bookings.view",
      "rooms.view",
    ]);
  }
  if (path === BRANCH.bookings) return perms.includes("bookings.view");
  if (path === BRANCH.checkIn) return perms.includes("bookings.checkin");
  if (path === BRANCH.payments) return perms.includes("payments.view");
  if (path === BRANCH.reports) return perms.includes("analytics.bookings");
  if (path === BRANCH.extensions) return perms.includes("bookings.extend");
  if (path === BRANCH.support) return perms.includes("support.view");
  if (path === BRANCH.activities) return perms.includes("events.view");
  return false;
}

function canAccessOpsRoute(path: string, perms: Permission[]): boolean {
  if (path === OPS.home) {
    return hasAnyPermission(perms, ["analytics.dashboard", "bookings.view"]);
  }
  if (path === OPS.bookings) return perms.includes("bookings.view");
  if (path === OPS.checkIn) return perms.includes("bookings.checkin");
  if (path === OPS.payments) return perms.includes("payments.view");
  if (path === OPS.reports) return perms.includes("analytics.bookings");
  if (path === OPS.extensions) return perms.includes("bookings.extend");
  if (path === OPS.support) return perms.includes("support.view");
  if (path === OPS.activities) return perms.includes("events.view");
  return false;
}

function canAccessPlatformRoute(path: string, perms: Permission[]): boolean {
  if (matchesPrefix(path, PLATFORM.branches)) {
    return perms.includes("admins.view");
  }
  if (matchesPrefix(path, PLATFORM.donations)) {
    return hasAnyPermission(perms, [
      "donations.view",
      "donations.manage",
      "donors.manage",
    ]);
  }
  if (matchesPrefix(path, PLATFORM.donors)) {
    return perms.includes("donors.manage");
  }
  if (matchesPrefix(path, PLATFORM.cms)) {
    return hasAnyPermission(perms, [
      "cms.homepage",
      "cms.news",
      "cms.gallery",
      "cms.pages",
    ]);
  }
  if (matchesPrefix(path, PLATFORM.finance)) {
    return hasAnyPermission(perms, [
      "finance.transactions",
      "finance.revenue",
      "finance.refunds",
    ]);
  }
  if (path === PLATFORM.settings) return perms.includes("settings.view");
  if (path === PLATFORM.coupons) return perms.includes("coupons.manage");
  if (path === PLATFORM.extensions) return perms.includes("audit.view");
  if (path === PLATFORM.home) return perms.includes("admins.view");
  return false;
}

export function filterNav<T extends { permission: Permission }>(
  items: T[],
  permissions: Permission[]
): T[] {
  return items.filter((item) => permissions.includes(item.permission));
}
