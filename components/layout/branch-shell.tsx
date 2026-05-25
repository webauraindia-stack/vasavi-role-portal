"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BasePortalShell, usePortalGate } from "@/components/layout/base-portal-shell";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { PortalTopBar } from "@/components/layout/portal-top-bar";
import { BranchDataSync } from "@/components/sync/branch-data-sync";
import { DataScopeProvider } from "@/contexts/data-scope-context";
import { filterNav } from "@/lib/access";
import { BRANCH_NAV } from "@/lib/navigation/branch-nav";
import { getStoreNotifications, useManagerStore } from "@/stores/manager-store";
import { useSignOut } from "@/hooks/use-sign-out";
import { useDataScope } from "@/contexts/data-scope-context";
import { OPS } from "@/lib/routes";

function BranchShellInner({ children }: { children: ReactNode }) {
  const signOut = useSignOut();
  const gate = usePortalGate();
  const user = gate.user!;
  const { hotelId } = useDataScope();
  const notifications = useManagerStore((s) => s.notifications);
  const unread = getStoreNotifications(hotelId, notifications).filter((n) => !n.read)
    .length;

  const navItems = useMemo(
    () => filterNav(BRANCH_NAV, user.permissions),
    [user.permissions]
  );

  return (
    <BasePortalShell
      sidebar={
        <PortalSidebar
          user={user}
          title="Vasavi Branch"
          subtitle="Property operations"
          navItems={navItems}
          onLogout={() => void signOut()}
          unread={unread}
        />
      }
    >
      <BranchDataSync />
      <PortalTopBar user={user} />
      {children}
    </BasePortalShell>
  );
}

export function BranchShell({ children }: { children: ReactNode }) {
  const gate = usePortalGate();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (gate.user?.role === "super_admin") {
      const suffix = pathname.startsWith("/branch")
        ? pathname.slice("/branch".length)
        : "";
      router.replace(`${OPS.home}${suffix}`);
    }
  }, [gate.user, router, pathname]);

  if (!gate.user || gate.user.role !== "admin") {
    return null;
  }

  return (
    <DataScopeProvider mode="branch" user={gate.user}>
      <BranchShellInner>{children}</BranchShellInner>
    </DataScopeProvider>
  );
}
