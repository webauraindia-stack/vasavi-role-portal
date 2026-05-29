"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionKeeper } from "@/components/auth/session-keeper";
import { SessionStatusBar } from "@/components/auth/session-status-bar";
import { PortalShellFrame } from "@/components/layout/portal-shell-frame";
import { useSignOut } from "@/hooks/use-sign-out";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessPath } from "@/lib/access";
import { homePathForUser, AUTH, resolveLegacyRedirect } from "@/lib/routes";

const PUBLIC = [AUTH.login];

function SessionLoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-champagne" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function usePortalGate() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const user = useAuthStore((s) => s.user);
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
      router.replace(`${AUTH.login}?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && !hasUser && !isPublic) return;

    if (!isAuthenticated || !user) return;

    if (pathname === AUTH.login) {
      router.replace(homePathForUser(user));
      return;
    }

    const legacy = resolveLegacyRedirect(pathname, user.role);
    if (legacy && legacy !== pathname) {
      router.replace(legacy);
      return;
    }

    if (!canAccessPath(pathname, user)) {
      router.replace(`${homePathForUser(user)}?error=unauthorized`);
    }
  }, [ready, isAuthenticated, pathname, router, user]);

  const isPublic = PUBLIC.some((p) => p === pathname);
  const loading =
    !ready ||
    sessionPhase === "hydrating" ||
    (!isPublic &&
      (!isAuthenticated ||
        !user ||
        sessionPhase === "restoring" ||
        sessionPhase === "refreshing"));
  const denied =
    !loading &&
    !isPublic &&
    user &&
    !canAccessPath(pathname, user);

  return { user, loading, denied, isPublic, pathname };
}

export function BasePortalShell({
  sidebar,
  children,
  mobileTitle = "Vasavi Portal",
}: {
  sidebar: ReactNode;
  children: ReactNode;
  /** Shown in the mobile app bar. */
  mobileTitle?: string;
}) {
  const signOut = useSignOut();
  const gate = usePortalGate();

  if (gate.isPublic) {
    return <>{children}</>;
  }

  if (gate.loading) {
    return (
      <SessionLoadingScreen
        message={
          gate.pathname && useAuthStore.getState().sessionPhase === "refreshing"
            ? "Refreshing secure session…"
            : "Restoring your session…"
        }
      />
    );
  }

  if (gate.denied || !gate.user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Redirecting…
      </div>
    );
  }

  return (
    <>
      <SessionStatusBar />
      <SessionKeeper />
      <PortalShellFrame sidebar={sidebar} user={gate.user} mobileTitle={mobileTitle}>
        {children}
      </PortalShellFrame>
    </>
  );
}

export function useSignOutHandler() {
  return useSignOut();
}
