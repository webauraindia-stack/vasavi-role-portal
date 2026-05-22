"use client";

import { ShieldOff } from "lucide-react";
import Link from "next/link";
import { hasAnyPermission, hasPermission, type Permission } from "@/lib/rbac";
import { useUserPermissions } from "@/stores/auth-store";

export function PermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permissions = useUserPermissions();
  const list = Array.isArray(permission) ? permission : [permission];
  const allowed =
    list.length > 1
      ? hasAnyPermission(permissions, list)
      : hasPermission(permissions, list[0]);

  if (allowed) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="mx-6 my-12 flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <ShieldOff className="h-10 w-10 text-amber-700" />
      <h2 className="mt-3 font-semibold text-amber-900">Access denied</h2>
      <p className="mt-1 text-sm text-amber-800">
        Your role does not include permission for this module.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 text-sm font-medium text-champagne hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
