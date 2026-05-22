import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Donor, DonorTier, Coupon, DonationRecord } from "@/types";
import { MOCK_DONOR } from "@/lib/data/hotels";
import {
  lookupMemberProfile,
  MOCK_MEMBER_PROFILES,
} from "@/lib/data/community-members";
import type { CommunityMemberProfile } from "@/types";
import {
  getDiscountPercent,
  getMonthlyQuota,
  getTierFromDonation,
  getTierInfo,
  calculateLoyaltyPoints,
  generateCouponCode,
} from "@/lib/donor-engine";

interface DonorState {
  isAuthenticated: boolean;
  donor: Donor | null;
  isLoading: boolean;
  celebration: { title: string; desc: string; type?: "donation" | "tier_up" | "coupon_earned" | "manual" } | null;

  login: (email: string, donorId: string) => Promise<boolean>;
  loadMemberProfile: (profile: CommunityMemberProfile) => void;
  verifyMemberId: (memberId: string) => CommunityMemberProfile | null;
  logout: () => void;
  refreshDonor: () => void;
  
  // Rewards system actions
  addDonation: (amount: number, schemeId: string, paymentMethod: string) => void;
  redeemCoupons: (couponIds: string[]) => void;
  refundCoupons: (couponIds: string[]) => void;
  issueManualCoupon: (coupon: Omit<Coupon, "id" | "usedCount">) => void;
  clearCelebration: () => void;
  addRewardPoints: (points: number) => void;
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "FREE-STAY-9321",
    name: "Community Free Stay",
    type: "free_booking",
    value: 0,
    minBookingAmount: 0,
    expiryDate: "2026-12-15",
    usageLimit: 1,
    usedCount: 0,
    status: "available",
    description: "Completely free 1-night stay on deluxe room categories!",
    source: "Milestone Gold Reward",
  },
  {
    id: "c2",
    code: "COMP-2500-MIL",
    name: "Milestone Compensation",
    type: "fixed_compensation",
    value: 2500,
    minBookingAmount: 0,
    expiryDate: "2026-12-31",
    usageLimit: 1,
    usedCount: 0,
    status: "available",
    description: "Earned for crossing ₹25,000 total contributions",
    source: "Milestone",
  },
  {
    id: "c3",
    code: "COMP-1000-MIL",
    name: "Satsang Support Credit",
    type: "fixed_compensation",
    value: 1000,
    minBookingAmount: 0,
    expiryDate: "2026-11-30",
    usageLimit: 1,
    usedCount: 0,
    status: "available",
    description: "Earned for crossing ₹10,000 total contributions",
    source: "Milestone",
  },
  {
    id: "c4",
    code: "PCT-15-REF",
    name: "Referral Thank You",
    type: "percentage_discount",
    value: 15,
    minBookingAmount: 3000,
    expiryDate: "2026-10-30",
    usageLimit: 1,
    usedCount: 0,
    status: "available",
    description: "15% off standard room bookings for inviting community friends",
    source: "Referral Program",
  },
  {
    id: "c5",
    code: "VIP-MEALS-882",
    name: "VIP Satvik Dining Pass",
    type: "premium_benefit",
    value: 800,
    minBookingAmount: 0,
    expiryDate: "2026-09-30",
    usageLimit: 1,
    usedCount: 0,
    status: "available",
    description: "VIP access to community kitchen and special prasadam delivery",
    source: "Volunteering Star",
  },
  {
    id: "c6",
    code: "COMP-500-USED",
    name: "Welcome Gift",
    type: "fixed_compensation",
    value: 500,
    minBookingAmount: 0,
    expiryDate: "2026-03-31",
    usageLimit: 1,
    usedCount: 1,
    status: "redeemed",
    description: "Registration welcome coupon",
    source: "Registration",
  },
];

