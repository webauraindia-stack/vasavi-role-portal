import { apiFetch } from "@/lib/api/client";
import { fetchAllResults } from "@/lib/api/paginate";
import type { BookingStatus, ManagerBooking, PaymentStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Backend shape (raw API response)
// ---------------------------------------------------------------------------

type BackendUser = { id: string; name: string; phone: string; role: string };

export type BackendBooking = {
  id: string;
  booking_reference: string;
  status: string;
  payment_status: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guest_count: number;
  base_amount_paise: number;
  discount_amount_paise: number;
  final_amount_paise: number;
  base_amount_display?: string;
  discount_display?: string;
  final_amount_display?: string;
  guest_name?: string;
  guest_phone?: string;
  payment_reference?: string | null;
  payment_gateway?: string | null;
  payment_paid_at?: string | null;
  user?: BackendUser;
  branch?: { id: string; name: string; city: string };
  room?: { id: string; room_number: string; room_type?: { name: string } };
  notes?: string;
  // Cancellation
  cancelled_at?: string | null;
  cancellation_reason?: string;
  cancel_initiated_by_role?: string;
  // Refund tracking
  refund_amount: number;
  refund_reference?: string;
  refund_processed_at?: string | null;
  refund_reason?: string;
  refund_requested_at?: string | null;
  refund_requested_reason?: string;
  // Computed helpers from backend
  is_cancellable_by_guest: boolean;
  needs_refund_approval: boolean;
  created_at: string;
  coupons_applied?: { id: string; serial_number?: string; name?: string }[];
};

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

function bookingSourceFromNotes(notes?: string): ManagerBooking["source"] {
  if (!notes) return "website";
  if (notes.includes("[In-house")) return "in_house";
  if (notes.includes("[Walk-in]")) return "walk_in";
  if (notes.includes("[Phone booking]")) return "phone";
  return "website";
}

function mapBookingStatus(status: string): BookingStatus {
  const map: Record<string, BookingStatus> = {
    pending: "pending",
    confirmed: "confirmed",
    checked_in: "checked_in",
    checked_out: "checked_out",
    cancelled: "cancelled",
    no_show: "no_show",
  };
  return map[status] ?? "pending";
}

function mapPaymentStatus(status: string): PaymentStatus {
  const map: Record<string, PaymentStatus> = {
    paid: "paid",
    partial: "partial",
    unpaid: "unpaid",
    refund_pending: "refund_pending",
    refunded: "refunded",
    partially_refunded: "partially_refunded",
    free_stay: "free_stay",
  };
  return map[status] ?? "unpaid";
}

export function mapManagerBooking(b: BackendBooking): ManagerBooking {
  const source = bookingSourceFromNotes(b.notes);
  return {
    id: b.id,
    reference: b.booking_reference,
    hotelId: b.branch?.id ?? "",
    hotelName: b.branch?.name ?? "Property",
    guestName: b.guest_name || b.user?.name || "Guest",
    guestPhone: b.guest_phone || b.user?.phone || "",
    guestType:
      b.user?.role === "donor" ? "kcgf_donor" : "visitor",
    guestTypeLabel: b.user?.role === "donor" ? "Donor" : "Guest",
    roomType: b.room?.room_type?.name ?? "Room",
    roomNumber: b.room?.room_number,
    roomId: b.room?.id,
    checkIn: b.check_in_date,
    checkOut: b.check_out_date,
    nights: b.nights,
    guestCount: b.guest_count ?? 1,
    baseAmountPaise: b.base_amount_paise ?? 0,
    discountAmountPaise: b.discount_amount_paise ?? 0,
    finalAmountPaise: b.final_amount_paise ?? 0,
    baseAmountDisplay: b.base_amount_display,
    discountDisplay: b.discount_display,
    finalAmountDisplay: b.final_amount_display,
    paymentStatus: mapPaymentStatus(b.payment_status),
    bookingStatus: mapBookingStatus(b.status),
    qrCode: b.booking_reference,
    source,
    isInHouse: source === "in_house" || source === "walk_in",
    isVip: b.user?.role === "donor",
    notes: b.notes,
    paymentReference: b.payment_reference ?? undefined,
    paymentGateway: b.payment_gateway ?? undefined,
    paymentPaidAt: b.payment_paid_at ?? undefined,
    // Cancellation
    cancelledAt: b.cancelled_at ?? undefined,
    cancellationReason: b.cancellation_reason,
    cancelInitiatedByRole: b.cancel_initiated_by_role,
    // Refund
    refundAmount: b.refund_amount ?? 0,
    refundReference: b.refund_reference,
    refundProcessedAt: b.refund_processed_at ?? undefined,
    refundReason: b.refund_reason,
    refundRequestedAt: b.refund_requested_at ?? undefined,
    refundRequestedReason: b.refund_requested_reason,
    // Computed
    isCancellableByGuest: b.is_cancellable_by_guest ?? false,
    needsRefundApproval: b.needs_refund_approval ?? false,
    couponCount: b.coupons_applied?.length ?? 0,
    createdAt: b.created_at,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function listBookings(accessToken: string): Promise<ManagerBooking[]> {
  const rows = await fetchAllResults<BackendBooking>("bookings/", accessToken);
  return rows.map(mapManagerBooking);
}

export async function getBooking(accessToken: string, id: string): Promise<ManagerBooking> {
  const b = await apiFetch<BackendBooking>(`bookings/${id}/`, {
    method: "GET",
    accessToken,
  });
  return mapManagerBooking(b);
}

/** Lookup by booking reference. */
export async function getBookingByReference(
  accessToken: string,
  reference: string
): Promise<ManagerBooking | null> {
  const normalized = reference.trim();
  if (!normalized) return null;

  try {
    const rows = await fetchAllResults<BackendBooking>(
      `bookings/?booking_reference=${encodeURIComponent(normalized)}`,
      accessToken
    );
    const match = rows.find((b) => b.booking_reference === normalized) ?? rows[0];
    if (match) return mapManagerBooking(match);
  } catch {
    /* fall through */
  }

  const all = await listBookings(accessToken);
  return all.find((b) => b.reference === normalized) ?? null;
}

export async function extendBookingStay(
  accessToken: string,
  bookingId: string,
  checkOutDate: string,
  notes?: string
): Promise<ManagerBooking> {
  const updated = await apiFetch<BackendBooking>(`bookings/${bookingId}/extend/`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({
      check_out_date: checkOutDate,
      notes: notes ?? "Checkout extended at front desk",
    }),
    idempotencyKey: crypto.randomUUID(),
  });
  return mapManagerBooking(updated);
}

export async function updateBookingStatusApi(
  accessToken: string,
  bookingId: string,
  status: string,
  reason?: string
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`bookings/${bookingId}/status/`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status, reason: reason ?? "" }),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function cancelBookingApi(
  accessToken: string,
  bookingId: string,
  reason: string
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`bookings/${bookingId}/cancel/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ reason }),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function recordCashPaymentApi(
  accessToken: string,
  bookingId: string,
  notes?: string,
  paymentReference?: string
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`bookings/${bookingId}/payment/cash/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      ...(notes ? { notes } : {}),
      ...(paymentReference ? { payment_reference: paymentReference } : {}),
    }),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function refundBookingPaymentApi(
  accessToken: string,
  bookingId: string,
  params: {
    reason: string;
    refundAmountPaise?: number;
    refundReference?: string;
  }
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`staff/bookings/${bookingId}/refund/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      reason: params.reason,
      ...(params.refundAmountPaise !== undefined
        ? { refund_amount_paise: params.refundAmountPaise }
        : {}),
      ...(params.refundReference ? { refund_reference: params.refundReference } : {}),
    }),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function approveRefundRequestApi(
  accessToken: string,
  bookingId: string,
  params: {
    action: "approve" | "reject";
    reason?: string;
    refundAmountPaise?: number;
    refundReference?: string;
  }
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`staff/bookings/${bookingId}/refund-approval/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      action: params.action,
      ...(params.reason ? { reason: params.reason } : {}),
      ...(params.refundAmountPaise !== undefined
        ? { refund_amount_paise: params.refundAmountPaise }
        : {}),
      ...(params.refundReference ? { refund_reference: params.refundReference } : {}),
    }),
    idempotencyKey: crypto.randomUUID(),
  });
}
