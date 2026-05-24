"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminStore } from "@/stores/admin-store";
import { useManagerStore } from "@/stores/manager-store";

/**
 * After auth is ready, always pull fresh operational data from the API (page reload safe).
 */
export function PortalDataSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const withAccessToken = useAuthStore((s) => s.withAccessToken);
  const user = useAuthStore((s) => s.user);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);
  const loadDonors = useAdminStore((s) => s.loadDonors);

  useEffect(() => {
    if (!isAuthenticated || sessionPhase !== "active") return;

    void withAccessToken(async (token) => {
      await refreshFromApi(token);
      if (user?.role === "super_admin") {
        await loadDonors(token, { force: true });
      }
    }).catch(() => {
      /* SessionExpiredError — portal shell redirects to login */
    });
  }, [
    isAuthenticated,
    sessionPhase,
    user?.role,
    withAccessToken,
    refreshFromApi,
    loadDonors,
  ]);

  return null;
}
