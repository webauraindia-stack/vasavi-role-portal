import type { ManagerBooking, ManagerNotification } from "@/lib/types";

/** Derive portal alerts from recent bookings (no separate notifications API yet). */
export function notificationsFromBookings(
  bookings: ManagerBooking[]
): ManagerNotification[] {
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sorted.slice(0, 20).map((b) => {
    let type: ManagerNotification["type"] = "new_booking";
    let title = "New booking";
    let priority: ManagerNotification["priority"] = "medium";

    if (b.paymentStatus === "pending") {
      type = "payment_pending";
      title = "Payment pending";
      priority = "high";
    } else if (b.isVip) {
      type = "vip_arrival";
      title = "Donor arrival";
      priority = "high";
    }

    return {
      id: `n-${b.id}`,
      type,
      title,
      message: `${b.guestName} — ${b.roomType}, ${b.nights} night(s). Ref ${b.reference}.`,
      time: b.createdAt,
      read: false,
      priority,
      hotelId: b.hotelId,
    };
  });
}
