import type { ManagerBooking } from "@/lib/types";

export function paiseToRupees(paise: number): number {
  return Math.round((paise ?? 0) / 100);
}

export function bookingRevenueRupees(booking: ManagerBooking): number {
  return paiseToRupees(booking.finalAmountPaise);
}

export function bookingDiscountRupees(booking: ManagerBooking): number {
  return paiseToRupees(booking.discountAmountPaise);
}
