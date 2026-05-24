"use client";

import { create } from "zustand";
import type { PlatformDonor } from "@/lib/donor-types";
import type { DonorStatus } from "@/lib/donor-types";
import { mapBackendCoupon } from "@/lib/api/coupons";
import { listCoupons } from "@/lib/api/coupons";
import {
  getDonor,
  listDonations,
  listDonors,
  mapDonationToTransaction,
  mapDonorProfileToPlatform,
  mapListDonorToPlatform,
  updateDonor,
} from "@/lib/api/donors";

interface AdminState {
  donors: PlatformDonor[];
  totalDonationsPaise: number;
  isLoading: boolean;
  loadError: string | null;
  donorsLoaded: boolean;

  loadDonors: (accessToken: string, options?: { force?: boolean }) => Promise<void>;
  loadDonationTotals: (accessToken: string) => Promise<void>;
  refreshDonorDetail: (accessToken: string, id: string) => Promise<void>;
  updateDonorStatus: (accessToken: string, id: string, status: DonorStatus) => Promise<void>;
  updateDonor: (accessToken: string, id: string, patch: Partial<PlatformDonor>) => Promise<void>;
  addDonorFromApi: (donor: PlatformDonor) => void;
  archiveDonor: (id: string) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  donors: [],
  totalDonationsPaise: 0,
  isLoading: false,
  loadError: null,
  donorsLoaded: false,

  loadDonors: async (accessToken, options) => {
    const { donorsLoaded, donors } = get();
    if (!options?.force && donorsLoaded && donors.length > 0) {
      return;
    }

    set({ isLoading: true, loadError: null });
    try {
      const rows = await listDonors(accessToken);
      const mapped = rows.map(mapListDonorToPlatform);
      const totalDonationsPaise = mapped.reduce(
        (sum, d) => sum + d.totalContribution * 100,
        0
      );
      set({
        donors: mapped,
        totalDonationsPaise,
        isLoading: false,
        donorsLoaded: true,
      });
    } catch (err) {
      set({
        loadError: err instanceof Error ? err.message : "Could not load donors.",
        isLoading: false,
      });
    }
  },

  loadDonationTotals: async (accessToken) => {
    try {
      const donations = await listDonations(accessToken);
      const totalDonationsPaise = donations.reduce(
        (sum, d) => sum + (d.amount_paise ?? 0),
        0
      );
      set({ totalDonationsPaise });
    } catch {
      /* optional analytics */
    }
  },

  refreshDonorDetail: async (accessToken, id) => {
    const [profile, donations, couponRows] = await Promise.all([
      getDonor(accessToken, id),
      listDonations(accessToken, id),
      listCoupons(accessToken, { donorProfileId: id }),
    ]);

    const mapped = mapDonorProfileToPlatform(profile, {
      transactions: donations.map(mapDonationToTransaction),
      coupons: couponRows.map(mapBackendCoupon),
      totalContribution: Math.round(
        donations.reduce((sum, d) => sum + (d.amount_paise ?? 0), 0) / 100
      ),
    });

    set({
      donors: get().donors.map((d) => (d.id === id ? mapped : d)),
    });
  },

  updateDonorStatus: async (accessToken, id, status) => {
    if (status === "archived") {
      await updateDonor(accessToken, id, { name: get().donors.find((d) => d.id === id)?.name });
    }
    set({
      donors: get().donors.map((d) =>
        d.id === id
          ? { ...d, status, updatedAt: new Date().toISOString().slice(0, 10) }
          : d
      ),
    });
  },

  updateDonor: async (accessToken, id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.name) payload.name = patch.name;
    if (patch.notes !== undefined) payload.club_name = patch.notes;
    if (Object.keys(payload).length) {
      await updateDonor(accessToken, id, payload);
      await get().refreshDonorDetail(accessToken, id);
    } else {
      set({
        donors: get().donors.map((d) =>
          d.id === id
            ? { ...d, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
            : d
        ),
      });
    }
  },

  addDonorFromApi: (donor) =>
    set((s) => ({
      donors: [donor, ...s.donors.filter((d) => d.id !== donor.id)],
      donorsLoaded: true,
    })),

  archiveDonor: (id) =>
    set({
      donors: get().donors.map((d) =>
        d.id === id ? { ...d, status: "archived" as const } : d
      ),
    }),
}));

export function useDonorAnalytics() {
  const donors = useAdminStore((s) => s.donors);
  const totalPaise = useAdminStore((s) => s.totalDonationsPaise);
  const totalContributions = Math.round(totalPaise / 100);
  const active = donors.filter((d) => d.status === "active").length;

  const byTier = donors.reduce<Record<string, number>>((acc, d) => {
    const tier = d.membershipLevel || "Other";
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {});

  const tierChart = Object.entries(byTier).map(([tier, count]) => ({
    month: tier,
    amount: count,
  }));

  const topContributors = [...donors]
    .sort((a, b) => b.totalContribution - a.totalContribution)
    .slice(0, 5)
    .map((d) => ({ name: d.name, amount: d.totalContribution }));

  return {
    totalDonors: donors.length,
    activeDonors: active,
    totalContributions,
    pendingApproval: donors.filter((d) => d.status === "pending_approval").length,
    byTier,
    tierChart,
    topContributors,
  };
}
