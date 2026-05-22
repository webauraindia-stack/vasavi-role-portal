"use client";

import { hasAnyPermission, hasPermission, type Permission } from "@/lib/rbac";
import { useUserPermissions } from "@/stores/auth-store";

/** Hide UI actions when permission missing */
export function Can({
  permission,
  children,
}: {
  permission: Permission | Permission[];
  children: React.ReactNode;
}) {
  const permissions = useUserPermissions();
  const list = Array.isArray(permission) ? permission : [permission];
  const allowed =
    list.length > 1
      ? hasAnyPermission(permissions, list)
      : hasPermission(permissions, list[0]);
  if (!allowed) return null;
  return <>{children}</>;
}
