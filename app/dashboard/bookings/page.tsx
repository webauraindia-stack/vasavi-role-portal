"use client";

import { useCallback, useEffect, useMemo } from "react";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BookingList } from "@/components/dashboard/booking-table";
import { ManualBookingTrigger } from "@/components/dashboard/manual-booking-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useExtensionStore } from "@/stores/extension-store";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function BookingsPage() {
  const { hotelId, hotelName, viewAll } = useHotelScope();
  const { bookings, updateBookingStatus, recordCashPayment, refreshFromApi } =
    useManagerStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { requests, fetchRequests } = useExtensionStore();

  const loadExtensions = useCallback(() => {
    void fetchRequests(hotelId);
  }, [fetchRequests, hotelId]);

  useEffect(() => {
    loadExtensions();
  }, [loadExtensions]);

  useEffect(() => {
    if (accessToken) void refreshFromApi(accessToken);
  }, [accessToken, refreshFromApi]);

  const scopedBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [bookings, hotelId]
  );

  const scopedExtensions = useMemo(() => {
    if (hotelId === "all") return requests;
    return requests.filter((r) => r.hotelId === hotelId);
  }, [requests, hotelId]);

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle="Manage reservations, check-ins, and stay extensions from one place"
      />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ManualBookingTrigger
            hotelId={hotelId}
            hotelName={hotelName}
            viewAll={viewAll}
          />
          <Link
            href="/dashboard/extensions"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Extension queue
          </Link>
        </div>
        <BookingList
          bookings={scopedBookings}
          extensions={scopedExtensions}
          onStatusChange={updateBookingStatus}
          onRecordCash={async (id) => {
            const result = await recordCashPayment(id, "Recorded at front desk");
            if (!result.ok && result.error) {
              window.alert(result.error);
            }
          }}
        />
      </div>
    </>
  );
}
