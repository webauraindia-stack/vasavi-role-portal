"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  canAccessPath,
  hasPermission,
  type Permission,
  type PortalUser,
} from "@/lib/rbac";
import {
  fetchStaffMe,
  refreshStaffToken,
  staffLogout,
  verifyStaffOtp,
  sendStaffOtp,
} from "@/lib/api/staff-auth";
import { isJwtExpired } from "@/lib/auth/jwt";
import { portalUserFromStaff } from "@/lib/api/permissions-map";
import { useManagerStore } from "@/stores/manager-store";
import { useAdminStore } from "@/stores/admin-store";
interface AuthState {
  user: PortalUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOtp: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  can: (permission: Permission | Permission[]) => boolean;
  canAccess: (pathname: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      sendOtp: async (phone) => {
        try {
          await sendStaffOtp(phone);
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Could not send OTP.",
          };
        }
      },

      loginWithOtp: async (phone, otp) => {
        try {
          const data = await verifyStaffOtp(phone, otp);
          const user = portalUserFromStaff(data.user);
          set({
            user,
            accessToken: data.access,
            isAuthenticated: true,
          });
          if (user.hotelId) {
            useManagerStore.getState().setHotelId(user.hotelId);
          }
          await useManagerStore.getState().refreshFromApi(data.access);
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Invalid OTP.",
          };
        }
      },

      restoreSession: async () => {
        const { accessToken } = get();
        try {
          let token = accessToken;
          if (!token || isJwtExpired(token)) {
            const refreshed = await refreshStaffToken();
            token = refreshed.access;
          }
          const me = await fetchStaffMe(token);
          const user = portalUserFromStaff(me);
          set({ user, accessToken: token, isAuthenticated: true });
          if (user.hotelId) {
            useManagerStore.getState().setHotelId(user.hotelId);
          }
          await useManagerStore.getState().refreshFromApi(token);
          if (user.role === "super_admin") {
            await useAdminStore.getState().loadDonors(token, { force: true });
          }
          return true;
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await staffLogout();
        } catch {
          /* ignore */
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      can: (permission) => {
        const perms = get().user?.permissions ?? [];
        return hasPermission(perms, permission);
      },

      canAccess: (pathname) => {
        const perms = get().user?.permissions ?? [];
        return canAccessPath(pathname, perms);
      },
    }),
    {
      name: "vasavi-portal-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export function useUserPermissions(): Permission[] {
  return useAuthStore((s) => s.user?.permissions ?? []);
}

export function useAuthUser(): PortalUser | null {
  return useAuthStore((s) => s.user);
}
