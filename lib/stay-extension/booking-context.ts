import type { ManagerBooking } from "@/lib/types";
import type { ExtensionBookingContext } from "./types";

/** Map API booking DTO to stay-extension pricing context. */
export function managerBookingToExtensionContext(
  booking: ManagerBooking
): ExtensionBookingContext {
  const subtotal = Math.round(booking.baseAmountPaise / 100);
  const discount = Math.round(booking.discountAmountPaise / 100);
  const total = Math.round(booking.finalAmountPaise / 100);
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxes = Math.max(0, total - afterDiscount);

  return {
    id: booking.id,
    reference: booking.reference,
    hotelId: booking.hotelId,
    hotelName: booking.hotelName,
    guestName: booking.guestName,
    guestEmail: `${booking.guestPhone}@vasavi.local`,
    guestPhone: booking.guestPhone,
    roomType: booking.roomType,
    roomNumber: booking.roomNumber,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    subtotal,
    taxes,
    total,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
  };
}
