"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { BasePortalShell, usePortalGate } from "@/components/layout/base-portal-shell";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { DataScopeProvider } from "@/contexts/data-scope-context";
import { filterNav } from "@/lib/access";
import { BRANCH_NAV } from "@/lib/navigation/branch-nav";
import { PLATFORM_NAV } from "@/lib/navigation/platform-nav";
import { OPS_NAV } from "@/lib/navigation/ops-nav";
import { useSignOut } from "@/hooks/use-sign-out";

/** Profile is shared; sidebar follows the signed-in role. */
export function ProfileShell({ children }: { children: ReactNode }) {
  const gate = usePortalGate();
  const signOut = useSignOut();

  if (!gate.user) return null;

  const user = gate.user;
  const isSuperAdmin = user.role === "super_admin";

  const sections = useMemo(() => {
    if (!isSuperAdmin) {
      return undefined;
    }
    return [
      { label: "Hotel operations", items: filterNav(OPS_NAV, user.permissions) },
      { label: "Platform", items: filterNav(PLATFORM_NAV, user.permissions) },
    ].filter((s) => s.items.length > 0);
  }, [isSuperAdmin, user.permissions]);

  const navItems = useMemo(() => {
    if (isSuperAdmin) return undefined;
    return filterNav(BRANCH_NAV, user.permissions);
  }, [isSuperAdmin, user.permissions]);

  const shell = (
    <BasePortalShell
      mobileTitle={isSuperAdmin ? "Vasavi Platform" : "Vasavi Branch"}
      sidebar={
        <PortalSidebar
          user={user}
          title={isSuperAdmin ? "Vasavi Super Admin" : "Vasavi Branch"}
          subtitle={isSuperAdmin ? "Management portal" : "Property operations"}
          navItems={navItems}
          sections={sections}
          onLogout={() => void signOut()}
        />
      }
    >
      {children}
    </BasePortalShell>
  );

  if (isSuperAdmin) {
    return (
      <DataScopeProvider mode="operations" user={user}>
        {shell}
      </DataScopeProvider>
    );
  }

  return (
    <DataScopeProvider mode="branch" user={user}>
      {shell}
    </DataScopeProvider>
  );
}
