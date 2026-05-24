"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { PortalTopBar } from "@/components/layout/portal-top-bar";
import { PortalDataSync } from "@/components/portal-data-sync";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessPath, defaultLandingPath } from "@/lib/rbac";

const PUBLIC = ["/login"];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const done = () => setReady(true);
    if (useAuthStore.persist.hasHydrated()) done();
    else return useAuthStore.persist.onFinishHydration(done);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC.some((p) => pathname === p);
    // Only try cookie refresh when we have a persisted token (avoid noisy refresh calls on login page).
    const hasStoredSession = Boolean(useAuthStore.getState().accessToken);
    if (!isPublic && !isAuthenticated && hasStoredSession) {
      void restoreSession();
    }
  }, [ready, pathname, isAuthenticated, restoreSession]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC.some((p) => pathname === p);

    if (!isAuthenticated && !isPublic) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace(defaultLandingPath(user!.permissions));
      return;
    }

    if (isAuthenticated && user && !canAccessPath(pathname, user.permissions)) {
      router.replace(`${defaultLandingPath(user.permissions)}?error=unauthorized`);
    }
  }, [ready, isAuthenticated, pathname, router, user]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (PUBLIC.includes(pathname)) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (!canAccessPath(pathname, user.permissions)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <PortalDataSync />
      <UnifiedSidebar user={user} onLogout={logout} />
      <div className="flex flex-1 min-w-0 flex-col">
        <PortalTopBar user={user} />
        <main className="flex-1 min-w-0 bg-surface">{children}</main>
      </div>
    </div>
  );
}
