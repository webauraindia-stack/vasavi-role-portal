"use client";

import { useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BookingList } from "@/components/dashboard/booking-table";
import { ManualBookingTrigger } from "@/components/dashboard/manual-booking-dialog";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function BookingsPage() {
  const { hotelId, hotelName, viewAll, locked } = useHotelScope();
  const {
    bookings,
    updateBookingStatus,
    recordCashPayment,
    refundBookingPayment,
    extendBookingCheckout,
    refreshFromApi,
  } = useManagerStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) void refreshFromApi(accessToken);
  }, [accessToken, refreshFromApi]);

  const scopedBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [bookings, hotelId]
  );

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
          onStatusChange={updateBookingStatus}
          onRecordCash={async (id) => {
            const result = await recordCashPayment(id, "Recorded at front desk");
            if (!result.ok && result.error) {
              window.alert(result.error);
            }
          }}
          onRefund={async (id) => {
            if (
              !window.confirm(
                "Mark this booking as refunded? Use this when payment was returned to the guest."
              )
            ) {
              return;
            }
            const result = await refundBookingPayment(id, "Refund at front desk");
            if (!result.ok && result.error) {
              window.alert(result.error);
            }
          }}
          onExtendCheckout={extendBookingCheckout}
        />
      </div>
    </>
  );
}
