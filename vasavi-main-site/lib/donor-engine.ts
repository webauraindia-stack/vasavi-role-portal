import type { DonorTier, TierInfo, Coupon, CouponType } from "@/types";

export const TIER_THRESHOLDS: TierInfo[] = [
  {
    tier: "bronze",
    name: "Bronze",
    minAmount: 5000,
    maxAmount: 24999,
    discountPercent: 10,
    benefits: [
      "10% discount on all standard rooms",
      "Priority check-in",
    ],
    colorClass: "from-amber-700 to-amber-900",
  },
  {
    tier: "silver",
    name: "Silver",
    minAmount: 25000,
    maxAmount: 99999,
    discountPercent: 20,
    benefits: [
      "20% discount on all rooms",
      "Complimentary early check-in",
      "Late checkout",
    ],
    colorClass: "from-slate-400 to-slate-600",
  },
  {
    tier: "gold",
    name: "Gold",
    minAmount: 100000,
    maxAmount: 499999,
    discountPercent: 30,
    benefits: [
      "30% discount on all rooms",
      "Access to suite-category rooms",
      "Welcome amenity on arrival",
    ],
    colorClass: "from-champagne to-amber-600",
  },
  {
    tier: "platinum",
    name: "Platinum",
    minAmount: 500000,
    maxAmount: 999999,
    discountPercent: 50,
    benefits: [
      "50% discount on all room categories",
      "Access to donor-exclusive rooms",
      "Dedicated concierge",
      "Complimentary airport transfer",
    ],
    colorClass: "from-violet-300 via-champagne to-slate-300",
  },
  {
    tier: "elite",
    name: "Elite",
    minAmount: 1000000,
    maxAmount: null,
    discountPercent: 75,
    benefits: [
      "75% discount on all room categories",
      "Unlimited access to spiritual suites & VIP seats",
      "Complimentary private Satsang meetings",
      "Complimentary family Satvik catering",
      "Personal dedicated community butler & express transit",
    ],
    colorClass: "from-slate-900 via-amber-500 to-amber-700",
  },
];

export function getTierFromDonation(amount: number): DonorTier {
  if (amount >= 1000000) return "elite";
  if (amount >= 500000) return "platinum";
  if (amount >= 100000) return "gold";
  if (amount >= 25000) return "silver";
  if (amount >= 5000) return "bronze";
  return null;
}

export function getTierInfo(tier: DonorTier): TierInfo | undefined {
  return TIER_THRESHOLDS.find((t) => t.tier === tier);
}

export function getDiscountPercent(tier: DonorTier): number {
  return getTierInfo(tier)?.discountPercent ?? 0;
}

export function getMonthlyQuota(tier: DonorTier): number {
  switch (tier) {
    case "elite":
      return 20;
    case "platinum":
      return 12;
    case "gold":
      return 8;
    case "silver":
      return 6;
    case "bronze":
      return 4;
    default:
      return 0;
  }
}

export function canAccessDonorRoom(
  tier: DonorTier,
  requiredTier?: DonorTier
): boolean {
  if (!requiredTier) return true;
  if (!tier) return false;
  const order: DonorTier[] = ["bronze", "silver", "gold", "platinum", "elite"];
  const userIdx = order.indexOf(tier);
  const reqIdx = order.indexOf(requiredTier);
  return userIdx >= reqIdx;
}

export function calculateDonorDiscount(
  subtotal: number,
  tier: DonorTier
): number {
  const percent = getDiscountPercent(tier);
  return Math.round((subtotal * percent) / 100);
}

export function getNextTierProgress(
  totalDonation: number
): { nextTier: TierInfo | null; progress: number } {
  const currentTier = getTierFromDonation(totalDonation);
  const currentIdx = TIER_THRESHOLDS.findIndex((t) => t.tier === currentTier);
  const nextTier = TIER_THRESHOLDS[currentIdx + 1] ?? null;
  if (!nextTier) return { nextTier: null, progress: 100 };
  const currentMin = TIER_THRESHOLDS[currentIdx]?.minAmount ?? 0;
  const range = nextTier.minAmount - currentMin;
  const progress = Math.min(
    100,
    ((totalDonation - currentMin) / range) * 100
  );
  return { nextTier, progress };
}

