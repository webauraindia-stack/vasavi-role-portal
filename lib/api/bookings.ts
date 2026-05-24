import { apiFetch } from "@/lib/api/client";
import { fetchAllResults } from "@/lib/api/paginate";
import type { BookingStatus, ManagerBooking, PaymentStatus } from "@/lib/types";

type BackendUser = { id: string; name: string; phone: string; role: string };

export type BackendBooking = {
  id: string;
  booking_reference: string;
  status: string;
  payment_status: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guest_count?: number;
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
  created_at: string;
};

function isInHouseFromNotes(notes?: string): boolean {
  if (!notes) return false;
  return (
    notes.includes("[In-house") ||
    notes.includes("[Walk-in]") ||
    notes.includes("[Phone booking]")
  );
}

function notesSourceFromBackend(notes?: string): ManagerBooking["source"] {
  if (!notes) return "website";
  if (notes.includes("[In-house")) return "in_house";
  if (notes.includes("[Walk-in]")) return "walk_in";
  if (notes.includes("[Phone booking]")) return "phone";
  return "website";
}

function mapBookingStatus(status: string): BookingStatus {
  switch (status) {
    case "checked_in":
      return "checked_in";
    case "checked_out":
      return "checked_out";
    case "cancelled":
      return "cancelled";
    case "confirmed":
      return "confirmed";
    default:
      return "pending";
  }
}

function mapPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "refunded":
    case "partially_refunded":
      return "refunded";
    case "partial":
      return "partial";
    default:
      return "pending";
  }
}

export function mapManagerBooking(b: BackendBooking): ManagerBooking {
  const subtotal = Math.round((b.base_amount_paise ?? 0) / 100);
  const discount = Math.round((b.discount_amount_paise ?? 0) / 100);
  const total = Math.round((b.final_amount_paise ?? 0) / 100);
  const source = notesSourceFromBackend(b.notes);
  return {
    id: b.id,
    reference: b.booking_reference,
    hotelId: b.branch?.id ?? "",
    hotelName: b.branch?.name ?? "Branch",
    guestName: b.guest_name || b.user?.name || "Guest",
    guestEmail: `${b.user?.phone ?? b.guest_phone ?? "guest"}@vasavi.local`,
    guestPhone: b.guest_phone || b.user?.phone || "",
    guestType: b.user?.role === "donor" ? "kcgf_donor" : "visitor",
    guestTypeLabel: b.user?.role === "donor" ? "Donor" : "Guest",
    roomType: b.room?.room_type?.name ?? "Room",
    roomNumber: b.room?.room_number,
    roomId: b.room?.id,
    checkIn: b.check_in_date,
    checkOut: b.check_out_date,
    nights: b.nights,
    guestCount: b.guest_count ?? 1,
    subtotal,
    tierDiscount: 0,
    couponDiscount: discount,
    walletApplied: 0,
    taxes: 0,
    total,
    paymentStatus: mapPaymentStatus(b.payment_status),
    bookingStatus: mapBookingStatus(b.status),
    qrCode: b.booking_reference,
    source,
    isInHouse: isInHouseFromNotes(b.notes) || source === "in_house",
    notes: b.notes,
    paymentReference: b.payment_reference ?? undefined,
    paymentGateway: b.payment_gateway ?? undefined,
    paymentPaidAt: b.payment_paid_at ?? undefined,
    baseAmountDisplay: b.base_amount_display,
    discountDisplay: b.discount_display,
    finalAmountDisplay: b.final_amount_display,
    appliedCoupons: [],
    isVip: b.user?.role === "donor",
    createdAt: b.created_at,
  };
}

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

/** Lookup by booking reference (used by stay-extension API routes). */
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
    const match =
      rows.find((b) => b.booking_reference === normalized) ?? rows[0];
    if (match) return mapManagerBooking(match);
  } catch {
    /* fall through to full list scan */
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

export async function recordCashPaymentApi(
  accessToken: string,
  bookingId: string,
  notes?: string
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`bookings/${bookingId}/payment/cash/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(notes ? { notes } : {}),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function refundBookingPaymentApi(
  accessToken: string,
  bookingId: string,
  reason?: string
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>(`staff/bookings/${bookingId}/refund/`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ reason: reason ?? "Refund at front desk" }),
    idempotencyKey: crypto.randomUUID(),
  });
}
