"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  canAccessPath,
  hasPermission,
  type Permission,
  type PortalUser,
} from "@/lib/rbac";
import { signOutStaff } from "@/lib/auth/sign-out-staff";
import { fetchStaffMe, verifyStaffOtp, sendStaffOtp } from "@/lib/api/staff-auth";
import { isJwtExpired } from "@/lib/auth/jwt";
import { refreshStaffAccessToken } from "@/lib/auth/refresh-staff-token";
import { SessionExpiredError } from "@/lib/auth/session-expired";
import {
  accessTokenExpiresAt,
  shouldRefreshAccessToken,
} from "@/lib/auth/token-lifetime";
import { portalUserFromStaff } from "@/lib/api/permissions-map";
import { useManagerStore } from "@/stores/manager-store";
import { useAdminStore } from "@/stores/admin-store";

export type SessionPhase =
  | "idle"
  | "hydrating"
  | "restoring"
  | "refreshing"
  | "active";

interface AuthState {
  user: PortalUser | null;
  accessToken: string | null;
  accessTokenExpires: number | null;
  isAuthenticated: boolean;
  sessionPhase: SessionPhase;
  /** When false, do not auto-restore from refresh cookie (after explicit sign-out). */
  allowSessionRestore: boolean;

  sendOtp: (phone: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOtp: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  restoreSession: () => Promise<boolean>;
  refreshIfNeeded: (opts?: { silent?: boolean }) => Promise<string | null>;
  getValidAccessToken: () => Promise<string | null>;
  withAccessToken: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
  applyAccessToken: (access: string, expiresAt?: number) => void;
  clearSessionSilently: () => void;
  logout: () => Promise<void>;
  can: (permission: Permission | Permission[]) => boolean;
  canAccess: (pathname: string) => boolean;
}

function applyTokenToState(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
  access: string,
  expiresAt?: number
) {
  const hasUser = Boolean(get().user);
  set({
    accessToken: access,
    accessTokenExpires: expiresAt ?? accessTokenExpiresAt(),
    ...(hasUser
      ? { isAuthenticated: true, sessionPhase: "active" as const }
      : { sessionPhase: "restoring" as const }),
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      accessTokenExpires: null,
      isAuthenticated: false,
      sessionPhase: "idle",
      allowSessionRestore: true,

      applyAccessToken: (access, expiresAt) => {
        applyTokenToState(set, get, access, expiresAt);
      },

      clearSessionSilently: () => {
        set({
          user: null,
          accessToken: null,
          accessTokenExpires: null,
          isAuthenticated: false,
          sessionPhase: "idle",
        });
      },

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
          const expiresAt =
            typeof data.access_expires_in === "number"
              ? Date.now() + data.access_expires_in * 1000
              : accessTokenExpiresAt();
          set({
            user,
            accessToken: data.access,
            accessTokenExpires: expiresAt,
            isAuthenticated: true,
            sessionPhase: "active",
            allowSessionRestore: true,
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

      refreshIfNeeded: async ({ silent = false } = {}) => {
        const { accessToken, accessTokenExpires } = get();

        const needsRefresh =
          !accessToken ||
          isJwtExpired(accessToken) ||
          shouldRefreshAccessToken(accessTokenExpires);

        if (accessToken && !needsRefresh) {
          return accessToken;
        }

        if (!silent) {
          set({ sessionPhase: "refreshing" });
        }

        try {
          const { access, expiresAt } = await refreshStaffAccessToken();
          applyTokenToState(set, get, access, expiresAt);
          return access;
        } catch (error) {
          get().clearSessionSilently();
          if (!silent) {
            throw error;
          }
          return null;
        } finally {
          if (!silent && get().user) {
            set({ sessionPhase: "active" });
          }
        }
      },

      getValidAccessToken: async () => {
        try {
          return await get().refreshIfNeeded({ silent: true });
        } catch {
          return null;
        }
      },

      withAccessToken: async (fn) => {
        let token = await get().getValidAccessToken();
        if (!token) {
          throw new SessionExpiredError();
        }

        try {
          return await fn(token);
        } catch (error) {
          const { ApiClientError } = await import("@/lib/api/client");
          const is401 =
            error instanceof ApiClientError &&
            (error.status === 401 || error.code === "AUTH_FAILED");

          if (!is401) {
            throw error;
          }

          set({ sessionPhase: "refreshing" });
          try {
            const { access, expiresAt } = await refreshStaffAccessToken();
            applyTokenToState(set, get, access, expiresAt);
            return await fn(access);
          } catch (refreshError) {
            get().clearSessionSilently();
            throw refreshError;
          } finally {
            if (get().user) {
              set({ sessionPhase: "active" });
            }
          }
        }
      },

      restoreSession: async () => {
        const hadToken = Boolean(get().accessToken);
        set({ sessionPhase: hadToken ? "restoring" : "hydrating" });

        try {
          const token = await get().refreshIfNeeded({ silent: true });
          if (!token) {
            get().clearSessionSilently();
            return false;
          }

          const me = await fetchStaffMe(token);
          const user = portalUserFromStaff(me);
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            sessionPhase: "active",
            allowSessionRestore: true,
          });
          if (user.hotelId) {
            useManagerStore.getState().setHotelId(user.hotelId);
          }
          await useManagerStore.getState().refreshFromApi(token);
          if (user.role === "super_admin") {
            await useAdminStore.getState().loadDonors(token, { force: true });
          }
          return true;
        } catch {
          get().clearSessionSilently();
          return false;
        }
      },

      logout: async () => {
        const token = get().accessToken;
        set({ allowSessionRestore: false, sessionPhase: "idle" });

        try {
          await signOutStaff(token);
        } catch {
          /* Still clear local session; cookie may already be invalid */
        }

        get().clearSessionSilently();
        useManagerStore.setState({
          dataLoaded: false,
          bookings: [],
          rooms: [],
          notifications: [],
        });

        try {
          await useAuthStore.persist.clearStorage();
        } catch {
          /* ignore */
        }
      },

      can: (permission) => {
        const perms = get().user?.permissions ?? [];
        return hasPermission(perms, permission);
      },

      canAccess: (pathname) => {
        const user = get().user;
        const perms = user?.permissions ?? [];
        return canAccessPath(pathname, perms, { hotelId: user?.hotelId });
      },
    }),
    {
      name: "vasavi-portal-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        accessTokenExpires: s.accessTokenExpires,
        isAuthenticated: s.isAuthenticated,
        allowSessionRestore: s.allowSessionRestore,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.allowSessionRestore === undefined) {
          state.allowSessionRestore = true;
        }
        if (state.isAuthenticated && !state.user) {
          state.isAuthenticated = false;
          state.sessionPhase = "idle";
        } else if (state.isAuthenticated && state.user) {
          state.sessionPhase = "active";
        } else {
          state.sessionPhase = "idle";
        }
      },
    }
  )
);

export function useUserPermissions(): Permission[] {
  return useAuthStore((s) => s.user?.permissions ?? []);
}

export function useAuthUser(): PortalUser | null {
  return useAuthStore((s) => s.user);
}
