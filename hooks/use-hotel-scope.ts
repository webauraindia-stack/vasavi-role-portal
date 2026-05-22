"use client";

import { useEffect } from "react";
import {
  canViewAllHotels,
  getHotelLabel,
  getHotelName,
  resolveHotelId,
} from "@/lib/hotel-scope";
import { useAuthUser } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";

export function useHotelScope() {
  const user = useAuthUser();
  const storedHotelId = useManagerStore((s) => s.hotelId);
  const setHotelId = useManagerStore((s) => s.setHotelId);

  const viewAll = canViewAllHotels(user);
  const hotelId = resolveHotelId(user, storedHotelId);
  const locked = !viewAll && !!user?.hotelId;

  useEffect(() => {
    if (locked && user?.hotelId && storedHotelId !== user.hotelId) {
      setHotelId(user.hotelId);
    }
  }, [locked, user?.hotelId, storedHotelId, setHotelId]);

  return {
    hotelId,
    hotelName: user?.hotelName ?? getHotelName(hotelId),
    hotelLabel: getHotelLabel(hotelId),
    locked,
    viewAll,
    setHotelId: viewAll ? setHotelId : undefined,
  };
}
