import {
  ADMIN_PRESETS,
  permissionsForRole,
  type PortalUser,
} from "@/lib/rbac";

export interface DemoAccount {
  password: string;
  user: PortalUser;
}

export const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  "super@vasavi.org": {
    password: "superadmin123",
    user: {
      id: "user-sa",
      email: "super@vasavi.org",
      name: "Platform Super Admin",
      role: "super_admin",
      permissions: permissionsForRole("super_admin"),
    },
  },
  "hotel@vasavi.org": {
    password: "admin123",
    user: {
      id: "user-hotel",
      email: "hotel@vasavi.org",
      name: "Hotel Operations Admin",
      role: "admin",
      permissions: ADMIN_PRESETS.hotel_ops,
      hotelId: "1",
      hotelName: "Sri Vasavi Nityannadana Residency",
    },
  },
  "donor@vasavi.org": {
    password: "admin123",
    user: {
      id: "user-donor",
      email: "donor@vasavi.org",
      name: "Donations Admin",
      role: "admin",
      permissions: ADMIN_PRESETS.donations,
    },
  },
  "cms@vasavi.org": {
    password: "admin123",
    user: {
      id: "user-cms",
      email: "cms@vasavi.org",
      name: "CMS Admin",
      role: "admin",
      permissions: ADMIN_PRESETS.cms,
    },
  },
  "finance@vasavi.org": {
    password: "admin123",
    user: {
      id: "user-finance",
      email: "finance@vasavi.org",
      name: "Finance Admin",
      role: "admin",
      permissions: ADMIN_PRESETS.finance,
    },
  },
};

export function authenticate(
  email: string,
  password: string
): PortalUser | null {
  const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
  if (!account || account.password !== password) return null;
  return account.user;
}
