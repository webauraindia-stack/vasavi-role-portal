import type { BookingStatus, ManagerBooking, PaymentStatus } from "@/lib/types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
  no_show: "No-show",
};

/** Mirrors backend ``BookingStatusUpdateSerializer._ALLOWED``. */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["checked_out", "confirmed"],
  checked_out: [],
  cancelled: [],
  no_show: ["confirmed"],
};

export type StatusActionKind = "update" | "cancel";

export type StatusAction = {
  status: BookingStatus;
  label: string;
  description: string;
  kind: StatusActionKind;
  requiresReason: boolean;
  tone: "primary" | "danger" | "warning";
};

function isPaidForCheckIn(payment: PaymentStatus): boolean {
  return payment === "paid" || payment === "free_stay";
}

/** Staff actions available for the booking’s current stage. */
export function getAvailableStatusActions(booking: ManagerBooking): StatusAction[] {
  const next = ALLOWED_TRANSITIONS[booking.bookingStatus] ?? [];
  const actions: StatusAction[] = [];

  for (const status of next) {
    if (status === "confirmed") {
      if (booking.bookingStatus === "pending") {
        actions.push({
          status,
          label: "Confirm reservation",
          description: "Guest hold is valid — mark the booking as confirmed.",
          kind: "update",
          requiresReason: false,
          tone: "primary",
        });
      } else if (booking.bookingStatus === "checked_in") {
        actions.push({
          status,
          label: "Undo check-in",
          description: "Guest was checked in by mistake — return to confirmed.",
          kind: "update",
          requiresReason: true,
          tone: "warning",
        });
      } else if (booking.bookingStatus === "no_show") {
        actions.push({
          status,
          label: "Restore to confirmed",
          description: "Guest arrived after a no-show — reopen the reservation.",
          kind: "update",
          requiresReason: true,
          tone: "primary",
        });
      }
      continue;
    }

    if (status === "checked_in") {
      if (!isPaidForCheckIn(booking.paymentStatus)) continue;
      actions.push({
        status,
        label: "Check in guest",
        description: "Guest has paid — mark them as on property.",
        kind: "update",
        requiresReason: false,
        tone: "primary",
      });
      continue;
    }

    if (status === "checked_out") {
      actions.push({
        status,
        label: "Check out guest",
        description: "Guest is leaving — close the stay.",
        kind: "update",
        requiresReason: false,
        tone: "primary",
      });
      continue;
    }

    if (status === "no_show") {
      actions.push({
        status,
        label: "Mark as no-show",
        description: "Guest did not arrive on the check-in date.",
        kind: "update",
        requiresReason: true,
        tone: "warning",
      });
      continue;
    }

    if (status === "cancelled") {
      actions.push({
        status,
        label: "Cancel booking",
        description: "Void this reservation and record a reason.",
        kind: "cancel",
        requiresReason: true,
        tone: "danger",
      });
    }
  }

  return actions;
}

export function canRecordCash(booking: ManagerBooking): boolean {
  return (
    (booking.paymentStatus === "unpaid" || booking.paymentStatus === "partial") &&
    booking.bookingStatus !== "cancelled" &&
    booking.bookingStatus !== "checked_out" &&
    booking.bookingStatus !== "no_show"
  );
}

export function statusUpdateSuccessMessage(
  from: BookingStatus,
  to: BookingStatus
): string {
  const map: Partial<Record<BookingStatus, string>> = {
    confirmed:
      from === "pending"
        ? "Reservation confirmed."
        : from === "no_show"
          ? "Booking restored — guest is confirmed again."
          : "Check-in undone — booking is confirmed again.",
    checked_in: "Guest checked in successfully.",
    checked_out: "Guest checked out. Stay closed.",
    no_show: "Marked as no-show.",
    cancelled: "Booking cancelled.",
  };
  return map[to] ?? `Status updated to ${BOOKING_STATUS_LABELS[to]}.`;
}
