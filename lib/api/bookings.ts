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
  base_amount_paise: number;
  discount_amount_paise: number;
  final_amount_paise: number;
  guest_name?: string;
  guest_phone?: string;
  user?: BackendUser;
  branch?: { id: string; name: string; city: string };
  room?: { room_number: string; room_type?: { name: string } };
  created_at: string;
};

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
    checkIn: b.check_in_date,
    checkOut: b.check_out_date,
    nights: b.nights,
    subtotal,
    tierDiscount: 0,
    couponDiscount: discount,
    walletApplied: 0,
    taxes: 0,
    total,
    paymentStatus: mapPaymentStatus(b.payment_status),
    bookingStatus: mapBookingStatus(b.status),
    qrCode: b.booking_reference,
    source: "website",
    appliedCoupons: [],
    isVip: b.user?.role === "donor",
    createdAt: b.created_at,
  };
}

export async function listBookings(accessToken: string): Promise<ManagerBooking[]> {
  const rows = await fetchAllResults<BackendBooking>("bookings/", accessToken);
  return rows.map(mapManagerBooking);
}

export async function getBookingByReference(
  accessToken: string,
  reference: string
): Promise<ManagerBooking | null> {
  const bookings = await listBookings(accessToken);
  return bookings.find((b) => b.reference === reference) ?? null;
}

export type CreateBookingPayload = {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  guest_name?: string;
  guest_phone?: string;
  notes?: string;
};

export async function createBooking(
  accessToken: string,
  payload: CreateBookingPayload
): Promise<ManagerBooking> {
  const created = await apiFetch<BackendBooking>("bookings/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
  return mapManagerBooking(created);
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
      notes: notes ?? "",
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
) {
  return apiFetch(`bookings/${bookingId}/status/`, {
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
