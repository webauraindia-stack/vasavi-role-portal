"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { BasePortalShell, usePortalGate } from "@/components/layout/base-portal-shell";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { filterNav } from "@/lib/access";
import { PLATFORM_NAV } from "@/lib/navigation/platform-nav";
import { OPS_NAV } from "@/lib/navigation/ops-nav";
import { useSignOut } from "@/hooks/use-sign-out";

/** Platform management shell (donors, branches, CMS — no property selector). */
export function PlatformShell({ children }: { children: ReactNode }) {
  const gate = usePortalGate();
  const signOut = useSignOut();

  if (!gate.user || gate.user.role !== "super_admin") {
    return null;
  }

  const user = gate.user;

  const sections = useMemo(() => {
    const ops = filterNav(OPS_NAV, user.permissions).slice(0, 1);
    const platform = filterNav(PLATFORM_NAV, user.permissions);
    return [
      { label: "Hotel operations", items: ops },
      { label: "Platform", items: platform },
    ].filter((s) => s.items.length > 0);
  }, [user.permissions]);

  return (
    <BasePortalShell
      mobileTitle="Vasavi Platform"
      sidebar={
        <PortalSidebar
          user={user}
          title="Vasavi Super Admin"
          subtitle="Platform management"
          sections={sections}
          onLogout={() => void signOut()}
        />
      }
    >
      {children}
    </BasePortalShell>
  );
}
