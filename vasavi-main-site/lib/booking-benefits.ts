import type {
  AppliedBenefitLine,
  BenefitWalletSummary,
  BookingPricingResult,
  Coupon,
  Donor,
  DonorTier,
} from "@/types";
import {
  calculateDonorDiscount,
  getDiscountPercent,
  suggestBestCoupons,
  validateCoupon,
} from "@/lib/donor-engine";

const TAX_RATE = 0.12;

export function getBenefitWalletSummary(donor: Donor | null): BenefitWalletSummary {
  if (!donor) {
    return {
      freeStayCoupons: 0,
      discountCoupons: 0,
      compensationBalance: 0,
      festivalCoupons: 0,
      donorRewardActive: false,
      tierDiscountPercent: 0,
      headlineBenefits: [],
    };
  }

  const available = donor.coupons.filter((c) => c.status === "available");
  const freeStayCoupons = available.filter((c) => c.type === "free_booking").length;
  const discountCoupons = available.filter(
    (c) =>
      c.type === "percentage_discount" ||
      c.type === "premium_benefit" ||
      c.type === "special_access"
  ).length;
  const festivalCoupons = available.filter((c) => c.type === "festival_special").length;
  const donorRewardActive = available.some(
    (c) => c.source.toLowerCase().includes("donor reward")
  );

  const headlines: string[] = [];
  if (freeStayCoupons > 0) {
    headlines.push(
      `${freeStayCoupons} Free Stay Coupon${freeStayCoupons > 1 ? "s" : ""} Available`
    );
  }
  if (donor.compensationCredits > 0) {
    headlines.push(`₹${donor.compensationCredits.toLocaleString("en-IN")} Compensation Balance`);
  }
  if (festivalCoupons > 0) {
    headlines.push("Festival Special Coupon");
  }
  if (donorRewardActive) {
    headlines.push("Donor Reward Benefit");
  }
  if (getDiscountPercent(donor.tier) > 0) {
    headlines.push(`${getDiscountPercent(donor.tier)}% ${donor.tier} tier blessing`);
  }

  return {
    freeStayCoupons,
    discountCoupons,
    compensationBalance: donor.compensationCredits,
    festivalCoupons,
    donorRewardActive,
    tierDiscountPercent: getDiscountPercent(donor.tier),
    headlineBenefits: headlines,
  };
}

function couponSavings(coupon: Coupon, base: number): number {
  switch (coupon.type) {
    case "free_booking":
      return base;
    case "percentage_discount":
    case "festival_special":
      return Math.round((base * coupon.value) / 100);
    case "fixed_compensation":
    case "premium_benefit":
    case "special_access":
      return coupon.value;
    default:
      return 0;
  }
}

export function calculateCouponDiscount(
  coupons: Coupon[],
  selectedIds: string[],
  afterTierSubtotal: number
): { discount: number; consumedIds: string[]; lines: AppliedBenefitLine[] } {
  const lines: AppliedBenefitLine[] = [];
  let discount = 0;
  const consumedIds: string[] = [];

  const hasFree = selectedIds.some((id) => {
    const c = coupons.find((x) => x.id === id);
    return c?.type === "free_booking";
  });

  if (hasFree) {
    const freeId = selectedIds.find((id) => coupons.find((c) => c.id === id)?.type === "free_booking");
    const freeCoupon = coupons.find((c) => c.id === freeId);
    if (freeCoupon && validateCoupon(freeCoupon, afterTierSubtotal).valid) {
      discount = afterTierSubtotal;
      consumedIds.push(freeCoupon.id);
      lines.push({
        id: freeCoupon.id,
        label: freeCoupon.name,
        amount: afterTierSubtotal,
        type: "coupon",
        detail: "Full stay covered by community blessing",
      });
      return { discount, consumedIds, lines };
    }
  }

  let runningBase = afterTierSubtotal;
  for (const id of selectedIds) {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon || !validateCoupon(coupon, afterTierSubtotal).valid) continue;
    if (coupon.type === "free_booking") continue;

    const saving = Math.min(runningBase, couponSavings(coupon, runningBase));
    if (saving <= 0) continue;

    discount += saving;
    runningBase = Math.max(0, runningBase - saving);
    consumedIds.push(coupon.id);
    lines.push({
      id: coupon.id,
      label: coupon.name,
      amount: saving,
      type: "coupon",
      detail: coupon.code,
    });
  }

  discount = Math.min(afterTierSubtotal, discount);
  return { discount, consumedIds, lines };
}

