import { fetchAllResults } from "@/lib/api/paginate";
import type { ManagerBooking, RoomInventory, RoomStatus } from "@/lib/types";
import type { StaffRoomDto } from "@/lib/api/staff-rooms";

export type BackendRoom = StaffRoomDto;

function resolveRoomStatus(room: StaffRoomDto, bookings: ManagerBooking[]): RoomStatus {
  const occupied = bookings.some((b) => {
    if (b.hotelId !== room.branch.id) return false;
    if (b.roomNumber !== room.room_number) return false;
    return b.bookingStatus === "checked_in";
  });
  if (occupied) return "occupied";
  if (!room.is_active) return "maintenance";
  if (room.operational_status === "blocked") return "blocked";
  if (room.operational_status === "maintenance") return "maintenance";
  return "available";
}

export function mapRoomToInventory(
  room: StaffRoomDto,
  bookings: ManagerBooking[]
): RoomInventory {
  const primary = room.images?.find((img) => img.is_primary) ?? room.images?.[0];
  return {
    id: room.id,
    hotelId: room.branch.id,
    number: room.room_number,
    name: `${room.room_type.name} · ${room.room_number}`,
    category: room.room_type.name,
    floor: 1,
    maxOccupancy: room.capacity,
    status: resolveRoomStatus(room, bookings),
    isDonorExclusive: room.is_donor_exclusive,
    imageUrl: primary?.url ?? undefined,
    basePricePerNight: Math.round(room.base_price_per_night / 100),
    description: room.description,
    isActive: room.is_active,
    operationalStatus: room.operational_status,
  };
}

export async function listRooms(
  accessToken: string,
  branchId?: string
): Promise<StaffRoomDto[]> {
  const path = branchId
    ? `staff/rooms/?branch_id=${branchId}`
    : "staff/rooms/";
  return fetchAllResults<StaffRoomDto>(path, accessToken);
}

export async function listRoomInventory(
  accessToken: string,
  bookings: ManagerBooking[],
  branchId?: string
): Promise<RoomInventory[]> {
  const rooms = await listRooms(accessToken, branchId);
  return rooms.map((r) => mapRoomToInventory(r, bookings));
}
