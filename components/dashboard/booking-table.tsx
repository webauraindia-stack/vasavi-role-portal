"use client";

import { QRCodeSVG } from "qrcode.react";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BOOKING_STATUS_COLORS,
  GUEST_TYPE_COLORS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";
import type { ManagerBooking } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingTable({
  bookings,
  onStatusChange,
  compact,
}: {
  bookings: ManagerBooking[];
  onStatusChange?: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  compact?: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <p className="text-center py-12 text-muted text-sm">No bookings match your filters.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-beige/50 text-left text-[10px] font-bold uppercase tracking-wider text-muted">
            <th className="py-3 px-3">Guest</th>
            <th className="py-3 px-3">Type</th>
            <th className="py-3 px-3">Stay</th>
            <th className="py-3 px-3">Room</th>
            <th className="py-3 px-3">Benefits</th>
            <th className="py-3 px-3">Total</th>
            <th className="py-3 px-3">Status</th>
            {!compact && <th className="py-3 px-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-beige/30 hover:bg-surface/50 transition-colors"
            >
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  {b.isVip && <Crown className="h-3.5 w-3.5 text-champagne-dark shrink-0" />}
                  <div>
                    <p className="font-bold text-charcoal">{b.guestName}</p>
                    <p className="text-[10px] text-muted font-mono">{b.reference}</p>
                    {b.memberId && (
                      <p className="text-[10px] text-champagne font-semibold">{b.memberId}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-3">
                <Badge className={GUEST_TYPE_COLORS[b.guestType]}>{b.guestTypeLabel}</Badge>
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <p>
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                </p>
                <p className="text-[10px] text-muted">{b.nights} night(s)</p>
              </td>
              <td className="py-3 px-3">
                <p className="font-medium">{b.roomType}</p>
                {b.roomNumber && (
                  <p className="text-[10px] text-muted">Room {b.roomNumber}</p>
                )}
              </td>
              <td className="py-3 px-3">
                {b.appliedCoupons.length > 0 ? (
                  <div className="space-y-0.5">
                    {b.appliedCoupons.map((c) => (
                      <p key={c.code} className="text-[10px] text-emerald-700 font-semibold">
                        −{formatCurrency(c.amountDeducted)} · {c.code}
                      </p>
                    ))}
                    {b.tierDiscount > 0 && (
                      <p className="text-[10px] text-amber-700">
                        Tier −{formatCurrency(b.tierDiscount)}
                      </p>
                    )}
                  </div>
                ) : b.tierDiscount > 0 ? (
                  <p className="text-[10px] text-amber-700">
                    Tier −{formatCurrency(b.tierDiscount)}
                  </p>
                ) : (
                  <span className="text-[10px] text-muted">—</span>
                )}
              </td>
              <td className="py-3 px-3">
                <p className="font-bold font-mono">{formatCurrency(b.total)}</p>
                <Badge className={cn("mt-0.5", PAYMENT_STATUS_COLORS[b.paymentStatus])}>
                  {b.paymentStatus.replace("_", " ")}
                </Badge>
              </td>
              <td className="py-3 px-3">
                <Badge className={BOOKING_STATUS_COLORS[b.bookingStatus]}>
                  {b.bookingStatus.replace("_", " ")}
                </Badge>
                <p className="text-[9px] text-muted mt-1">{formatDateTime(b.createdAt)}</p>
              </td>
              {!compact && (
                <td className="py-3 px-3">
                  {onStatusChange && (
                    <select
                      value={b.bookingStatus}
                      onChange={(e) =>
                        onStatusChange(b.id, e.target.value as ManagerBooking["bookingStatus"])
                      }
                      className="text-xs border border-beige rounded-lg px-2 py-1 bg-white"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="checked_in">checked in</option>
                      <option value="checked_out">checked out</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BookingDetailCard({ booking }: { booking: ManagerBooking }) {
  return (
    <div className="card-manager p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display text-lg">{booking.guestName}</h3>
          <p className="text-xs text-muted font-mono">{booking.reference}</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-beige">
          <QRCodeSVG value={booking.qrCode} size={72} />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <dt className="text-muted">Member ID</dt>
        <dd className="font-mono font-bold">{booking.memberId ?? "—"}</dd>
        <dt className="text-muted">Source</dt>
        <dd>{booking.source}</dd>
        <dt className="text-muted">Special requests</dt>
        <dd>{booking.specialRequests ?? "—"}</dd>
      </dl>
      {booking.appliedCoupons.length > 0 && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200/60 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-800 mb-2">
            Benefit deduction log
          </p>
          {booking.appliedCoupons.map((c) => (
            <p key={c.code} className="text-xs text-emerald-900">
              {c.name}: −{formatCurrency(c.amountDeducted)} ({c.redeemedAt})
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
