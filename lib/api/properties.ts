import { fetchAllResults } from "@/lib/api/paginate";
import type { ManagerBooking, RoomInventory, RoomStatus } from "@/lib/types";

export type BackendRoom = {
  id: string;
  branch: { id: string; name: string; city: string };
  room_number: string;
  room_type: { id: string; name: string };
  capacity: number;
  base_price_per_night: number;
  is_donor_exclusive: boolean;
  is_active: boolean;
};

function roomOccupiedToday(
  room: BackendRoom,
  bookings: ManagerBooking[],
  today: string
): boolean {
  return bookings.some((b) => {
    if (b.hotelId !== room.branch.id) return false;
    if (b.roomNumber !== room.room_number) return false;
    if (b.bookingStatus === "cancelled" || b.bookingStatus === "checked_out") {
      return false;
    }
    return b.checkIn <= today && b.checkOut > today;
  });
}

export function mapRoomToInventory(
  room: BackendRoom,
  bookings: ManagerBooking[]
): RoomInventory {
  const today = new Date().toISOString().slice(0, 10);
  const status: RoomStatus = roomOccupiedToday(room, bookings, today)
    ? "occupied"
    : "available";

  return {
    id: room.id,
    hotelId: room.branch.id,
    number: room.room_number,
    name: `${room.room_type.name} · ${room.room_number}`,
    category: room.room_type.name,
    floor: 1,
    maxOccupancy: room.capacity,
    status,
    isDonorExclusive: room.is_donor_exclusive,
  };
}

export async function listRooms(
  accessToken: string,
  branchId?: string
): Promise<BackendRoom[]> {
  const path = branchId
    ? `properties/rooms/?branch_id=${branchId}`
    : "properties/rooms/";
  return fetchAllResults<BackendRoom>(path, accessToken);
}

export async function listRoomInventory(
  accessToken: string,
  bookings: ManagerBooking[],
  branchId?: string
): Promise<RoomInventory[]> {
  const rooms = await listRooms(accessToken, branchId);
  return rooms
    .filter((r) => r.is_active !== false)
    .map((r) => mapRoomToInventory(r, bookings));
}
