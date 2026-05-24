import type { ManagerHotel } from "@/lib/types";
import type { PortalUser } from "@/lib/rbac";

export function canViewAllHotels(user: PortalUser | null | undefined): boolean {
  return user?.role === "super_admin";
}

export function isHotelScopedAdmin(user: PortalUser | null | undefined): boolean {
  return !!user?.hotelId && user.role === "admin";
}

export function resolveHotelId(
  user: PortalUser | null | undefined,
  storedHotelId: string
): string {
  if (canViewAllHotels(user)) return storedHotelId;
  return user?.hotelId ?? storedHotelId;
}

export function getHotelLabel(hotelId: string, branches: ManagerHotel[]): string {
  if (hotelId === "all") return "All properties";
  const hotel = branches.find((h) => h.id === hotelId);
  return hotel ? `${hotel.name} · ${hotel.city}` : "Your property";
}

export function getHotelName(hotelId: string, branches: ManagerHotel[]): string {
  return branches.find((h) => h.id === hotelId)?.name ?? "Your property";
}
