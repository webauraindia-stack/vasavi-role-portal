"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { PROACTIVE_REFRESH_INTERVAL_MS } from "@/lib/auth/token-lifetime";

/**
 * Proactively refresh the access token before expiry while the tab is visible.
 */
export function SessionKeeper() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const refreshIfNeeded = useAuthStore((s) => s.refreshIfNeeded);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      void refreshIfNeeded({ silent: true });
    };

    tick();
    timerRef.current = setInterval(tick, PROACTIVE_REFRESH_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshIfNeeded({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated, refreshIfNeeded]);

  return null;
}
