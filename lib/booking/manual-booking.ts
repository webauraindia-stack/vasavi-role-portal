import { differenceInCalendarDays, eachDayOfInterval, parseISO } from "date-fns";
import type { GuestType, ManagerBooking, PaymentStatus, RoomInventory } from "@/lib/types";

const TAX_RATE = 0.12;

const NIGHTLY_BY_CATEGORY: Record<string, number> = {
  Standard: 2500,
  Deluxe: 3750,
  Suite: 5000,
  Penthouse: 7000,
};

const TIER_DISCOUNT: Partial<Record<GuestType, number>> = {
  kcgf_donor: 0.3,
  vci_member: 0.1,
  vksp_member: 0.1,
  sponsorship_patron: 0.5,
  free_stay_eligible: 1,
};

export interface ManualBookingInput {
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  memberId?: string;
  guestType: GuestType;
  roomId: string;
  checkIn: string;
  checkOut: string;
  paymentStatus: PaymentStatus;
  bookingStatus: "confirmed" | "checked_in";
  source: "walk_in" | "phone";
  specialRequests?: string;
  createdBy?: string;
}

export interface ManualBookingPricing {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  tierDiscount: number;
  taxes: number;
  total: number;
}

export interface RoomAvailabilityResult {
  available: boolean;
  reason?: string;
}

function stayNights(checkIn: string, checkOut: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)));
}

function activeBookingStatuses(): ManagerBooking["bookingStatus"][] {
  return ["pending", "confirmed", "checked_in"];
}

export function nightlyRateForRoom(room: RoomInventory): number {
  return NIGHTLY_BY_CATEGORY[room.category] ?? 2500;
}

export function calculateManualBookingPricingFromPaise(
  basePricePerNightPaise: number,
  nights: number,
  guestType: GuestType
): ManualBookingPricing {
  const nightlyRate = Math.max(0, Math.round(basePricePerNightPaise / 100));
  const subtotal = nightlyRate * nights;
  const tierPct = TIER_DISCOUNT[guestType] ?? 0;
  const tierDiscount = Math.round(subtotal * tierPct);
  const taxable = Math.max(0, subtotal - tierDiscount);
  const taxes = Math.round(taxable * TAX_RATE);
  const total = taxable + taxes;
  return { nights, nightlyRate, subtotal, tierDiscount, taxes, total };
}

export function calculateManualBookingPricing(
  room: RoomInventory,
  nights: number,
  guestType: GuestType
): ManualBookingPricing {
  const nightlyRate = nightlyRateForRoom(room);
  const subtotal = nightlyRate * nights;
  const tierPct = TIER_DISCOUNT[guestType] ?? 0;
  const tierDiscount = Math.round(subtotal * tierPct);
  const taxable = Math.max(0, subtotal - tierDiscount);
  const taxes = Math.round(taxable * TAX_RATE);
  const total = taxable + taxes;

  return { nights, nightlyRate, subtotal, tierDiscount, taxes, total };
}

export function checkRoomAvailableForDates(
  room: RoomInventory,
  checkIn: string,
  checkOut: string,
  bookings: ManagerBooking[],
  excludeBookingId?: string
): RoomAvailabilityResult {
  const inDate = parseISO(checkIn);
  const outDate = parseISO(checkOut);

  if (outDate <= inDate) {
    return { available: false, reason: "Checkout must be after check-in." };
  }

  if (room.status === "maintenance") {
    const until = room.maintenanceUntil ? parseISO(room.maintenanceUntil) : null;
    if (!until || inDate < until) {
      return {
        available: false,
        reason: `Room ${room.number} is under maintenance${
          room.maintenanceUntil ? ` until ${room.maintenanceUntil}` : ""
        }.`,
      };
    }
  }

  if (room.status === "blocked") {
    const until = room.blockedUntil ? parseISO(room.blockedUntil) : null;
    if (!until || inDate < until) {
      return {
        available: false,
        reason: `Room ${room.number} is blocked${
          room.blockedReason ? `: ${room.blockedReason}` : ""
        }.`,
      };
    }
  }

  const stayDays = eachDayOfInterval({ start: inDate, end: outDate }).slice(0, -1);
  if (stayDays.length === 0) {
    return { available: false, reason: "Stay must be at least one night." };
  }

  const conflicts = bookings.filter((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.hotelId !== room.hotelId || b.roomNumber !== room.number) return false;
    if (!activeBookingStatuses().includes(b.bookingStatus)) return false;

    const bIn = parseISO(b.checkIn);
    const bOut = parseISO(b.checkOut);
    return stayDays.some((day) => day >= bIn && day < bOut);
  });

  if (conflicts.length > 0) {
    const ref = conflicts[0]?.reference ?? "another guest";
    return {
      available: false,
      reason: `Room ${room.number} is booked (${ref}) for overlapping dates.`,
    };
  }

  return { available: true };
}