export const useDonorStore = create<DonorState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      donor: null,
      isLoading: false,
      celebration: null,

      loadMemberProfile: (profile) => {
        const tier = profile.donor.tier;
        set({
          isAuthenticated: true,
          donor: {
            ...profile.donor,
            discountPercent: getDiscountPercent(tier),
            monthlyBookingQuota: getMonthlyQuota(tier),
          },
        });
      },

      verifyMemberId: (memberId) => {
        const profile = lookupMemberProfile(memberId);
        if (profile) {
          get().loadMemberProfile(profile);
        }
        return profile;
      },

      login: async (email, donorId) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));

        const byId = lookupMemberProfile(donorId);
        if (
          byId &&
          (email.toLowerCase() === byId.email.toLowerCase() ||
            email.toLowerCase() === MOCK_DONOR.email.toLowerCase())
        ) {
          get().loadMemberProfile(byId);
          set({ isLoading: false });
          return true;
        }

        if (
          email.toLowerCase() === MOCK_DONOR.email.toLowerCase() &&
          donorId.toUpperCase() === MOCK_DONOR.donorId.toUpperCase()
        ) {
          const goldProfile = MOCK_MEMBER_PROFILES[0];
          get().loadMemberProfile(goldProfile);
          set({ isLoading: false });
          return true;
        }

        // Also allow dynamic mock login for custom tests
        if (email.includes("@") && donorId.startsWith("DH-")) {
          set({
            isAuthenticated: true,
            donor: {
              id: `donor-${Date.now()}`,
              donorId: donorId.toUpperCase(),
              name: email.split("@")[0].toUpperCase(),
              email: email.toLowerCase(),
              tier: "bronze",
              totalDonation: 5000,
              discountPercent: 10,
              monthlyBookingQuota: 4,
              monthlyBookingsUsed: 0,
              quotaResetDate: "2026-06-01",
              memberSince: new Date().toISOString().split("T")[0],
              donations: [
                { id: "d-init", date: new Date().toISOString().split("T")[0], amount: 5000, paymentMethod: "UPI" }
              ],
              bookings: [],
              rewardPoints: 500,
              compensationCredits: 250,
              loyaltyStreak: 1,
              bookingBenefits: ["Access to standard community halls", "Priority check-in"],
              coupons: [
                {
                  id: "c-welcome",
                  code: "COMP-250-WELCOME",
                  name: "Welcome Credits",
                  type: "fixed_compensation",
                  value: 250,
                  minBookingAmount: 0,
                  expiryDate: "2026-12-31",
                  usageLimit: 1,
                  usedCount: 0,
                  status: "available",
                  description: "Welcome sign-up reward",
                  source: "Registration",
                }
              ]
            },
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => set({ isAuthenticated: false, donor: null, celebration: null }),

      refreshDonor: () => {
        set((state) => {
          if (!state.donor) return state;
          const tier = state.donor.tier;
          return {
            donor: {
              ...state.donor,
              discountPercent: getDiscountPercent(tier),
              monthlyBookingQuota: getMonthlyQuota(tier),
            },
          };
        });
      },

      addDonation: (amount, schemeId, paymentMethod) => {
        set((state) => {
          if (!state.donor) return state;

          const donationId = `d-${Date.now()}`;
          const todayStr = new Date().toISOString().split("T")[0];
          const newDonation: DonationRecord = {
            id: donationId,
            date: todayStr,
            amount: amount,
            paymentMethod: paymentMethod,
          };

          const updatedDonations = [newDonation, ...state.donor.donations];
          const oldTotal = state.donor.totalDonation;
          const newTotal = oldTotal + amount;
          const oldTier = state.donor.tier;
          const newTier = getTierFromDonation(newTotal);

          // Points and credits math
          const earnedPoints = calculateLoyaltyPoints(amount, oldTier);
          const earnedCredits = Math.round(amount * 0.05); // 5% cashback in booking credits!

          const nextPoints = state.donor.rewardPoints + earnedPoints;
          const nextCredits = state.donor.compensationCredits + earnedCredits;

          let celebrationInfo: {
            title: string;
            desc: string;
            type: "donation" | "tier_up" | "coupon_earned" | "manual";
          } = {
            title: "✨ Donation Successful!",
            desc: `Thank you for your generous contribution of ₹${amount.toLocaleString()}! You earned +${earnedPoints.toLocaleString()} Reward Points and +₹${earnedCredits.toLocaleString()} in Booking Credits.`,
            type: "donation",
          };

          const newCoupons = [...state.donor.coupons];

          // Milestone triggers
          if (oldTotal < 100000 && newTotal >= 100000) {
            const code = generateCouponCode("free_booking", 0);
            newCoupons.unshift({
              id: `c-gold-${Date.now()}`,
              code,
              name: "Gold Milestone Stay",
              type: "free_booking",
              value: 0,
              minBookingAmount: 0,
              expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              usageLimit: 1,
              usedCount: 0,
              status: "available",
              description: "Completely free 1-night stay on any Deluxe or Suite room, celebrating your Gold status!",
              source: "Gold Milestone Upgrade",
            });
            celebrationInfo = {
              title: "🏆 Gold Tier Unlocked!",
              desc: `Outstanding! You have reached Gold Tier. We have added a Completely Free Stay coupon "${code}" to your wallet!`,
              type: "tier_up" as const,
            };
          } else if (oldTotal < 500000 && newTotal >= 500000) {
            const code = generateCouponCode("free_booking", 0);
            newCoupons.unshift({
              id: `c-plat-${Date.now()}`,
              code,
              name: "Platinum Milestone Stay",
              type: "free_booking",
              value: 0,
              minBookingAmount: 0,
              expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              usageLimit: 1,
              usedCount: 0,
              status: "available",
              description: "Completely free 1-night stay on any Suite category room!",
              source: "Platinum Milestone Upgrade",
            });
            celebrationInfo = {
              title: "💎 Platinum Tier Unlocked!",
              desc: `Incredible! You have ascended to Platinum Tier. We have added a Premium Free Stay coupon "${code}" to your wallet!`,
              type: "tier_up" as const,
            };
          } else if (oldTotal < 1000000 && newTotal >= 1000000) {
            const code1 = generateCouponCode("free_booking", 0);
            const code2 = generateCouponCode("fixed_compensation", 10000);
            newCoupons.unshift(
              {
                id: `c-elite1-${Date.now()}`,
                code: code1,
                name: "Elite Royal Stay",
                type: "free_booking",
                value: 0,
                minBookingAmount: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                usageLimit: 1,
                usedCount: 0,
                status: "available",
                description: "Completely free royal stay on any Penthouse or VIP room category!",
                source: "Elite Tier Celebration",
              },
              {
                id: `c-elite2-${Date.now()}`,
                code: code2,
                name: "Elite ₹10k Credits Wallet",
                type: "fixed_compensation",
                value: 10000,
                minBookingAmount: 0,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                usageLimit: 1,
                usedCount: 0,
                status: "available",
                description: "₹10,000 cash equivalent compensation credits for room bookings!",
                source: "Elite Tier Celebration",
              }
            );
            celebrationInfo = {
              title: "👑 ELITE DONOR STATUS UNLOCKED!",
              desc: `Bow down to your absolute generosity! You are now an Elite Donor. We have added 2 Royal Perks: a Free Penthouse Stay "${code1}" and ₹10,000 in Booking Credits "${code2}"!`,
              type: "tier_up" as const,
            };
          } else if (amount >= 25000) {
            const code = generateCouponCode("fixed_compensation", 2000);
            newCoupons.unshift({
              id: `c-high-${Date.now()}`,
              code,
              name: "Devotional Contribution Bonus",
              type: "fixed_compensation",
              value: 2000,
              minBookingAmount: 0,
              expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              usageLimit: 1,
              usedCount: 0,
              status: "available",
              description: "₹2,000 reward credits for supporting our community schemes!",
              source: "High Support Campaign",
            });
            celebrationInfo = {
              title: "🎉 High Contribution Bonus!",
              desc: `In recognition of your ₹${amount.toLocaleString()} support, we have awarded you a ₹2,000 Booking Credit coupon "${code}"!`,
              type: "coupon_earned" as const,
            };
          }

          let updatedBenefits = state.donor.bookingBenefits;
          if (newTier !== oldTier) {
            const tierInfo = getTierInfo(newTier);
            if (tierInfo) {
              updatedBenefits = [
                ...tierInfo.benefits,
                ...state.donor.bookingBenefits.filter(b => !tierInfo.benefits.includes(b))
              ];
            }
          }

          return {
            donor: {
              ...state.donor,
              totalDonation: newTotal,
              tier: newTier,
              discountPercent: getDiscountPercent(newTier),
              monthlyBookingQuota: getMonthlyQuota(newTier),
              rewardPoints: nextPoints,
              compensationCredits: nextCredits,
              donations: updatedDonations,
              coupons: newCoupons,
              bookingBenefits: updatedBenefits,
            },
            celebration: celebrationInfo,
          };
        });
      },

      redeemCoupons: (couponIds) => {
        set((state) => {
          if (!state.donor) return state;
          const updatedCoupons = state.donor.coupons.map((c) => {
            if (couponIds.includes(c.id)) {
              return { ...c, status: "redeemed" as const, usedCount: c.usedCount + 1 };
            }
            return c;
          });

          // Also reduce compensation credits if stackable credits were used directly
          let reducedCredits = state.donor.compensationCredits;
          couponIds.forEach((id) => {
            const coup = state.donor!.coupons.find((c) => c.id === id);
            if (coup && coup.type === "fixed_compensation") {
              reducedCredits = Math.max(0, reducedCredits - coup.value);
            }
          });

          return {
            donor: {
              ...state.donor,
              coupons: updatedCoupons,
              compensationCredits: reducedCredits,
            },
          };
        });
      },

      refundCoupons: (couponIds) => {
        set((state) => {
          if (!state.donor) return state;
          const updatedCoupons = state.donor.coupons.map((c) => {
            if (couponIds.includes(c.id)) {
              return { ...c, status: "available" as const, usedCount: Math.max(0, c.usedCount - 1) };
            }
            return c;
          });

          // Add back compensation credits
          let restoredCredits = state.donor.compensationCredits;
          couponIds.forEach((id) => {
            const coup = state.donor!.coupons.find((c) => c.id === id);
            if (coup && coup.type === "fixed_compensation") {
              restoredCredits += coup.value;
            }
          });

          return {
            donor: {
              ...state.donor,
              coupons: updatedCoupons,
              compensationCredits: restoredCredits,
            },
          };
        });
      },

      issueManualCoupon: (coupon) => {
        set((state) => {
          if (!state.donor) return state;
          const newCoupon: Coupon = {
            ...coupon,
            id: `c-manual-${Date.now()}`,
            usedCount: 0,
          };
          return {
            donor: {
              ...state.donor,
              coupons: [newCoupon, ...state.donor.coupons],
            },
            celebration: {
              title: "🎁 Special Coupon Granted!",
              desc: `Administrator has granted you a special reward coupon: "${coupon.name}" (${coupon.code})! Check your wallet.`,
              type: "manual" as const,
            },
          };
        });
      },

      clearCelebration: () => set({ celebration: null }),

      addRewardPoints: (points) => {
        set((state) => {
          if (!state.donor) return state;
          return {
            donor: {
              ...state.donor,
              rewardPoints: state.donor.rewardPoints + points,
            },
          };
        });
      },
    }),
    {
      name: "vasavi-donor-storage",
    }
  )
);
