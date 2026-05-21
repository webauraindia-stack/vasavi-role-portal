"use client";

import { useMemo } from "react";
import { Wrench, Ban, Check } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS_COLORS } from "@/lib/utils";
import { useManagerStore } from "@/stores/manager-store";
import { cn } from "@/lib/utils";

export default function RoomsPage() {
  const { rooms, hotelId, setRoomStatus } = useManagerStore();

  const filtered = useMemo(
    () => (hotelId === "all" ? rooms : rooms.filter((r) => r.hotelId === hotelId)),
    [rooms, hotelId]
  );

  return (
    <>
      <DashboardHeader
        title="Room inventory"
        subtitle="Live availability, blocking, maintenance mode, and donor-exclusive rooms"
      />
      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
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
                  <p className="text-[10px] text-muted">Floor {room.floor}</p>
                </div>
                <Badge className={ROOM_STATUS_COLORS[room.status]}>{room.status}</Badge>
              </div>
              {room.isDonorExclusive && (
                <span className="text-[10px] font-bold text-champagne-dark mt-2 inline-block">
                  Donor exclusive
                </span>
              )}
              {room.blockedReason && (
                <p className="text-xs text-amber-800 mt-2">{room.blockedReason}</p>
              )}
              {room.maintenanceUntil && (
                <p className="text-xs text-rose-700 mt-2">Until {room.maintenanceUntil}</p>
              )}
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
                    onClick={() =>
                      setRoomStatus(room.id, "maintenance", {
                        maintenanceUntil: "2026-05-27",
                      })
                    }
                  >
                    <Wrench className="h-3 w-3" /> Maintenance
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
