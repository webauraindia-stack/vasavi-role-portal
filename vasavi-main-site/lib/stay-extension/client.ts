export type ExtensionStatus =
  | "draft"
  | "pending_approval"
  | "pending_payment"
  | "payment_failed"
  | "approved"
  | "completed"
  | "rejected"
  | "alternative_offered"
  | "cancelled";

export interface ExtensionPricing {
  extraNights: number;
  nightlyRate: number;
  subtotal: number;
  tierDiscount: number;
  taxes: number;
  waivedAmount: number;
  totalDue: number;
  currency: "INR";
}

export interface AlternativeRoomOffer {
  roomId: string;
  roomNumber: string;
  roomName: string;
  category: string;
  priceDifference: number;
  available: boolean;
}

export interface StayExtensionRequest {
  id: string;
  bookingReference: string;
  bookingId: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber?: string;
  roomType: string;
  originalCheckOut: string;
  requestedCheckOut: string;
  status: ExtensionStatus;
  availabilityStatus: "available" | "conflict" | "maintenance" | "unknown";
  conflictReason?: string;
  pricing?: ExtensionPricing;
  alternativeRooms?: AlternativeRoomOffer[];
  selectedAlternativeRoomId?: string;
  paymentMethod?: "upi" | "card" | "netbanking";
  paymentTransactionId?: string;
  approvalSource?: "auto" | "admin" | "super_admin";
  notificationsSent: string[];
}

export interface AvailabilityCheckResult {
  available: boolean;
  status: StayExtensionRequest["availabilityStatus"];
  conflictReason?: string;
  alternatives: AlternativeRoomOffer[];
  pricing: ExtensionPricing | null;
  originalCheckOut: string;
}

const SUPERADMIN_BASE =
  process.env.SUPERADMIN_URL ?? process.env.NEXT_PUBLIC_SUPERADMIN_URL ?? "http://localhost:3001";

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? "Request failed");
  }
  return json as T;
}

export async function checkExtensionAvailability(
  bookingReference: string,
  requestedCheckOut: string
): Promise<AvailabilityCheckResult> {
  const qs = new URLSearchParams({ bookingReference, requestedCheckOut });
  const res = await fetch(`/api/stay-extensions/availability?${qs.toString()}`, {
    cache: "no-store",
  });
  const json = await parseJson<{ data: AvailabilityCheckResult }>(res);
  return json.data;
}

export async function createStayExtension(payload: {
  bookingReference: string;
  requestedCheckOut: string;
  paymentMethod?: "upi" | "card" | "netbanking";
  selectedAlternativeRoomId?: string;
  actorEmail?: string;
}): Promise<StayExtensionRequest> {
  const res = await fetch("/api/stay-extensions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await parseJson<{ data: StayExtensionRequest }>(res);
  return json.data;
}

export async function completeStayExtensionPayment(payload: {
  id: string;
  paymentTransactionId: string;
  actorEmail?: string;
}): Promise<StayExtensionRequest> {
  const res = await fetch("/api/stay-extensions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: payload.id,
      action: "complete_payment",
      actor: payload.actorEmail ?? "guest@vasavi.example",
      actorRole: "guest",
      paymentTransactionId: payload.paymentTransactionId,
    }),
  });
  const json = await parseJson<{ data: StayExtensionRequest }>(res);
  return json.data;
}

export { SUPERADMIN_BASE };
