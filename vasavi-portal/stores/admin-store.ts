"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DONOR_ANALYTICS, INITIAL_DONORS } from "@/lib/data/mock-donors";
import type { DonorStatus, PlatformDonor } from "@/lib/donor-types";

interface AdminState {
  donors: PlatformDonor[];
  updateDonorStatus: (id: string, status: DonorStatus) => void;
  updateDonor: (id: string, patch: Partial<PlatformDonor>) => void;
  addDonor: (donor: PlatformDonor) => void;
  archiveDonor: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      donors: INITIAL_DONORS,

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
    { name: "vasavi-donor-data" }
  )
);

export function useDonorAnalytics() {
  return DONOR_ANALYTICS;
}
