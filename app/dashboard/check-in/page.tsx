"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Search, CheckCircle } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingDetailCard } from "@/components/dashboard/booking-table";
import { useManagerStore } from "@/stores/manager-store";
import { GUEST_TYPE_COLORS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function CheckInPage() {
  const { bookings, updateBookingStatus } = useManagerStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const match = bookings.find(
    (b) =>
      b.reference.toLowerCase() === query.toLowerCase() ||
      b.qrCode.toLowerCase() === query.toLowerCase() ||
      b.guestPhone.includes(query)
  );

  const handleCheckIn = () => {
    if (match) {
      updateBookingStatus(match.id, "checked_in");
      setSelected(match.id);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Check-in & check-out"
        subtitle="QR verification, guest identity, and donor benefit confirmation"
      />
      <div className="p-6 max-w-2xl space-y-6">
        <div className="card-manager p-5 space-y-4">
          <label className="text-xs font-bold uppercase text-muted">
            Scan or enter booking reference
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="VH-7K2M9P"
                className="pl-9 font-mono"
              />
            </div>
            <Button onClick={handleCheckIn} disabled={!match}>
              Check in
            </Button>
          </div>
          <p className="text-[10px] text-muted">
            Try: VH-3N8Q1R, VH-7K2M9P, or +91 98480 12345
          </p>
        </div>

        {match && (
          <>
            <BookingDetailCard booking={match} />
            <div className="card-manager p-4 flex items-center gap-4">
              <Badge className={GUEST_TYPE_COLORS[match.guestType]}>
                {match.guestTypeLabel}
              </Badge>
              {match.isVip && (
                <span className="text-xs font-bold text-champagne-dark">VIP donor guest</span>
              )}
              {selected === match.id && (
                <span className="flex items-center gap-1 text-sm text-emerald-700 font-bold ml-auto">
                  <CheckCircle className="h-4 w-4" /> Checked in
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
