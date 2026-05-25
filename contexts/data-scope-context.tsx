"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { PortalUser } from "@/lib/rbac";
import { useManagerStore } from "@/stores/manager-store";

export type DataScopeMode = "branch" | "operations";

type DataScopeValue = {
  mode: DataScopeMode;
  /** Active property filter for UI (branch id or "all"). */
  hotelId: string;
  hotelName: string;
  hotelLabel: string;
  viewAll: boolean;
  locked: boolean;
  setHotelId?: (id: string) => void;
  /** Value sent to booking/room APIs. */
  branchIdForApi: string | undefined;
};

const DataScopeContext = createContext<DataScopeValue | null>(null);

export function DataScopeProvider({
  mode,
  user,
  children,
}: {
  mode: DataScopeMode;
  user: PortalUser;
  children: ReactNode;
}) {
  const storedHotelId = useManagerStore((s) => s.hotelId);
  const branches = useManagerStore((s) => s.branches);
  const setStoredHotelId = useManagerStore((s) => s.setHotelId);

  const branchLockedId = user.hotelId ?? "";

  const hotelId =
    mode === "branch" ? branchLockedId : storedHotelId || "all";

  const branchIdForApi =
    mode === "branch"
      ? branchLockedId || undefined
      : hotelId !== "all"
        ? hotelId
        : undefined;

  const setHotelId = useCallback(
    (id: string) => {
      if (mode === "operations") {
        setStoredHotelId(id);
      }
    },
    [mode, setStoredHotelId]
  );

  const value = useMemo((): DataScopeValue => {
    const hotel = branches.find((h) => h.id === hotelId);
    const hotelName =
      mode === "branch"
        ? user.hotelName ?? hotel?.name ?? "Your property"
        : hotelId === "all"
          ? "All properties"
          : hotel?.name ?? "Property";

    const hotelLabel =
      hotelId === "all"
        ? "All properties"
        : hotel
          ? `${hotel.name} · ${hotel.city}`
          : "Your property";

    return {
      mode,
      hotelId,
      hotelName,
      hotelLabel,
      viewAll: mode === "operations" && hotelId === "all",
      locked: mode === "branch",
      setHotelId: mode === "operations" ? setHotelId : undefined,
      branchIdForApi,
    };
  }, [
    mode,
    hotelId,
    branches,
    user.hotelName,
    setHotelId,
    branchIdForApi,
  ]);

  return (
    <DataScopeContext.Provider value={value}>{children}</DataScopeContext.Provider>
  );
}

export function useDataScope(): DataScopeValue {
  const ctx = useContext(DataScopeContext);
  if (!ctx) {
    throw new Error("useDataScope must be used within DataScopeProvider");
  }
  return ctx;
}

export function useOptionalDataScope(): DataScopeValue | null {
  return useContext(DataScopeContext);
}
