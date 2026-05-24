"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban, Check, RotateCcw, Search, Wrench } from "lucide-react";
import { AddRoomTrigger } from "@/components/admin/add-room-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROOM_STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { RoomInventory, RoomStatus } from "@/lib/types";
import {
  useManagerStore,
  getStoreBookings,
  getStoreRooms,
} from "@/stores/manager-store";
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
  const { rooms, bookings, setRoomStatus, refreshFromApi } = useManagerStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [donorOnly, setDonorOnly] = useState(false);

  const loadData = useCallback(() => {
    if (accessToken) void refreshFromApi(accessToken);
  }, [accessToken, refreshFromApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scopedRooms = useMemo(
    () => getStoreRooms(branchId, rooms),
    [rooms, branchId]
  );
  const scopedBookings = useMemo(
    () => getStoreBookings(branchId, bookings),
    [bookings, branchId]
  );

  const categories = useMemo(
    () => [...new Set(scopedRooms.map((r) => r.category))].sort(),
    [scopedRooms]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedRooms.filter((room) => {
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
  }, [scopedRooms, search, statusFilter, categoryFilter, donorOnly]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <AddRoomTrigger branchId={branchId} />
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
            Showing {filtered.length} of {scopedRooms.length} rooms
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card-manager p-8 text-center text-sm text-muted">
          {scopedRooms.length === 0
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
                b.roomNumber === room.number &&
                (b.bookingStatus === "checked_in" || b.bookingStatus === "confirmed")
            );
            return (
              <div
                key={room.id}
                className={cn(
                  "card-manager overflow-hidden",
                  room.status === "maintenance" && "border-rose-200/60",
                  room.status === "blocked" && "border-amber-200/60"
                )}
              >
                {room.imageUrl ? (
                  <div className="relative h-36 w-full bg-surface">
                    <Image
                      src={room.imageUrl}
                      alt={`Room ${room.number}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-surface flex items-center justify-center text-xs text-muted">
                    No photo
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-display text-xl font-bold">Room {room.number}</p>
                      <p className="text-sm text-muted">{room.category}</p>
                      <p className="text-[10px] text-muted mt-0.5">
                        Max {room.maxOccupancy} guests
                        {room.basePricePerNight != null &&
                          ` · ${formatCurrency(room.basePricePerNight)}/night`}
                      </p>
                    </div>
                    <Badge className={ROOM_STATUS_COLORS[room.status]}>{room.status}</Badge>
                  </div>

                  {room.isDonorExclusive && (
                    <span className="text-[10px] font-bold text-champagne-dark mt-2 inline-block">
                      Donor exclusive
                    </span>
                  )}

                  {room.description && (
                    <p className="text-xs text-muted mt-2 line-clamp-2">{room.description}</p>
                  )}

                  {booking && (
                    <p className="text-xs text-charcoal mt-2">
                      Guest: <strong>{booking.guestName}</strong>
                    </p>
                  )}

                  {room.status !== "occupied" && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {room.status !== "available" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRoomStatus(room.id, "available")}
                        >
                          <Check className="h-3 w-3" /> Available
                        </Button>
                      )}
                      {room.status !== "blocked" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRoomStatus(room.id, "blocked")}
                        >
                          <Ban className="h-3 w-3" /> Block
                        </Button>
                      )}
                      {room.status !== "maintenance" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRoomStatus(room.id, "maintenance")}
                        >
                          <Wrench className="h-3 w-3" /> Maintenance
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
