import { apiFetch } from "@/lib/api/client";
import type { SupportTicket } from "@/lib/types";

export type BackendSupportTicket = {
  id: string;
  hotel_id: string | null;
  subject: string;
  description: string;
  guest_name: string;
  category: string;
  booking_reference: string;
  status: SupportTicket["status"];
  priority: SupportTicket["priority"];
  created_by_name?: string;
  created_at: string;
  updated_at: string;
};

function mapTicket(row: BackendSupportTicket): SupportTicket {
  return {
    id: row.id,
    subject: row.subject,
    guestName: row.guest_name || "—",
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    hotelId: row.hotel_id ?? "all",
    category: row.category || undefined,
    description: row.description || undefined,
    bookingReference: row.booking_reference || undefined,
  };
}

export async function listSupportTickets(
  accessToken: string
): Promise<SupportTicket[]> {
  const rows = await apiFetch<BackendSupportTicket[]>("staff/support/tickets/", {
    accessToken,
  });
  return rows.map(mapTicket);
}

export type CreateSupportTicketInput = {
  subject: string;
  description?: string;
  guest_name?: string;
  category?: string;
  booking_reference?: string;
  priority?: SupportTicket["priority"];
  hotel_id?: string | null;
};

export async function createSupportTicket(
  accessToken: string,
  input: CreateSupportTicketInput
): Promise<SupportTicket> {
  const row = await apiFetch<BackendSupportTicket>("staff/support/tickets/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
  return mapTicket(row);
}
