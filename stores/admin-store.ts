"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DONOR_ANALYTICS, INITIAL_DONORS } from "@/lib/data/mock-donors";
import type { DonorStatus, PlatformDonor } from "@/lib/donor-types";

interface AdminState {
  isAuthenticated: boolean;
  donors: PlatformDonor[];
  login: (pin: string) => boolean;
  logout: () => void;
  updateDonorStatus: (id: string, status: DonorStatus) => void;
  updateDonor: (id: string, patch: Partial<PlatformDonor>) => void;
  addDonor: (donor: PlatformDonor) => void;
  archiveDonor: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      donors: INITIAL_DONORS,

      login: (pin) => {
        if (pin !== "admin123" && pin !== "vasavi") return false;
        set({ isAuthenticated: true });
        return true;
      },

      logout: () => set({ isAuthenticated: false }),

      updateDonorStatus: (id, status) =>
        set((s) => ({
          donors: s.donors.map((d) =>
            d.id === id ? { ...d, status, updatedAt: new Date().toISOString().slice(0, 10) } : d
          ),
        })),

      updateDonor: (id, patch) =>
        set((s) => ({
          donors: s.donors.map((d) =>
            d.id === id
              ? { ...d, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
              : d
          ),
        })),

      addDonor: (donor) =>
        set((s) => ({ donors: [donor, ...s.donors] })),

      archiveDonor: (id) =>
        set((s) => ({
          donors: s.donors.map((d) =>
            d.id === id ? { ...d, status: "archived" as const } : d
          ),
        })),
    }),
    { name: "vasavi-superadmin-donors" }
  )
);

export function useDonorAnalytics() {
  return DONOR_ANALYTICS;
}
