"use client";

import { useCallback, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BookingList } from "@/components/dashboard/booking-table";
import { ManualBookingTrigger } from "@/components/dashboard/manual-booking-dialog";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useAuthStore, useAuthUser } from "@/stores/auth-store";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function BookingsPage() {
  const { hotelId, hotelName, viewAll, locked } = useHotelScope();
  const {
    bookings,
    updateBookingStatus,
    recordCashPayment,
    cancelBooking,
    refundBookingPayment,
    extendBookingCheckout,
    refreshFromApi,
  } = useManagerStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthUser();

  useEffect(() => {
    if (accessToken) void refreshFromApi(accessToken, user);
  }, [accessToken, refreshFromApi, user]);

  const scopedBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [bookings, hotelId]
  );

  const requireToken = useCallback((): { ok: false; error: string } | null => {
    if (!accessToken) return { ok: false, error: "Not signed in." };
    return null;
  }, [accessToken]);

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle="Reservations, payments, and guest stays"
        hidePropertyBar={locked}
      />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ManualBookingTrigger
            hotelId={hotelId}
            hotelName={hotelName}
            viewAll={viewAll}
          />
        </div>
        <BookingList
          bookings={scopedBookings}
          onStatusChange={async (id, status, reason) => {
            const denied = requireToken();
            if (denied) return denied;
            return updateBookingStatus(id, status, accessToken!, reason);
          }}
          onRecordCash={async (id) => {
            const denied = requireToken();
            if (denied) return denied;
            return recordCashPayment(id, accessToken!, {
              notes: "Recorded at front desk",
            });
          }}
          onCancel={async (id, reason, refundType, refundAmountPaise, refundReference) => {
            const denied = requireToken();
            if (denied) return denied;

            const cancelRes = await cancelBooking(id, accessToken!, reason);
            if (!cancelRes.ok) return cancelRes;

            if (refundType === "none") return cancelRes;

            return refundBookingPayment(id, accessToken!, {
              reason,
              refundAmountPaise:
                refundType === "partial" ? refundAmountPaise : undefined,
              refundReference,
            });
          }}
          onExtendCheckout={async (id, newCheckOut) => {
            const denied = requireToken();
            if (denied) return denied;
            return extendBookingCheckout(id, accessToken!, newCheckOut);
          }}
        />
      </div>
    </>
  );
}
