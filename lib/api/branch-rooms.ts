import { branchIdForApi } from "@/lib/hotel-scope";
import { listBookings } from "@/lib/api/bookings";
import { listRoomInventory } from "@/lib/api/properties";
import type { PortalUser } from "@/lib/rbac";
import type { ManagerBooking, RoomInventory } from "@/lib/types";

/** Load room inventory for a specific branch (URL context), not the global property selector. */
export async function fetchBranchRoomInventory(
  accessToken: string,
  branchId: string,
  authUser?: PortalUser | null,
  storedHotelId = "all"
): Promise<{ rooms: RoomInventory[]; bookings: ManagerBooking[] }> {
  const bookingScope =
    authUser?.role === "admin" && authUser.hotelId
      ? authUser.hotelId
      : branchIdForApi(authUser, storedHotelId) ?? branchId;

  const bookings = await listBookings(accessToken, bookingScope);
  const scopedBookings =
    bookingScope === branchId
      ? bookings
      : bookings.filter((b) => b.hotelId === branchId);

  const rooms = await listRoomInventory(accessToken, scopedBookings, branchId);

  return { bookings: scopedBookings, rooms };
}