export function calculateBookingTotal(
  nightlyRate: number,
  nights: number,
  roomCount: number,
  tier: DonorTier,
  promoDiscount = 0
): {
  subtotal: number;
  taxes: number;
  donorDiscount: number;
  total: number;
} {
  const subtotal = nightlyRate * nights * roomCount;
  const donorDiscount = calculateDonorDiscount(subtotal, tier);
  const afterDonor = subtotal - donorDiscount - promoDiscount;
  const taxes = Math.round(afterDonor * 0.12);
  const total = afterDonor + taxes;
  return { subtotal, taxes, donorDiscount, total };
}

export function validateCoupon(
  coupon: Coupon,
  subtotal: number
): { valid: boolean; reason?: string } {
  if (coupon.status !== "available") {
    return { valid: false, reason: "Coupon has already been used or expired" };
  }
  const expiry = new Date(coupon.expiryDate);
  const now = new Date();
  if (expiry < now) {
    return { valid: false, reason: "Coupon has expired" };
  }
  if (subtotal < coupon.minBookingAmount) {
    return {
      valid: false,
      reason: `Booking must be at least ₹${coupon.minBookingAmount.toLocaleString()} to apply this coupon`,
    };
  }
  return { valid: true };
}

export function suggestBestCoupons(
  coupons: Coupon[],
  subtotal: number
): { selectedIds: string[]; totalDiscount: number; message: string } {
  const available = coupons.filter((c) => validateCoupon(c, subtotal).valid);

  if (available.length === 0) {
    return { selectedIds: [], totalDiscount: 0, message: "No applicable coupons found." };
  }

  // Option A: Use a completely free booking coupon if present
  const freeBookingCoupons = available.filter((c) => c.type === "free_booking");
  let bestFreeBooking: Coupon | null = null;
  if (freeBookingCoupons.length > 0) {
    // Pick the one closest to expiry
    bestFreeBooking = freeBookingCoupons.sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    )[0];
  }

  // Option B: Stack multiple compensation credits or discount percentages
  const stackable = available.filter((c) => c.type !== "free_booking");
  
  const stackableWithSavings = stackable.map((c) => {
    let savings = 0;
    if (c.type === "fixed_compensation") {
      savings = c.value;
    } else if (c.type === "percentage_discount" || c.type === "festival_special") {
      savings = Math.round((subtotal * c.value) / 100);
    } else if (c.type === "premium_benefit") {
      savings = c.value;
    }
    return { coupon: c, savings };
  });

  stackableWithSavings.sort((a, b) => b.savings - a.savings);

  // Take up to 3 stackable coupons
  const selectedStackable = stackableWithSavings.slice(0, 3);
  const stackableTotalSavings = selectedStackable.reduce((sum, item) => sum + item.savings, 0);
  const stackableIds = selectedStackable.map((item) => item.coupon.id);

  // Compare Option A vs Option B
  if (bestFreeBooking && subtotal >= stackableTotalSavings) {
    return {
      selectedIds: [bestFreeBooking.id],
      totalDiscount: subtotal,
      message: `✨ Suggested Best Choice: Applied free booking coupon "${bestFreeBooking.code}" to cover the full room rate (Saved ₹${subtotal.toLocaleString()})!`,
    };
  } else if (stackableIds.length > 0) {
    const finalSavings = Math.min(subtotal, stackableTotalSavings);
    const codesJoined = selectedStackable.map((item) => item.coupon.code).join(", ");
    return {
      selectedIds: stackableIds,
      totalDiscount: finalSavings,
      message: `✨ Suggested Best Choice: Stacked ${selectedStackable.length} coupons (${codesJoined}) to save ₹${finalSavings.toLocaleString()}!`,
    };
  }

  return { selectedIds: [], totalDiscount: 0, message: "No optimal combination found." };
}

export function calculateLoyaltyPoints(
  donationAmount: number,
  currentTier: DonorTier
): number {
  // Base points: 1 point per ₹10 donated
  const basePoints = Math.floor(donationAmount / 10);
  
  let multiplier = 1.0;
  if (currentTier === "bronze") multiplier = 1.05;
  else if (currentTier === "silver") multiplier = 1.1;
  else if (currentTier === "gold") multiplier = 1.2;
  else if (currentTier === "platinum") multiplier = 1.35;
  else if (currentTier === "elite") multiplier = 1.5; 

  return Math.round(basePoints * multiplier);
}

export function generateCouponCode(type: CouponType, value: number): string {
  const prefix = {
    free_booking: "FREE",
    percentage_discount: "PCT",
    fixed_compensation: "COMP",
    special_access: "SEVA",
    premium_benefit: "VIP",
    festival_special: "FEST",
  }[type] || "REWARD";
  
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${value > 0 ? value : "STAY"}-${rand}`;
}
