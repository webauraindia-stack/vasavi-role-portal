import { apiFetch } from "@/lib/api/client";
import { fetchAllResults } from "@/lib/api/paginate";

export type RoomTypeOption = {
  id: string;
  name: string;
  description?: string;
};

export type RoomImageDto = {
  id: string;
  url: string | null;
  caption: string;
  is_primary: boolean;
  sort_order: number;
};

export type StaffRoomDto = {
  id: string;
  branch: { id: string; name: string; city: string };
  room_number: string;
  room_type: { id: string; name: string };
  capacity: number;
  base_price_per_night: number;
  base_price_display?: string;
  is_donor_exclusive: boolean;
  is_active: boolean;
  operational_status: "available" | "blocked" | "maintenance";
  description?: string;
  images: RoomImageDto[];
};

export type CreateStaffRoomPayload = {
  branch_id?: string;
  room_type_id: string;
  room_number: string;
  capacity: number;
  base_price_per_night: number;
  is_donor_exclusive?: boolean;
  is_active?: boolean;
  operational_status?: "available" | "blocked" | "maintenance";
  description?: string;
};

export type UpdateStaffRoomPayload = Partial<CreateStaffRoomPayload>;

export async function listRoomTypes(accessToken: string): Promise<RoomTypeOption[]> {
  return fetchAllResults<RoomTypeOption>("properties/room-types/", accessToken);
}

export async function listStaffRooms(
  accessToken: string,
  branchId?: string
): Promise<StaffRoomDto[]> {
  const path = branchId
    ? `staff/rooms/?branch_id=${branchId}`
    : "staff/rooms/";
  return fetchAllResults<StaffRoomDto>(path, accessToken);
}

export async function createStaffRoom(
  accessToken: string,
  payload: CreateStaffRoomPayload
): Promise<StaffRoomDto> {
  return apiFetch<StaffRoomDto>("staff/rooms/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function updateStaffRoom(
  accessToken: string,
  roomId: string,
  payload: UpdateStaffRoomPayload
): Promise<StaffRoomDto> {
  return apiFetch<StaffRoomDto>(`staff/rooms/${roomId}/`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export async function uploadRoomImage(
  accessToken: string,
  roomId: string,
  file: File,
  options?: { caption?: string; isPrimary?: boolean }
): Promise<RoomImageDto> {
  const form = new FormData();
  form.append("image", file);
  if (options?.caption) form.append("caption", options.caption);
  if (options?.isPrimary) form.append("is_primary", "true");

  return apiFetch<RoomImageDto>(`staff/rooms/${roomId}/images/`, {
    method: "POST",
    accessToken,
    body: form,
  });
}
