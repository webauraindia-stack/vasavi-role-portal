"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/** Sign out, clear session, and navigate to login. */
export function useSignOut() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);
}
