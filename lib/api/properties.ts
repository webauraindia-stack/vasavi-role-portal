import { fetchAllResults } from "@/lib/api/paginate";
import type { ManagerBooking, RoomInventory, RoomStatus } from "@/lib/types";
import type { StaffRoomDto } from "@/lib/api/staff-rooms";

export type BackendRoom = StaffRoomDto;

export function resolveRoomDisplayStatus(
  room: Pick<
    RoomInventory,
    "id" | "hotelId" | "number" | "isActive" | "operationalStatus"
  >,
  bookings: ManagerBooking[]
): RoomStatus {
  const occupied = bookings.some((b) => {
    if (b.bookingStatus !== "checked_in") return false;
    if (b.roomId && b.roomId === room.id) return true;
    if (b.hotelId !== room.hotelId) return false;
    return b.roomNumber === room.number;
  });
  if (occupied) return "occupied";
  if (room.isActive === false) return "maintenance";
  if (room.operationalStatus === "blocked") return "blocked";
  if (room.operationalStatus === "maintenance") return "maintenance";
  return "available";
}

export function recomputeRoomDisplayStatuses(
  rooms: RoomInventory[],
  bookings: ManagerBooking[]
): RoomInventory[] {
  return rooms.map((room) => ({
    ...room,
    status: resolveRoomDisplayStatus(room, bookings),
  }));
}

function resolveRoomStatus(room: StaffRoomDto, bookings: ManagerBooking[]): RoomStatus {
  const base: Pick<RoomInventory, "id" | "hotelId" | "number" | "isActive" | "operationalStatus"> =
    {
      id: room.id,
      hotelId: room.branch.id,
      number: room.room_number,
      isActive: room.is_active,
      operationalStatus: room.operational_status,
    };
  return resolveRoomDisplayStatus(base, bookings);
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
