"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UnifiedSidebar } from "@/components/layout/unified-sidebar";
import { PortalTopBar } from "@/components/layout/portal-top-bar";
import { PortalDataSync } from "@/components/portal-data-sync";
import { SessionKeeper } from "@/components/auth/session-keeper";
import { SessionStatusBar } from "@/components/auth/session-status-bar";
import { useSignOut } from "@/hooks/use-sign-out";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessPath, defaultLandingPath } from "@/lib/rbac";

const PUBLIC = ["/login"];

function SessionLoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-champagne" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  const allowSessionRestore = useAuthStore((s) => s.allowSessionRestore);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [ready, setReady] = useState(false);
  const restoreStarted = useRef(false);

  useEffect(() => {
    const done = () => setReady(true);
    if (useAuthStore.persist.hasHydrated()) done();
    else return useAuthStore.persist.onFinishHydration(done);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC.some((p) => pathname === p);

    if (
      !isPublic &&
      !isAuthenticated &&
      allowSessionRestore &&
      !restoreStarted.current
    ) {
      restoreStarted.current = true;
      void restoreSession().finally(() => {
        restoreStarted.current = false;
      });
    }
  }, [ready, pathname, isAuthenticated, allowSessionRestore, restoreSession]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC.some((p) => pathname === p);
    const hasUser = Boolean(user);

    if (!isAuthenticated && !isPublic) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && !hasUser && !isPublic) {
      return;
    }

    if (!isAuthenticated || !user) return;

    if (pathname === "/login") {
      router.replace(defaultLandingPath(user.permissions));
      return;
    }

    if (!canAccessPath(pathname, user.permissions, { hotelId: user.hotelId })) {
      router.replace(`${defaultLandingPath(user.permissions)}?error=unauthorized`);
    }
  }, [ready, isAuthenticated, pathname, router, user]);

  if (!ready || sessionPhase === "hydrating") {
    return <SessionLoadingScreen message="Loading portal…" />;
  }

  if (PUBLIC.includes(pathname)) {
    return <>{children}</>;
  }

  if (
    !isAuthenticated ||
    !user ||
    sessionPhase === "restoring" ||
    sessionPhase === "refreshing"
  ) {
    return (
      <SessionLoadingScreen
        message={
          sessionPhase === "refreshing"
            ? "Refreshing secure session…"
            : "Restoring your session…"
        }
      />
    );
  }

  if (!canAccessPath(pathname, user.permissions, { hotelId: user.hotelId })) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SessionStatusBar />
      <SessionKeeper />
      <PortalDataSync />
      <UnifiedSidebar user={user} onLogout={() => void signOut()} />
      <div className="flex flex-1 min-w-0 flex-col">
        <PortalTopBar user={user} />
        <main className="flex-1 min-w-0 bg-surface">{children}</main>
      </div>
    </div>
  );
}
