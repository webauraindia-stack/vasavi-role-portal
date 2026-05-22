"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  MapPin,
  Phone,
  Receipt,
} from "lucide-react";
import { StayExtensionDialog } from "@/components/booking/stay-extension-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  canExtendCustomerBooking,
  CUSTOMER_BOOKINGS,
  getCustomerBooking,
} from "@/lib/data/customer-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);

  const booking = useMemo(() => {
    const base = getCustomerBooking(id);
    if (!base) return undefined;
    if (checkOut) return { ...base, checkOut };
    return base;
  }, [id, checkOut]);

  if (!booking) {
    return (
      <div>
        <Link
          href="/account/bookings"
          className="text-sm text-champagne hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>
        <p className="text-muted">Booking not found.</p>
      </div>
    );
  }

  const extendable = canExtendCustomerBooking(booking);

  return (
    <div>
      <Link
        href="/account/bookings"
        className="text-sm text-champagne hover:underline inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      <div className="card-surface rounded-xl p-6 border border-charcoal/10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-charcoal">{booking.hotelName}</h2>
            <p className="text-sm text-muted mt-1">{booking.roomType}</p>
            {booking.reference && (
              <p className="text-xs font-mono text-muted mt-1">Ref: {booking.reference}</p>
            )}
          </div>
          <Badge className="capitalize">{booking.status.replace(/_/g, " ")}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <Detail icon={Calendar} label="Check-in" value={formatDate(booking.checkIn)} />
          <Detail icon={Calendar} label="Check-out" value={formatDate(booking.checkOut)} />
          {booking.roomNumber && (
            <Detail icon={MapPin} label="Room" value={booking.roomNumber} />
          )}
          <Detail icon={Receipt} label="Total paid" value={formatCurrency(booking.totalPaid)} />
          {booking.guestPhone && (
            <Detail icon={Phone} label="Contact" value={booking.guestPhone} />
          )}
        </div>

        {booking.discountApplied > 0 && (
          <p className="text-sm text-champagne">
            Donor savings applied: {formatCurrency(booking.discountApplied)}
          </p>
        )}

        {extendable && booking.reference && (
          <div className="border-t border-charcoal/10 pt-5">
            <h3 className="font-display text-lg text-charcoal mb-2">Extend your stay</h3>
            <p className="text-sm text-muted mb-4">
              Need more time? Select a new checkout date — we&apos;ll verify room availability in
              real time and show any additional charges before you pay.
            </p>
            <Button onClick={() => setExtendOpen(true)} className="gap-2">
              <CalendarPlus className="h-4 w-4" />
              Extend stay
            </Button>
          </div>
        )}

        {!extendable && (
          <p className="text-sm text-muted border-t border-charcoal/10 pt-4">
            This booking is not eligible for online extension. Contact the front desk for assistance.
          </p>
        )}
      </div>

      <StayExtensionDialog
        booking={booking}
        open={extendOpen}
        onOpenChange={setExtendOpen}
        onCompleted={(newCheckOut) => setCheckOut(newCheckOut)}
      />

      <p className="text-xs text-muted mt-4">
        Signed in as {session?.user?.email}
      </p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
        <p className="font-medium text-charcoal">{value}</p>
      </div>
    </div>
  );
}
