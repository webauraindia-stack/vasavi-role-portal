import { apiFetch } from "@/lib/api/client";
import type { BackendBooking } from "@/lib/api/bookings";

export type StaffRoomSearchResult = {
  id: string;
  branch: { id: string; name: string; city: string };
  room_number: string;
  room_type: { id: string; name: string };
  capacity: number;
  base_price_per_night: number;
  base_price_display?: string;
  is_donor_exclusive: boolean;
  is_available: boolean;
  unavailable_reason?: string | null;
};

export type StaffManualBookingPayload = {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  guest_name: string;
  guest_phone: string;
  notes?: string;
  source?: "walk_in" | "phone";
  record_cash_payment?: boolean;
  check_in_immediately?: boolean;
};

export async function searchStaffRooms(
  accessToken: string,
  params: {
    check_in: string;
    check_out: string;
    guests?: number;
    branch_id?: string;
    donor_exclusive?: boolean;
  }
): Promise<StaffRoomSearchResult[]> {
  const query = new URLSearchParams({
    check_in: params.check_in,
    check_out: params.check_out,
    guests: String(params.guests ?? 2),
  });
  if (params.branch_id) query.set("branch_id", params.branch_id);
  if (params.donor_exclusive) query.set("donor_exclusive", "true");
  return apiFetch<StaffRoomSearchResult[]>(
    `staff/rooms/search/?${query.toString()}`,
    { accessToken }
  );
}

export async function createStaffManualBooking(
  accessToken: string,
  payload: StaffManualBookingPayload
): Promise<BackendBooking> {
  return apiFetch<BackendBooking>("staff/bookings/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
}
