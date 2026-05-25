"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { BasePortalShell, usePortalGate } from "@/components/layout/base-portal-shell";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { PortalTopBar } from "@/components/layout/portal-top-bar";
import { OpsDataSync } from "@/components/sync/ops-data-sync";
import { DataScopeProvider } from "@/contexts/data-scope-context";
import { filterNav } from "@/lib/access";
import { PLATFORM_NAV } from "@/lib/navigation/platform-nav";
import { OPS_NAV } from "@/lib/navigation/ops-nav";
import { getStoreNotifications, useManagerStore } from "@/stores/manager-store";
import { useSignOut } from "@/hooks/use-sign-out";
import { useDataScope } from "@/contexts/data-scope-context";

function OperationsShellInner({ children }: { children: ReactNode }) {
  const signOut = useSignOut();
  const gate = usePortalGate();
  const user = gate.user!;
  const { hotelId } = useDataScope();
  const notifications = useManagerStore((s) => s.notifications);
  const unread = getStoreNotifications(hotelId, notifications).filter((n) => !n.read)
    .length;

  const sections = useMemo(() => {
    const ops = filterNav(OPS_NAV, user.permissions);
    const platform = filterNav(PLATFORM_NAV, user.permissions);
    return [
      { label: "Hotel operations", items: ops },
      { label: "Platform", items: platform },
    ].filter((s) => s.items.length > 0);
  }, [user.permissions]);

  return (
    <BasePortalShell
      sidebar={
        <PortalSidebar
          user={user}
          title="Vasavi Super Admin"
          subtitle="Cross-property operations"
          sections={sections}
          onLogout={() => void signOut()}
          unread={unread}
        />
      }
    >
      <OpsDataSync />
      <PortalTopBar user={user} />
      {children}
    </BasePortalShell>
  );
}

export function OperationsShell({ children }: { children: ReactNode }) {
  const gate = usePortalGate();

  useEffect(() => {
    if (gate.user?.role === "super_admin" && useManagerStore.getState().hotelId !== "all") {
      useManagerStore.getState().setHotelId("all");
    }
  }, [gate.user]);

  if (!gate.user || gate.user.role !== "super_admin") {
    return null;
  }

  return (
    <DataScopeProvider mode="operations" user={gate.user}>
      <OperationsShellInner>{children}</OperationsShellInner>
    </DataScopeProvider>
  );
}
