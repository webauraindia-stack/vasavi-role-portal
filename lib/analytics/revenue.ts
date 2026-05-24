import type { DailyRevenue } from "@/lib/types";
import type { ManagerBooking } from "@/lib/types";

/** Build a 7-day revenue chart from paid bookings. */
export function revenueFromBookings(bookings: ManagerBooking[]): DailyRevenue[] {
  const days: DailyRevenue[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });

    const dayBookings = bookings.filter(
      (b) =>
        b.paymentStatus === "paid" &&
        (b.checkIn === key || b.createdAt.slice(0, 10) === key)
    );

    const revenue = dayBookings.reduce((sum, b) => sum + b.total, 0);
    const donorSavings = dayBookings.reduce(
      (sum, b) => sum + b.couponDiscount + b.tierDiscount + b.walletApplied,
      0
    );

    days.push({
      date: label,
      revenue,
      donorSavings,
      bookings: dayBookings.length,
    });
  }

  return days;
}
