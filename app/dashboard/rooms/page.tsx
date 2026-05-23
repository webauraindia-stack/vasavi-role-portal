"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import {
  Ban,
  CalendarPlus,
  Check,
  RotateCcw,
  Search,
  Wrench,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROOM_STATUS_COLORS, formatDate } from "@/lib/utils";
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

function activeBookingForRoom(
  room: RoomInventory,
  bookings: ReturnType<typeof getStoreBookings>
) {
  return bookings.find(
    (b) =>
      b.roomNumber === room.number &&
      (b.bookingStatus === "checked_in" || b.bookingStatus === "confirmed")
  );
}

function RoomExtendPanel({
  room,
  bookingCheckOut,
  onExtendHold,
  onExtendStay,
}: {
  room: RoomInventory;
  bookingCheckOut?: string;
  onExtendHold: (until: string) => void;
  onExtendStay: (checkOut: string) => void;
}) {
  const defaultHold = format(addDays(new Date(), 7), "yyyy-MM-dd");
  const defaultStay = bookingCheckOut
    ? format(addDays(new Date(bookingCheckOut), 1), "yyyy-MM-dd")
    : format(addDays(new Date(), 2), "yyyy-MM-dd");

  const [holdUntil, setHoldUntil] = useState(
    room.maintenanceUntil ?? room.blockedUntil ?? defaultHold
  );
  const [stayUntil, setStayUntil] = useState(defaultStay);

  if (room.status === "blocked" || room.status === "maintenance") {
    return (
      <div className="mt-3 rounded-lg border border-beige/50 bg-surface p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
          <CalendarPlus className="h-3 w-3" />
          Extend {room.status === "maintenance" ? "maintenance" : "block"} manually
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={holdUntil}
            onChange={(e) => setHoldUntil(e.target.value)}
            className="h-8 text-xs flex-1 min-w-[140px]"
          />
          <Button size="sm" variant="gold" onClick={() => onExtendHold(holdUntil)}>
            Save date
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {[3, 7, 14].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => {
                const d = format(addDays(new Date(), days), "yyyy-MM-dd");
                setHoldUntil(d);
                onExtendHold(d);
              }}
              className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-beige/60 hover:border-champagne/50"
            >
              +{days} days
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (room.status === "occupied" && bookingCheckOut) {
    return (
      <div className="mt-3 rounded-lg border border-beige/50 bg-surface p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
          <CalendarPlus className="h-3 w-3" />
          Extend guest stay manually
        </p>
        <p className="text-xs text-muted">Current checkout: {formatDate(bookingCheckOut)}</p>
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={stayUntil}
            min={bookingCheckOut}
            onChange={(e) => setStayUntil(e.target.value)}
            className="h-8 text-xs flex-1 min-w-[140px]"
          />
          <Button size="sm" variant="gold" onClick={() => onExtendStay(stayUntil)}>
            Extend stay
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {[1, 2, 3].map((nights) => (
            <button
              key={nights}
              type="button"
              onClick={() => {
                const d = format(addDays(new Date(bookingCheckOut), nights), "yyyy-MM-dd");
                setStayUntil(d);
                onExtendStay(d);
              }}
              className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-beige/60 hover:border-champagne/50"
            >
              +{nights} night{nights > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function RoomsPage() {
  const { hotelId } = useHotelScope();
  const { rooms, bookings, setRoomStatus, extendRoomHold, extendRoomStay } =
    useManagerStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [donorOnly, setDonorOnly] = useState(false);

  const scopedRooms = useMemo(
    () => getStoreRooms(hotelId, rooms),
    [rooms, hotelId]
  );
  const scopedBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [bookings, hotelId]
  );

  const floors = useMemo(
    () => [...new Set(scopedRooms.map((r) => r.floor))].sort((a, b) => a - b),
    [scopedRooms]
  );
  const categories = useMemo(
    () => [...new Set(scopedRooms.map((r) => r.category))].sort(),
    [scopedRooms]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedRooms.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (floorFilter !== "all" && room.floor !== Number(floorFilter)) return false;
      if (categoryFilter !== "all" && room.category !== categoryFilter) return false;
      if (donorOnly && !room.isDonorExclusive) return false;
      if (!q) return true;
      return (
        room.number.includes(q) ||
        room.name.toLowerCase().includes(q) ||
        room.category.toLowerCase().includes(q) ||
        String(room.floor).includes(q)
      );
    });
  }, [scopedRooms, search, statusFilter, floorFilter, categoryFilter, donorOnly]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    floorFilter !== "all" ||
    categoryFilter !== "all" ||
    donorOnly;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setFloorFilter("all");
    setCategoryFilter("all");
    setDonorOnly(false);
  };

  return (
    <>
      <DashboardHeader
        title="Room inventory"
        subtitle="Live availability, blocking, maintenance mode, and donor-exclusive rooms"
      />
      <div className="p-6 space-y-4">
        <div className="card-manager p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room no., name, category, floor…"
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
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
              >
                <option value="all">All floors</option>
                {floors.map((f) => (
                  <option key={f} value={String(f)}>
                    Floor {f}
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
          <p className="text-xs text-muted">
            Showing {filtered.length} of {scopedRooms.length} rooms at this property
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="card-manager p-8 text-center text-sm text-muted">
            No rooms match your search or filters.{" "}
            <button type="button" onClick={clearFilters} className="text-champagne font-bold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((room) => {
              const booking = activeBookingForRoom(room, scopedBookings);
              return (
                <div
                  key={room.id}
                  className={cn(
                    "card-manager p-4",
                    room.status === "maintenance" && "border-rose-200/60",
                    room.status === "blocked" && "border-amber-200/60"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-display text-xl font-bold">Room {room.number}</p>
                      <p className="text-sm text-muted">{room.name}</p>
                      <p className="text-[10px] text-muted">
                        Floor {room.floor} · {room.category} · max {room.maxOccupancy}
                      </p>
                    </div>
                    <Badge className={ROOM_STATUS_COLORS[room.status]}>{room.status}</Badge>
                  </div>

                  {room.isDonorExclusive && (
                    <span className="text-[10px] font-bold text-champagne-dark mt-2 inline-block">
                      Donor exclusive
                    </span>
                  )}

                  {booking && (
                    <p className="text-xs text-charcoal mt-2">
                      Guest: <strong>{booking.guestName}</strong> · out{" "}
                      {formatDate(booking.checkOut)}
                    </p>
                  )}

                  {room.blockedReason && (
                    <p className="text-xs text-amber-800 mt-2">{room.blockedReason}</p>
                  )}
                  {room.blockedUntil && room.status === "blocked" && (
                    <p className="text-xs text-amber-800">Blocked until {formatDate(room.blockedUntil)}</p>
                  )}
                  {room.maintenanceUntil && (
                    <p className="text-xs text-rose-700 mt-1">
                      Maintenance until {formatDate(room.maintenanceUntil)}
                    </p>
                  )}

                  <RoomExtendPanel
                    room={room}
                    bookingCheckOut={booking?.checkOut}
                    onExtendHold={(until) => extendRoomHold(room.id, until)}
                    onExtendStay={(checkOut) => extendRoomStay(room.id, checkOut)}
                  />

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
                        onClick={() =>
                          setRoomStatus(room.id, "blocked", {
                            blockedReason: "Manager hold",
                          })
                        }
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
