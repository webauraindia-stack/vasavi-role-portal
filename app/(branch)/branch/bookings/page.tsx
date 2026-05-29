"use client";

import { useCallback } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BookingList } from "@/components/dashboard/booking-table";
import { BookingListToolbar } from "@/components/booking/booking-list-toolbar";
import { ManualBookingTrigger } from "@/components/dashboard/manual-booking-dialog";
import { useBookingsList } from "@/hooks/use-bookings-list";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";
import { PageContent } from "@/components/layout/page-content";

export default function BookingsPage() {
  const { hotelId, hotelName, viewAll, locked } = useHotelScope();
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    bookings,
    summary,
    loading,
    error,
    filters,
    setFilters,
    reload,
    exportCsv,
  } = useBookingsList(hotelId === "all" ? undefined : hotelId);

  const {
    updateBookingStatus,
    recordCashPayment,
    cancelBooking,
    refundBookingPayment,
    extendBookingCheckout,
  } = useManagerStore();

  const requireToken = useCallback((): { ok: false; error: string } | null => {
    if (!accessToken) return { ok: false, error: "Not signed in." };
    return null;
  }, [accessToken]);

  const afterMutation = useCallback(async () => {
    reload();
  }, [reload]);

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle="Reservations, payments, and guest stays"
        hidePropertyBar={locked}
        actions={
          <ManualBookingTrigger
            hotelId={hotelId}
            hotelName={hotelName}
            viewAll={viewAll}
            onCreated={reload}
          />
        }
      />
      <PageContent tight>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <BookingListToolbar
          filters={filters}
          onApply={setFilters}
          onExport={() => void exportCsv()}
          loading={loading}
        />
        <BookingList
          bookings={bookings}
          summary={summary}
          loading={loading}
          onStatusChange={async (id, status, reason) => {
            const denied = requireToken();
            if (denied) return denied;
            const res = await updateBookingStatus(id, status, accessToken!, reason);
            if (res.ok) await afterMutation();
            return res;
          }}
          onRecordCash={async (id) => {
            const denied = requireToken();
            if (denied) return denied;
            const res = await recordCashPayment(id, accessToken!, {
              notes: "Recorded at front desk",
            });
            if (res.ok) await afterMutation();
            return res;
          }}
          onCancel={async (id, reason, refundType, refundAmountPaise, refundReference) => {
            const denied = requireToken();
            if (denied) return denied;

            const cancelRes = await cancelBooking(id, accessToken!, reason);
            if (!cancelRes.ok) return cancelRes;

            if (refundType === "none") {
              await afterMutation();
              return cancelRes;
            }

            const refundRes = await refundBookingPayment(id, accessToken!, {
              reason,
              refundAmountPaise:
                refundType === "partial" ? refundAmountPaise : undefined,
              refundReference,
            });
            if (refundRes.ok) await afterMutation();
            return refundRes;
          }}
          onExtendCheckout={async (id, newCheckOut) => {
            const denied = requireToken();
            if (denied) return denied;
            const res = await extendBookingCheckout(id, accessToken!, newCheckOut);
            if (res.ok) await afterMutation();
            return res;
          }}
        />
      </PageContent>
    </>
  );
}