export function findAvailableRoomsForStay(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  rooms: RoomInventory[],
  bookings: ManagerBooking[]
): { room: RoomInventory; pricing: ManualBookingPricing }[] {
  return rooms
    .filter((r) => r.hotelId === hotelId)
    .map((room) => {
      const check = checkRoomAvailableForDates(room, checkIn, checkOut, bookings);
      if (!check.available) return null;
      const nights = stayNights(checkIn, checkOut);
      return { room, pricing: calculateManualBookingPricing(room, nights, "visitor") };
    })
    .filter((x): x is { room: RoomInventory; pricing: ManualBookingPricing } => x !== null)
    .sort((a, b) => a.pricing.total - b.pricing.total);
}

export function guestTypeLabel(type: GuestType): string {
  const labels: Record<GuestType, string> = {
    visitor: "General Visitor",
    vci_member: "VCI Member",
    kcgf_donor: "KCGF Donor",
    vksp_member: "VKSP Member",
    service_volunteer: "Seva Volunteer",
    sponsorship_patron: "Sponsorship Patron",
    free_stay_eligible: "Free Stay Eligible",
    compensation_holder: "Compensation Wallet",
  };
  return labels[type];
}

export function buildManualBooking(
  input: ManualBookingInput,
  room: RoomInventory,
  bookings: ManagerBooking[]
): { booking?: ManagerBooking; error?: string } {
  const availability = checkRoomAvailableForDates(
    room,
    input.checkIn,
    input.checkOut,
    bookings
  );
  if (!availability.available) {
    return { error: availability.reason ?? "Room not available" };
  }

  const nights = stayNights(input.checkIn, input.checkOut);
  const pricing = calculateManualBookingPricing(room, nights, input.guestType);
  const ref = `VH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const isFreeStay = input.guestType === "free_stay_eligible" || pricing.total === 0;

  const booking: ManagerBooking = {
    id: `bk-manual-${Date.now()}`,
    reference: ref,
    qrCode: ref,
    hotelId: input.hotelId,
    hotelName: input.hotelName,
    guestName: input.guestName.trim(),
    guestEmail: input.guestEmail.trim(),
    guestPhone: input.guestPhone.trim(),
    memberId: input.memberId?.trim() || undefined,
    guestType: input.guestType,
    guestTypeLabel: guestTypeLabel(input.guestType),
    donorTier: input.guestType === "kcgf_donor" ? "Gold" : undefined,
    roomType: room.name,
    roomNumber: room.number,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights,
    subtotal: pricing.subtotal,
    tierDiscount: pricing.tierDiscount,
    couponDiscount: 0,
    walletApplied: 0,
    taxes: pricing.taxes,
    total: isFreeStay ? 0 : pricing.total,
    paymentStatus: isFreeStay ? "free_stay" : input.paymentStatus,
    bookingStatus: input.bookingStatus,
    specialRequests: input.specialRequests?.trim() || undefined,
    source: input.source === "walk_in" || input.source === "phone" ? "in_house" : input.source,
    isInHouse: true,
    roomId: room.id,
    appliedCoupons: [],
    isVip: input.guestType === "kcgf_donor" || input.guestType === "sponsorship_patron",
    createdAt: new Date().toISOString(),
  };

  return { booking };
}

export function shouldMarkRoomOccupied(
  bookingStatus: ManagerBooking["bookingStatus"],
  checkIn: string
): boolean {
  return bookingStatus === "checked_in";
}
