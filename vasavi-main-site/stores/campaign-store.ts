import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "@/types";

interface CampaignState {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "redemptionsCount">) => void;
  toggleCampaign: (id: string) => void;
  incrementCampaignRedemption: (id: string) => void;
  deleteCampaign: (id: string) => void;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "Makar Sankranti Surge Support",
    type: "fixed_compensation",
    rewardValue: 1500,
    minDonationRequired: 15000,
    description: "Earn a ₹1,500 booking voucher for any contribution of ₹15,000+ during the Makar Sankranti holy week.",
    active: true,
    expiryDays: 90,
    redemptionsCount: 24,
  },
  {
    id: "camp-2",
    name: "Vysha Community Referral Drive",
    type: "percentage_discount",
    rewardValue: 20,
    minDonationRequired: 10000,
    description: "Refer 2 community members who join the KCGF educational scheme to unlock a 20% discount staying coupon.",
    active: true,
    expiryDays: 60,
    redemptionsCount: 12,
  },
  {
    id: "camp-3",
    name: "Kanyaka Parameswari Temple Volunteers",
    type: "premium_benefit",
    rewardValue: 500,
    minDonationRequired: 5000,
    description: "Dedicated volunteering at regional shelters unlocks a premium Satvik meal pass worth ₹500.",
    active: true,
    expiryDays: 120,
    redemptionsCount: 45,
  },
  {
    id: "camp-4",
    name: "Annadanam Grand Silver Milestone",
    type: "free_booking",
    rewardValue: 0,
    minDonationRequired: 50000,
    description: "Donate ₹50,000+ to the Annadanam community kitchen and receive a Completely Free 1-Night Suite stay coupon.",
    active: true,
    expiryDays: 180,
    redemptionsCount: 8,
  },
];

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      campaigns: DEFAULT_CAMPAIGNS,

      addCampaign: (campaign) => {
        set((state) => {
          const newCamp: Campaign = {
            ...campaign,
            id: `camp-${Date.now()}`,
            redemptionsCount: 0,
          };
          return { campaigns: [newCamp, ...state.campaigns] };
        });
      },

      toggleCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
        }));
      },

      incrementCampaignRedemption: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, redemptionsCount: c.redemptionsCount + 1 } : c)),
        }));
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: "vasavi-campaign-storage",
    }
  )
);
