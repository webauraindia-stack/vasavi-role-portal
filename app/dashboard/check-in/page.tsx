"use client";

import { useEffect, useMemo, useState } from "react";
import { useManagerStore } from "@/stores/manager-store";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Calendar, ChevronRight } from "lucide-react";
import {
  cn,
  formatDate,
  formatDateTime,
  formatCurrency,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/utils";
import type { ManagerBooking } from "@/lib/types";

export default function CheckInScreen() {
  const { bookings, hotelId, recordCashPayment, updateBookingStatus } = useManagerStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [cashRef, setCashRef] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  // Filter for today's arrivals (checkIn == today)
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD local enough for now, backend checkIn is YYYY-MM-DD
  
  const todayArrivals = useMemo(() => {
    let list = bookings;
    if (hotelId !== "all") {
      list = list.filter((b) => b.hotelId === hotelId);
    }
    list = list.filter((b) => b.checkIn === todayStr);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.reference.toLowerCase().includes(q) ||
          b.roomNumber?.toLowerCase().includes(q) ||
          b.guestPhone.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, hotelId, todayStr, query]);

  const stats = useMemo(() => {
    const total = todayArrivals.length;
    const checkedIn = todayArrivals.filter((b) => b.bookingStatus === "checked_in").length;
    const pendingPayment = todayArrivals.filter((b) => b.paymentStatus !== "paid" && b.paymentStatus !== "free_stay").length;
    return { total, checkedIn, pendingPayment };
  }, [todayArrivals]);

  const handleRecordCash = async (booking: ManagerBooking) => {
    if (!accessToken) return;
    setBusy(`cash-${booking.id}`);
    const ref = cashRef[booking.id]?.trim();
    const res = await recordCashPayment(booking.id, accessToken, { paymentReference: ref });
    setBusy(null);
    if (res.ok) {
      toast.success("Payment recorded", "Guest can now be checked in.");
      setCashRef((prev) => ({ ...prev, [booking.id]: "" }));
    } else {
      toast.error(res.error ?? "Payment failed");
    }
  };

  const handleCheckIn = async (booking: ManagerBooking) => {
    if (!accessToken) return;
    setBusy(`checkin-${booking.id}`);
    const res = await updateBookingStatus(booking.id, "checked_in", accessToken);
    setBusy(null);
    if (res.ok) {
      toast.success("Checked In!", `${booking.guestName} has been checked in.`);
    } else {
      toast.error(res.error ?? "Check-in failed");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-charcoal">Check-in Desk</h1>
          <p className="text-muted mt-1 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            {formatDate(todayStr)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium bg-surface px-4 py-2 rounded-xl border border-beige/60">
          <span className="text-charcoal">{stats.total} arrivals</span>
          <span className="text-beige">|</span>
          <span className="text-emerald-700">{stats.checkedIn} checked in</span>
          <span className="text-beige">|</span>
          <span className="text-amber-700">{stats.pendingPayment} pending payment</span>
        </div>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          placeholder="Search by name, reference, phone or room…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {todayArrivals.length === 0 ? (
          <div className="card-manager py-16 text-center text-muted">
            {query.trim() ? "No matching arrivals found." : "No arrivals scheduled for today."}
          </div>
        ) : (
          todayArrivals.map((booking) => {
            const isCheckedIn = booking.bookingStatus === "checked_in";
            const isPaid = booking.paymentStatus === "paid" || booking.paymentStatus === "free_stay";
            const canCheckIn = isPaid && !isCheckedIn && booking.bookingStatus !== "cancelled";

            return (
              <div
                key={booking.id}
                className={cn(
                  "card-manager p-4 sm:p-5 transition-colors",
                  isCheckedIn ? "bg-emerald-50/50 border-emerald-200/50" : ""
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-champagne/10 flex items-center justify-center shrink-0">
                      <span className="font-bold text-champagne-dark">
                        {booking.guestName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-charcoal truncate">{booking.guestName}</h2>
                        <span className="text-xs font-mono text-muted">{booking.reference}</span>
                        {isCheckedIn && (
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Checked in
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-0.5">
                        {booking.roomType} {booking.roomNumber ? `(Room ${booking.roomNumber})` : ""} · {booking.nights} night(s)
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-[10px]", PAYMENT_STATUS_COLORS[booking.paymentStatus])}>
                          {booking.paymentStatus.replace("_", " ")}
                        </Badge>
                        <span className="text-xs font-mono font-medium">
                          {booking.finalAmountDisplay || formatCurrency(booking.finalAmountPaise / 100)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isCheckedIn && booking.bookingStatus !== "cancelled" && (
                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                      {!isPaid && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <Input
                            placeholder="Receipt number (optional)"
                            value={cashRef[booking.id] || ""}
                            onChange={(e) => setCashRef((p) => ({ ...p, [booking.id]: e.target.value }))}
                            className="h-9 w-full sm:w-48 text-xs"
                          />
                          <Button
                            variant="gold"
                            size="sm"
                            disabled={busy === `cash-${booking.id}`}
                            onClick={() => handleRecordCash(booking)}
                            className="whitespace-nowrap"
                          >
                            {busy === `cash-${booking.id}` ? "Recording…" : "Record Cash"}
                          </Button>
                        </div>
                      )}

                      <Button
                        variant={canCheckIn ? "default" : "outline"}
                        disabled={!canCheckIn || busy === `checkin-${booking.id}`}
                        onClick={() => handleCheckIn(booking)}
                        className="w-full sm:w-auto min-w-[120px]"
                        title={!canCheckIn && !isPaid ? "Payment required before check-in" : ""}
                      >
                        {busy === `checkin-${booking.id}` ? "Checking in…" : "Check In"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

                  {isCheckedIn && (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm sm:pl-4">
                      <CheckCircle2 className="h-5 w-5" />
                      Checked in
                    </div>
                  )}

                  {booking.bookingStatus === "cancelled" && (
                    <div className="flex items-center gap-2 text-rose-700 font-medium text-sm">
                      Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
