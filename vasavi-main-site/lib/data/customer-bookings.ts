import { MOCK_DONOR } from "@/lib/data/hotels";
import type { DonorBooking } from "@/types";

const EXTRA_BOOKINGS: DonorBooking[] = [
  {
    id: "b3",
    reference: "VH-4D6E8F",
    hotelId: "1",
    hotelName: "Sri Vasavi Nityannadana Residency",
    roomType: "Standard Non-AC",
    roomNumber: "101",
    checkIn: "2026-05-21",
    checkOut: "2026-05-23",
    nights: 2,
    subtotal: 5000,
    totalPaid: 5600,
    discountApplied: 0,
    status: "checked_in",
    guestEmail: "priya@example.com",
    guestPhone: "+91 90123 45678",
  },
];

export const CUSTOMER_BOOKINGS: DonorBooking[] = [...MOCK_DONOR.bookings, ...EXTRA_BOOKINGS];

export function getCustomerBooking(id: string): DonorBooking | undefined {
  return CUSTOMER_BOOKINGS.find((b) => b.id === id);
}

export function canExtendCustomerBooking(booking: DonorBooking): boolean {
  return booking.status === "confirmed" || booking.status === "checked_in";
}

export function minExtensionDate(checkOut: string): string {
  const d = new Date(checkOut);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
