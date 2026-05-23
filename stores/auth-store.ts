"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  canAccessPath,
  hasPermission,
  type Permission,
  type PortalUser,
} from "@/lib/rbac";
import { authenticate } from "@/lib/rbac/users";
import { useManagerStore } from "@/stores/manager-store";

interface AuthState {
  user: PortalUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  can: (permission: Permission | Permission[]) => boolean;
  canAccess: (pathname: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const user = authenticate(email, password);
        if (!user) return false;
        set({ user, isAuthenticated: true });
        if (user.hotelId) {
          useManagerStore.getState().setHotelId(user.hotelId);
        }
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

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
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export function useUserPermissions(): Permission[] {
  return useAuthStore((s) => s.user?.permissions ?? []);
}

export function useAuthUser(): PortalUser | null {
  return useAuthStore((s) => s.user);
}
