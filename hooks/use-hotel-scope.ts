"use client";

import { useEffect } from "react";
import {
  getHotelLabel,
  getHotelName,
} from "@/lib/hotel-scope";
import { useOptionalDataScope } from "@/contexts/data-scope-context";
import { useAuthUser } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";

/**
 * Property scope for hotel operations pages.
 * Prefer DataScopeProvider (branch / operations layouts); falls back for legacy routes.
 */
export function useHotelScope() {
  const scope = useOptionalDataScope();
  const user = useAuthUser();
  const storedHotelId = useManagerStore((s) => s.hotelId);
  const branches = useManagerStore((s) => s.branches);
  const setHotelId = useManagerStore((s) => s.setHotelId);

  if (scope) {
    return {
      hotelId: scope.hotelId,
      hotelName: scope.hotelName,
      hotelLabel: scope.hotelLabel,
      branches,
      locked: scope.locked,
      viewAll: scope.viewAll,
      setHotelId: scope.setHotelId,
      branchIdForApi: scope.branchIdForApi,
    };
  }

  const viewAll = user?.role === "super_admin";
  const hotelId =
    viewAll ? storedHotelId : user?.hotelId ?? storedHotelId;

  useEffect(() => {
    if (!viewAll && user?.hotelId && storedHotelId !== user.hotelId) {
      setHotelId(user.hotelId);
    }
  }, [viewAll, user?.hotelId, storedHotelId, setHotelId]);

  return {
    hotelId,
    hotelName: user?.hotelName ?? getHotelName(hotelId, branches),
    hotelLabel: getHotelLabel(hotelId, branches),
    branches,
    locked: !viewAll && !!user?.hotelId,
    viewAll,
    setHotelId: viewAll ? setHotelId : undefined,
    branchIdForApi:
      viewAll && hotelId !== "all" ? hotelId : viewAll ? undefined : user?.hotelId,
  };
}
