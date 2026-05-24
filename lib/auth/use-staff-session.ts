"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { isSessionExpiredError } from "@/lib/auth/session-expired";

/**
 * Staff session helper — silent refresh, no thrown errors for expired sessions during restore.
 */
export function useStaffSession() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const accessTokenExpires = useAuthStore((s) => s.accessTokenExpires);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const withAccessToken = useAuthStore((s) => s.withAccessToken);
  const getValidAccessToken = useAuthStore((s) => s.getValidAccessToken);

  const runWithAuth = useCallback(
    async <T>(fn: (token: string) => Promise<T>): Promise<T | null> => {
      try {
        return await withAccessToken(fn);
      } catch (error) {
        if (isSessionExpiredError(error)) {
          return null;
        }
        throw error;
      }
    },
    [withAccessToken]
  );

  const isSessionBusy =
    sessionPhase === "hydrating" ||
    sessionPhase === "restoring" ||
    sessionPhase === "refreshing";

  return {
    accessToken,
    accessTokenExpires,
    isAuthenticated,
    sessionPhase,
    isSessionBusy,
    isRefreshing: sessionPhase === "refreshing",
    withAccessToken,
    getValidAccessToken,
    runWithAuth,
  };
}
