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
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);
  const loadDonors = useAdminStore((s) => s.loadDonors);
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    void refreshFromApi(accessToken);

    if (user?.role === "super_admin") {
      void loadDonors(accessToken, { force: true });
    }
  }, [isAuthenticated, accessToken, user?.role, refreshFromApi, loadDonors]);

  return null;
}
