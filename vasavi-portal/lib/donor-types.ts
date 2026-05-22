export type DonorStatus = "active" | "pending_approval" | "suspended" | "archived";

export type SponsorshipType =
  | "room_sponsor"
  | "building_sponsor"
  | "annadanam_sponsor"
  | "event_sponsor"
  | "lifetime_donor"
  | "temple_development"
  | "festival_sponsor";

export type BenefitType =
  | "free_stay"
  | "percentage_discount"
  | "fixed_compensation"
  | "annual_complimentary_nights"
  | "family_benefit"
  | "festival_benefit"
  | "vip_booking"
  | "custom_reward";

export type CouponStatus = "active" | "used" | "expired" | "revoked";

export interface CouponUsageRecord {
  usedAt: string;
  hotelId: string;
  hotelName: string;
  bookingRef: string;
  amountApplied: number;
  remainingAfter: number;
}

export interface DonorCoupon {
  id: string;
  code: string;
  benefitType: BenefitType;
  label: string;
  issuedAt: string;
  expiresAt: string;
  initialValue: number;
  remainingBalance: number;
  status: CouponStatus;
  usageHistory: CouponUsageRecord[];
}

export interface DonationTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  paymentMethod: string;
  receiptNo: string;
  notes?: string;
}

export interface DonorDocument {
  id: string;
  name: string;
  type: "certificate" | "receipt" | "recognition" | "appreciation" | "other";
  uploadedAt: string;
}

export interface PlatformDonor {
  id: string;
  donorId: string;
  profilePhoto: string;
  familyPhoto?: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  donationCategory: string;
  totalContribution: number;
  sponsorshipTypes: SponsorshipType[];
  membershipLevel: string;
  status: DonorStatus;
  notes: string;
  validityStart: string;
  validityEnd: string;
  rewardEligibility: string[];
  freeStayAllocation: number;
  compensationAllocation: number;
  appreciationMessage?: string;
  coupons: DonorCoupon[];
  transactions: DonationTransaction[];
  documents: DonorDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface DonorAnalytics {
  totalDonors: number;
  activeDonors: number;
  pendingApproval: number;
  totalContributions: number;
  activeBenefits: number;
  expiredBenefits: number;
  utilizationRate: number;
  topContributors: { name: string; amount: number }[];
  hotelWiseStays: { hotel: string; stays: number; savings: number }[];
  monthlyContributions: { month: string; amount: number }[];
}
