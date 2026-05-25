"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban, Check, Loader2, RotateCcw, Search, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { AddRoomTrigger } from "@/components/admin/add-room-dialog";
import { useAuthStore, useAuthUser } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBranchRoomInventory } from "@/lib/api/branch-rooms";
import { ROOM_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { ManagerBooking, RoomInventory, RoomStatus } from "@/lib/types";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: RoomStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "blocked", label: "Blocked" },
  { value: "maintenance", label: "Maintenance" },
];

export function BranchRoomsPanel({
  branchId,
  minimal = false,
}: {
  branchId: string;
  branchName?: string;
  minimal?: boolean;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthUser();
  const storedHotelId = useManagerStore((s) => s.hotelId);
  const updateRoomOperationalStatus = useManagerStore((s) => s.updateRoomOperationalStatus);
  const toast = useToast();

  const [rooms, setRooms] = useState<RoomInventory[]>([]);
  const [bookings, setBookings] = useState<ManagerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [donorOnly, setDonorOnly] = useState(false);

  const loadData = useCallback(async () => {
    if (!accessToken || !branchId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchBranchRoomInventory(
        accessToken,
        branchId,
        user,
        storedHotelId
      );
      setRooms(data.rooms);
      setBookings(data.bookings);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load rooms for this property."
      );
      setRooms([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId, user, storedHotelId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const scopedBookings = useMemo(
    () => getStoreBookings(branchId, bookings),
    [bookings, branchId]
  );

  const categories = useMemo(
    () => [...new Set(rooms.map((r) => r.category))].sort(),
    [rooms]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (categoryFilter !== "all" && room.category !== categoryFilter) return false;
      if (donorOnly && !room.isDonorExclusive) return false;
      if (!q) return true;
      return (
        room.number.includes(q) ||
        room.name.toLowerCase().includes(q) ||
        room.category.toLowerCase().includes(q)
      );
    });
  }, [rooms, search, statusFilter, categoryFilter, donorOnly]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    donorOnly;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setDonorOnly(false);
  };

  const handleOperationalStatus = async (
    roomId: string,
    operationalStatus: "available" | "blocked" | "maintenance"
  ) => {
    if (!accessToken) {
      toast.error("Sign in required to update room status.");
      return;
    }
    setStatusBusyId(roomId);
    const res = await updateRoomOperationalStatus(roomId, operationalStatus, accessToken);
    setStatusBusyId(null);
    if (res.ok) {
      const label =
        operationalStatus === "available"
          ? "available"
          : operationalStatus === "blocked"
            ? "blocked"
            : "under maintenance";
      toast.success(`Room marked ${label}.`);
      await loadData();
    } else {
      toast.error(res.error ?? "Could not update room status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading rooms from server…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
          <button
            type="button"
            onClick={() => void loadData()}
            className="ml-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <AddRoomTrigger branchId={branchId} onRoomCreated={loadData} />
      </div>

      <div className="card-manager p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room no., category…"
              className="pl-9 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RoomStatus | "all")}
              className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDonorOnly((v) => !v)}
              className={cn(
                "h-9 rounded-lg border px-3 text-xs font-bold transition-colors",
                donorOnly
                  ? "border-champagne bg-champagne/10 text-champagne-dark"
                  : "border-beige/60 bg-white text-charcoal"
              )}
            >
              Donor rooms only
            </button>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={clearFilters} className="gap-1">
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>
        {!minimal && (
          <p className="text-xs text-muted">
            Showing {filtered.length} of {rooms.length} rooms
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card-manager p-8 text-center text-sm text-muted">
          {rooms.length === 0
            ? "No rooms yet. Use Add room to create your first room."
            : "No rooms match your filters."}{" "}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-champagne font-bold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => {
            const booking = scopedBookings.find(
              (b) =>
                (b.bookingStatus === "checked_in" || b.bookingStatus === "confirmed") &&
                (b.roomId === room.id || b.roomNumber === room.number)
            );

            return (
              <article
                key={room.id}
                className="card-manager overflow-hidden flex flex-col"
              >
                {room.imageUrl ? (
                  <div className="relative h-32 bg-surface">
                    <Image
                      src={room.imageUrl}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-champagne/5 flex items-center justify-center text-xs text-muted">
                    No photo
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-charcoal">Room {room.number}</p>
                      <p className="text-xs text-muted">{room.category}</p>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] shrink-0",
                        ROOM_STATUS_COLORS[room.status]
                      )}
                    >
                      {room.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    Sleeps {room.maxOccupancy} ·{" "}
                    {formatCurrency(room.basePricePerNight ?? 0)}/night
                    {room.isDonorExclusive && (
                      <span className="ml-1 text-champagne-dark font-semibold">
                        · Donor
                      </span>
                    )}
                  </p>
                  {booking && (
                    <p className="text-[10px] text-blue-800 bg-blue-50 rounded px-2 py-1">
                      Guest: {booking.guestName}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-1 pt-2">
                    {room.operationalStatus !== "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 gap-1"
                        disabled={statusBusyId === room.id}
                        onClick={() => handleOperationalStatus(room.id, "available")}
                      >
                        <Check className="h-3 w-3" />
                        Available
                      </Button>
                    )}
                    {room.operationalStatus !== "blocked" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 gap-1"
                        disabled={statusBusyId === room.id}
                        onClick={() => handleOperationalStatus(room.id, "blocked")}
                      >
                        <Ban className="h-3 w-3" />
                        Block
                      </Button>
                    )}
                    {room.operationalStatus !== "maintenance" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 gap-1"
                        disabled={statusBusyId === room.id}
                        onClick={() => handleOperationalStatus(room.id, "maintenance")}
                      >
                        <Wrench className="h-3 w-3" />
                        Maintenance
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
