import { ADMIN_PRESETS, PERMISSION_LABELS, type Permission, type PortalUser } from "@/lib/rbac";
import { isHotelScopedAdmin } from "@/lib/hotel-scope";

const PRESET_LABELS: Record<string, string> = {
  hotel_ops: "Hotel Operations Admin",
  donations: "Donations Admin",
  cms: "CMS Admin",
  finance: "Finance Admin",
};

function presetKey(permissions: Permission[]): string | null {
  const sorted = [...permissions].sort().join(",");
  for (const [key, preset] of Object.entries(ADMIN_PRESETS)) {
    if ([...preset].sort().join(",") === sorted) return key;
  }
  return null;
}

export function getAccountTypeLabel(user: PortalUser): string {
  if (user.role === "super_admin") return "Super Admin";
  const key = presetKey(user.permissions);
  if (key && PRESET_LABELS[key]) return PRESET_LABELS[key];
  if (user.hotelId) return "Hotel Admin";
  return "Admin";
}

export function getPortalAccessSummary(user: PortalUser): string {
  if (user.role === "super_admin") {
    return "Full platform access — all hotels, donor management, admin accounts, and settings.";
  }
  if (isHotelScopedAdmin(user)) {
    return `Hotel-scoped access — operations, bookings, and guests for ${user.hotelName ?? "your assigned property"} only.`;
  }
  const key = presetKey(user.permissions);
  if (key === "donations") {
    return "Platform donor management — create and manage donors, receipts, and donation analytics.";
  }
  if (key === "cms") {
    return "Content management — homepage, news, gallery, pages, and community events.";
  }
  if (key === "finance") {
    return "Finance modules — transactions, revenue reports, refunds, and payments.";
  }
  return "Limited admin access based on assigned permissions.";
}

export function getRoleBadgeClass(user: PortalUser): string {
  if (user.role === "super_admin") {
    return "bg-champagne/15 text-champagne-dark border-champagne/30";
  }
  if (isHotelScopedAdmin(user)) {
    return "bg-emerald-50 text-emerald-900 border-emerald-200";
  }
  return "bg-violet-50 text-violet-900 border-violet-200";
}

export function formatPermissionList(permissions: Permission[]): string[] {
  return permissions.map((p) => PERMISSION_LABELS[p] ?? p);
}
