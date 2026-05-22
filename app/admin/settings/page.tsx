"use client";

import { PermissionGuard } from "@/components/rbac/permission-guard";
import { useAuthUser } from "@/stores/auth-store";

export default function PlatformSettingsPage() {
  const user = useAuthUser();

  return (
    <PermissionGuard permission="settings.view">
      <div className="p-6">
        <h1 className="font-display text-2xl text-champagne">Platform settings</h1>
        <p className="mt-1 text-sm text-muted">
          {user?.role === "super_admin"
            ? "Full system configuration access"
            : "View-only — changes require Super Admin"}
        </p>
        <div className="mt-8 card-manager p-6 text-sm text-muted">
          Payment gateways, notification rules, storage (R2/S3), and audit retention
          — connect to database settings table in production.
        </div>
      </div>
    </PermissionGuard>
  );
}
