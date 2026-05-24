import type { Permission, PortalUser, UserRole } from "@/lib/rbac";
import { ADMIN_PRESETS } from "@/lib/rbac";
import type { StaffUser } from "@/lib/api/staff-auth";

/** Map backend permission strings to portal RBAC permissions. */
const BACKEND_MAP: Record<string, Permission[]> = {
  "rooms.view": ["rooms.view"],
  "rooms.create": ["rooms.create", "rooms.edit"],
  "rooms.update": ["rooms.edit"],
  "bookings.view": ["bookings.view", "payments.view", "analytics.bookings", "rooms.view"],
  "bookings.create": ["bookings.create"],
  "bookings.update_status": [
    "bookings.update",
    "bookings.checkin",
    "bookings.checkout",
    "bookings.extend",
  ],
  "bookings.cancel": ["bookings.cancel"],
  "checkin.manage": ["bookings.checkin", "bookings.checkout"],
  "donors.verify": ["donors.view", "guests.view"],
  "donors.view": ["donors.view", "donors.manage", "donations.view"],
  "donors.create": ["donors.manage", "donations.manage"],
  "donors.update": ["donors.manage"],
  "coupons.view": ["donors.view"],
  "coupons.create": ["donors.manage"],
  "coupons.dispatch": ["donors.manage"],
  "coupons.redeem": ["bookings.update"],
  "branches.view": ["hotels.view", "rooms.view"],
  "branches.create": ["hotels.create"],
  "branches.update": ["hotels.edit"],
  "branches.assign_admin": ["admins.view", "admins.create"],
  "donations.view": ["donations.view"],
  "donations.create": ["donations.manage"],
  "extensions.view": ["bookings.extend"],
  "extensions.manage": ["bookings.extend"],
  "analytics.view": ["analytics.dashboard", "analytics.donations"],
};

const ALL_PERMISSIONS = Object.values(BACKEND_MAP).flat();

function mapPermissions(backend: string[], role: UserRole): Permission[] {
  if (role === "super_admin") {
    return [...new Set(ALL_PERMISSIONS)];
  }
  const out = new Set<Permission>();
  for (const key of backend) {
    for (const p of BACKEND_MAP[key] ?? []) {
      out.add(p);
    }
  }
  // Branch admins always receive hotel-operations capabilities (rooms, manual booking).
  if (role === "admin") {
    for (const p of ADMIN_PRESETS.hotel_ops) {
      out.add(p);
    }
  }
  return [...out];
}

export function portalUserFromStaff(data: StaffUser): PortalUser {
  const role: UserRole = data.role === "super_admin" ? "super_admin" : "admin";
  return {
    id: data.id,
    email: `${data.phone}@vasavi.local`,
    name: data.name,
    role,
    permissions: mapPermissions(data.permissions, role),
    hotelId: data.branch?.id,
    hotelName: data.branch?.name,
  };
}
