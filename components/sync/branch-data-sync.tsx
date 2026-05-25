"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";
import { useDataScope } from "@/contexts/data-scope-context";

/** Loads branch-scoped operational data for the branch admin surface. */
export function BranchDataSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const withAccessToken = useAuthStore((s) => s.withAccessToken);
  const user = useAuthStore((s) => s.user);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);
  const { branchIdForApi } = useDataScope();

  useEffect(() => {
    if (!isAuthenticated || sessionPhase !== "active" || !user) return;

    void withAccessToken(async (token) => {
      await refreshFromApi(token, user, { branchId: branchIdForApi });
    }).catch(() => {});
  }, [
    isAuthenticated,
    sessionPhase,
    user,
    branchIdForApi,
    withAccessToken,
    refreshFromApi,
  ]);

  return null;
}
