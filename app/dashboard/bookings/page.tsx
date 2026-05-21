"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BookingTable } from "@/components/dashboard/booking-table";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";

export default function BookingsPage() {
  const { bookings, hotelId, updateBookingStatus } = useManagerStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = getStoreBookings(hotelId, bookings);
    if (statusFilter !== "all") {
      list = list.filter((b) => b.bookingStatus === statusFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((b) => b.guestType === typeFilter);
    }
    return list;
  }, [bookings, hotelId, statusFilter, typeFilter]);

  return (
    <>
      <DashboardHeader
        title="Bookings"
        subtitle="Every website reservation with member ID, donor benefits, coupons, and payment status"
      />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked in</option>
            <option value="checked_out">Checked out</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All guest types</option>
            <option value="visitor">Visitor</option>
            <option value="vci_member">VCI Member</option>
            <option value="kcgf_donor">KCGF Donor</option>
            <option value="free_stay_eligible">Free stay</option>
            <option value="compensation_holder">Compensation</option>
            <option value="sponsorship_patron">Patron</option>
          </select>
        </div>
        <div className="card-manager p-2">
          <BookingTable bookings={filtered} onStatusChange={updateBookingStatus} />
        </div>
      </div>
    </>
  );
}
