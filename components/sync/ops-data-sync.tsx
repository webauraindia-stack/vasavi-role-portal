"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminStore } from "@/stores/admin-store";
import { useManagerStore } from "@/stores/manager-store";
import { useDataScope } from "@/contexts/data-scope-context";

/** Loads cross-property operations data for super admin. */
export function OpsDataSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const withAccessToken = useAuthStore((s) => s.withAccessToken);
  const user = useAuthStore((s) => s.user);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);
  const loadDonors = useAdminStore((s) => s.loadDonors);
  const { branchIdForApi, hotelId } = useDataScope();

  useEffect(() => {
    if (!isAuthenticated || sessionPhase !== "active" || !user) return;

    void withAccessToken(async (token) => {
      await refreshFromApi(token, user, {
        branchId: branchIdForApi,
        hotelId,
      });
      await loadDonors(token, { force: true });
    }).catch(() => {});
  }, [
    isAuthenticated,
    sessionPhase,
    user,
    branchIdForApi,
    hotelId,
    withAccessToken,
    refreshFromApi,
    loadDonors,
  ]);

  return null;
}