export interface PricingInput {
  nightlyRate: number;
  nights: number;
  roomCount: number;
  tier: DonorTier;
  coupons: Coupon[];
  selectedCouponIds: string[];
  compensationWallet: number;
  useWalletAmount: number;
  promoDiscount?: number;
  sevaDonation?: number;
  autoSuggest?: boolean;
}

export function calculateBookingPricing(input: PricingInput): BookingPricingResult {
  const {
    nightlyRate,
    nights,
    roomCount,
    tier,
    coupons,
    selectedCouponIds,
    compensationWallet,
    useWalletAmount,
    promoDiscount = 0,
    sevaDonation = 0,
    autoSuggest = false,
  } = input;

  const subtotal = nightlyRate * nights * roomCount;
  const tierDiscount = calculateDonorDiscount(subtotal, tier);
  const afterTier = subtotal - tierDiscount;

  let couponIds = [...selectedCouponIds];
  let suggestionMessage = "";

  if (autoSuggest && couponIds.length === 0 && coupons.length > 0) {
    const suggestion = suggestBestCoupons(coupons, afterTier);
    couponIds = suggestion.selectedIds;
    suggestionMessage = suggestion.message;
  }

  const appliedLines: AppliedBenefitLine[] = [];

  if (tierDiscount > 0) {
    appliedLines.push({
      id: "tier-discount",
      label: `${tier} tier community blessing`,
      amount: tierDiscount,
      type: "tier",
      detail: `${getDiscountPercent(tier)}% member discount`,
    });
  }

  const { discount: couponDiscount, consumedIds, lines: couponLines } =
    calculateCouponDiscount(coupons, couponIds, afterTier);

  appliedLines.push(...couponLines);

  const afterCoupons = Math.max(0, afterTier - couponDiscount);
  const walletApplied = Math.min(
    afterCoupons,
    useWalletAmount,
    compensationWallet
  );

  if (walletApplied > 0) {
    appliedLines.push({
      id: "compensation-wallet",
      label: "Compensation wallet applied",
      amount: walletApplied,
      type: "wallet",
      detail: `₹${walletApplied.toLocaleString("en-IN")} from seva & milestone credits`,
    });
  }

  const afterWallet = Math.max(0, afterCoupons - walletApplied - promoDiscount);
  const taxes = Math.round(afterWallet * TAX_RATE);
  const total = afterWallet + taxes + sevaDonation;
  const isFullyCovered = total === 0 || (afterWallet === 0 && sevaDonation === 0);

  const availableFree = coupons.filter(
    (c) => c.status === "available" && c.type === "free_booking"
  ).length;
  const remainingFreeStays = Math.max(
    0,
    availableFree - consumedIds.filter((id) => coupons.find((c) => c.id === id)?.type === "free_booking").length
  );

  return {
    nights,
    subtotal,
    tierDiscount,
    couponDiscount,
    walletApplied,
    promoDiscount,
    taxableBase: afterWallet,
    taxes,
    sevaDonation,
    total,
    isFullyCovered,
    appliedLines,
    remainingFreeStays,
    remainingCompensation: Math.max(0, compensationWallet - walletApplied),
    couponsConsumed: consumedIds,
    suggestionMessage,
  };
}

export function canStackCoupon(
  selectedIds: string[],
  coupon: Coupon,
  allCoupons: Coupon[]
): boolean {
  if (coupon.type === "free_booking") {
    return selectedIds.length === 0 || selectedIds.includes(coupon.id);
  }
  const hasFree = selectedIds.some(
    (id) => allCoupons.find((c) => c.id === id)?.type === "free_booking"
  );
  if (hasFree) return false;
  const stackableCount = selectedIds.filter((id) => {
    const c = allCoupons.find((x) => x.id === id);
    return c && c.type !== "free_booking";
  }).length;
  return stackableCount < 3 || selectedIds.includes(coupon.id);
}
