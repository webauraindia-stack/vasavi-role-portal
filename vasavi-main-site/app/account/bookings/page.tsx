"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CUSTOMER_BOOKINGS } from "@/lib/data/customer-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BookingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h2 className="font-display text-xl text-charcoal mb-6">My Bookings</h2>
      <p className="text-sm text-muted mb-6">
        Signed in as {session?.user?.email}
      </p>

      <div className="space-y-4">
        {CUSTOMER_BOOKINGS.map((booking) => (
          <Link
            key={booking.id}
            href={`/account/bookings/${booking.id}`}
            className="card-surface rounded-xl p-5 border border-charcoal/10 block hover:border-champagne/40 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-lg text-charcoal group-hover:text-champagne-dark">
                  {booking.hotelName}
                </h3>
                <p className="text-sm text-muted">{booking.roomType}</p>
                {booking.reference && (
                  <p className="text-xs font-mono text-muted mt-0.5">{booking.reference}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    booking.status === "confirmed" || booking.status === "checked_in"
                      ? "default"
                      : booking.status === "completed"
                        ? "secondary"
                        : "outline"
                  }
                  className="capitalize"
                >
                  {booking.status.replace(/_/g, " ")}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {formatCurrency(booking.totalPaid)}
              </span>
            </div>
            {booking.discountApplied > 0 && (
              <p className="text-xs text-champagne mt-2">
                Donor savings: {formatCurrency(booking.discountApplied)}
              </p>
            )}
            {(booking.status === "confirmed" || booking.status === "checked_in") &&
              booking.reference && (
                <p className="text-xs text-champagne-dark mt-2 font-medium">
                  Extend stay available →
                </p>
              )}
          </Link>
        ))}
      </div>
    </div>
  );
}
