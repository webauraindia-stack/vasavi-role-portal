"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Lock, ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStoreBookings, getStoreDonors } from "@/stores/manager-store";
import { useManagerStore } from "@/stores/manager-store";

export default function DonorsPage() {
  const hotelId = useManagerStore((s) => s.hotelId);
  const bookings = useManagerStore((s) => s.bookings);
  const donors = getStoreDonors(hotelId, bookings);
  const hotelBookings = getStoreBookings(hotelId, bookings);

  return (
    <>
      <DashboardHeader
        title="Donor verification"
        subtitle="View-only — donor profiles and benefits for bookings at your hotel"
      />

      <div className="px-6 pb-4">
        <div className="card-manager flex items-start gap-3 border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
          <Lock className="h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold">Super Admin controls all donor records</p>
            <p className="mt-1 text-amber-900/90">
              You cannot create, edit, delete, or modify donor balances, coupons, or
              platform policies. Use this view to verify eligibility during check-in.
            </p>
            <Link
              href="/admin/donors"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-champagne hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full donor management
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 grid gap-4 lg:grid-cols-2">
        {donors.length === 0 ? (
          <p className="text-sm text-muted col-span-2">
            No donor-linked bookings at this property yet.
          </p>
        ) : (
          donors.map((d) => (
            <div key={d.id} className="card-manager p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted">
                  <Eye className="h-3 w-3" /> View only
                </span>
                <Badge className="bg-amber-50 text-amber-900 border-amber-200">
                  {d.tier}
                </Badge>
              </div>

              <div className="flex gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-beige">
                  <Image
                    src={d.avatarUrl}
                    alt={d.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg">{d.name}</h3>
                  <p className="text-xs font-mono text-muted">{d.donorId}</p>
                  <p className="text-xs text-muted mt-0.5">{d.donationCategory}</p>
                </div>
              </div>

              {d.specialInstructions && (
                <p className="text-xs rounded-lg bg-champagne/5 border border-champagne/20 p-2 text-charcoal">
                  <span className="font-bold">Special instructions: </span>
                  {d.specialInstructions}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Info label="Free-stay eligible" value={d.freeStayEligible ? "Yes" : "No"} />
                <Info label="Donor-sponsored" value={d.donorSponsored ? "Yes" : "No"} />
                <Info label="Free stays left" value={String(d.freeStaysRemaining)} />
                <Info
                  label="Compensation (view)"
                  value={formatCurrency(d.compensationBalance)}
                />
                <Info label="Active coupons" value={String(d.activeCoupons)} />
                <Info label="Remaining" value={d.remainingEligibility} wide />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-muted mb-2">
                  Bookings at this hotel
                </p>
                {d.hotelBookingHistory.length === 0 ? (
                  <p className="text-xs text-muted">No completed stays recorded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {d.hotelBookingHistory.map((b) => (
                      <li
                        key={b.bookingRef}
                        className="text-xs rounded-lg bg-surface p-2 border border-beige/40"
                      >
                        <span className="font-mono font-bold">{b.bookingRef}</span>
                        <span className="text-muted">
                          {" "}
                          · {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                        </span>
                        <p>{b.roomType} · {b.benefitsApplied}</p>
                        <p className="font-bold mt-0.5">
                          Paid {formatCurrency(b.amountPaid)} · {b.paymentStatus}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-muted mb-1">
                  Benefit usage (this property)
                </p>
                <ul className="space-y-1">
                  {d.usageHistory.map((u, i) => (
                    <li
                      key={i}
                      className="text-xs flex justify-between border-b border-beige/30 pb-1"
                    >
                      <span>
                        {formatDate(u.date)} · {u.bookingRef} · {u.benefit}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        −{formatCurrency(u.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {d.expiryNearest && (
                <p className="text-[10px] text-amber-800 font-semibold">
                  Nearest coupon expiry: {formatDate(d.expiryNearest)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-6 pb-8">
        <p className="text-[10px] text-muted">
          Showing {donors.length} donor(s) linked to {hotelBookings.length} booking(s) at
          this property. Total platform contribution amounts are hidden — managed by Super
          Admin.
        </p>
      </div>
    </>
  );
}

function Info({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-lg bg-surface p-2 ${wide ? "col-span-2" : ""}`}>
      <p className="text-muted font-bold uppercase text-[9px]">{label}</p>
      <p className="font-bold text-[11px] leading-snug">{value}</p>
    </div>
  );
}
