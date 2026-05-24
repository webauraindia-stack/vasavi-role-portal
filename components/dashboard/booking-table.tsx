"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Crown,
  Eye,
  Home,
  Receipt,
  Search,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ManagerBooking } from "@/lib/types";
import {
  BOOKING_STATUS_COLORS,
  GUEST_TYPE_COLORS,
  PAYMENT_STATUS_COLORS,
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "in_house", label: "In-house" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "checked_in", label: "Checked in" },
  { value: "checked_out", label: "Departed" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

function sourceLabel(booking: ManagerBooking): string {
  if (booking.isInHouse) return "In-house (desk)";
  switch (booking.source) {
    case "walk_in":
      return "Walk-in";
    case "phone":
      return "Phone";
    case "donor_portal":
      return "Donor portal";
    default:
      return "Website";
  }
}

export function BookingList({
  bookings,
  onStatusChange,
  onRecordCash,
  onRefund,
  onExtendCheckout,
}: {
  bookings: ManagerBooking[];
  onStatusChange?: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  onRecordCash?: (id: string) => void | Promise<void>;
  onRefund?: (id: string) => void | Promise<void>;
  onExtendCheckout?: (
    id: string,
    newCheckOut: string
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusTab === "in_house") {
      list = list.filter((b) => b.isInHouse);
    } else if (statusTab !== "all") {
      list = list.filter((b) => b.bookingStatus === statusTab);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.reference.toLowerCase().includes(q) ||
          b.roomNumber?.toLowerCase().includes(q) ||
          b.memberId?.toLowerCase().includes(q) ||
          b.guestPhone.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, query, statusTab]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      inHouse: bookings.filter((b) => b.isInHouse).length,
      checkedIn: bookings.filter((b) => b.bookingStatus === "checked_in").length,
      pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    }),
    [bookings]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={stats.total} />
        <StatCard label="In-house (desk)" value={stats.inHouse} tone="text-champagne-dark" />
        <StatCard label="Guests checked in" value={stats.checkedIn} tone="text-blue-800" />
        <StatCard label="Awaiting confirmation" value={stats.pending} tone="text-amber-800" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, reference, room, phone…"
            className="pl-9 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                statusTab === tab.value
                  ? "bg-champagne text-white"
                  : "bg-white border border-beige/60 text-muted hover:text-charcoal"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-manager py-16 text-center">
          <p className="text-sm text-muted">No bookings match your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const expanded = expandedId === booking.id;

            return (
              <article
                key={booking.id}
                className="card-manager overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="grid gap-4 p-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-sm font-bold text-champagne-dark">
                      {booking.guestName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-charcoal truncate">{booking.guestName}</p>
                        {booking.isVip && (
                          <Crown className="h-3.5 w-3.5 text-champagne-dark shrink-0" />
                        )}
                        {booking.isInHouse && (
                          <Badge className="text-[9px] bg-champagne/15 text-champagne-dark border-champagne/30">
                            <Home className="h-2.5 w-2.5 mr-0.5 inline" />
                            In-house
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-muted">{booking.reference}</p>
                      {booking.memberId && (
                        <p className="text-[10px] font-semibold text-champagne">
                          {booking.memberId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-charcoal font-medium">
                      <CalendarRange className="h-3.5 w-3.5 text-champagne shrink-0" />
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                    </div>
                    <p className="text-xs text-muted pl-5">
                      {booking.nights} night(s) · {booking.roomType}
                      {booking.roomNumber ? ` · Room ${booking.roomNumber}` : ""}
                    </p>
                    <Badge className={cn("ml-5 text-[9px]", GUEST_TYPE_COLORS[booking.guestType])}>
                      {booking.guestTypeLabel}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div>
                      <p className="font-mono font-bold text-charcoal">
                        {formatCurrency(booking.total)}
                      </p>
                      <Badge
                        className={cn(
                          "mt-0.5 text-[9px]",
                          PAYMENT_STATUS_COLORS[booking.paymentStatus]
                        )}
                      >
                        {booking.paymentStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <Badge
                      className={cn("text-[9px]", BOOKING_STATUS_COLORS[booking.bookingStatus])}
                    >
                      {booking.bookingStatus.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setExpandedId(expanded ? null : booking.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {expanded ? "Hide" : "Details"}
                      {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {booking.paymentStatus === "pending" && onRecordCash && (
                      <Button
                        variant="gold"
                        size="sm"
                        className="text-[10px] px-2"
                        onClick={() => void onRecordCash(booking.id)}
                      >
                        Record cash
                      </Button>
                    )}
                    {booking.paymentStatus === "paid" &&
                      booking.bookingStatus !== "cancelled" &&
                      onRefund && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] px-2"
                          onClick={() => void onRefund(booking.id)}
                        >
                          Refund
                        </Button>
                      )}
                    {onStatusChange && (
                      <StatusMenu booking={booking} onStatusChange={onStatusChange} />
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-beige/40 bg-surface/40 p-4">
                    <BookingExpandedDetail
                      booking={booking}
                      onExtendCheckout={onExtendCheckout}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "text-charcoal",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="card-manager p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", tone)}>{value}</p>
    </div>
  );
}

function StatusMenu({
  booking,
  onStatusChange,
}: {
  booking: ManagerBooking;
  onStatusChange: (id: string, status: ManagerBooking["bookingStatus"]) => void;
}) {
  const nextActions: { label: string; status: ManagerBooking["bookingStatus"] }[] = [];

  if (
    booking.bookingStatus === "pending" &&
    (booking.paymentStatus === "paid" || booking.paymentStatus === "free_stay")
  ) {
    nextActions.push({ label: "Confirm", status: "confirmed" });
  }
  if (booking.bookingStatus === "confirmed") {
    nextActions.push({ label: "Check in", status: "checked_in" });
  }
  if (booking.bookingStatus === "checked_in") {
    nextActions.push({ label: "Check out", status: "checked_out" });
  }
  if (
    booking.bookingStatus !== "cancelled" &&
    booking.bookingStatus !== "checked_out"
  ) {
    nextActions.push({ label: "Cancel", status: "cancelled" });
  }

  if (nextActions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {nextActions.map((action) => (
        <Button
          key={action.status + action.label}
          variant={action.label === "Cancel" ? "outline" : "gold"}
          size="sm"
          className="text-[10px] px-2"
          onClick={() => onStatusChange(booking.id, action.status)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function BookingExpandedDetail({
  booking,
  onExtendCheckout,
}: {
  booking: ManagerBooking;
  onExtendCheckout?: (
    id: string,
    newCheckOut: string
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [newCheckOut, setNewCheckOut] = useState(booking.checkOut);
  const [extendBusy, setExtendBusy] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);

  const canExtendCheckout =
    onExtendCheckout &&
    (booking.bookingStatus === "checked_in" || booking.bookingStatus === "confirmed");

  const lineItems = [
    { label: "Room charges", amount: booking.subtotal },
    ...(booking.tierDiscount > 0
      ? [{ label: "Tier discount", amount: -booking.tierDiscount }]
      : []),
    ...(booking.couponDiscount > 0
      ? [{ label: "Coupon / promo", amount: -booking.couponDiscount }]
      : []),
    ...(booking.walletApplied > 0
      ? [{ label: "Wallet applied", amount: -booking.walletApplied }]
      : []),
    ...(booking.taxes > 0 ? [{ label: "Taxes & fees", amount: booking.taxes }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-beige/60 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-champagne" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Guest details
            </h3>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <Detail label="Name" value={booking.guestName} />
            <Detail label="Phone" value={booking.guestPhone || "—"} />
            <Detail label="Email" value={booking.guestEmail} />
            <Detail label="Guests" value={String(booking.guestCount ?? 1)} />
            <Detail label="Source" value={sourceLabel(booking)} />
            <Detail label="Booked on" value={formatDateTime(booking.createdAt)} />
            <Detail label="Room" value={booking.roomNumber ?? "Unassigned"} />
            <Detail label="Room type" value={booking.roomType} />
            <Detail
              label="Stay"
              value={`${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)} (${booking.nights}n)`}
              className="col-span-2"
            />
            {booking.specialRequests && (
              <Detail
                label="Requests"
                value={booking.specialRequests}
                className="col-span-2"
              />
            )}
            {booking.notes && !booking.notes.startsWith("[In-house") && (
              <Detail label="Notes" value={booking.notes} className="col-span-2" />
            )}
          </dl>
        </section>

        <section className="rounded-xl border border-beige/60 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-champagne" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Invoice & payment
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            {lineItems.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="text-muted">{row.label}</span>
                <span
                  className={cn(
                    "font-mono font-semibold tabular-nums",
                    row.amount < 0 ? "text-emerald-700" : "text-charcoal"
                  )}
                >
                  {row.amount < 0 ? "−" : ""}
                  {formatCurrency(Math.abs(row.amount))}
                </span>
              </div>
            ))}
            <div className="border-t border-beige/50 pt-2 mt-2 flex justify-between gap-4">
              <span className="font-bold text-charcoal">Total amount</span>
              <span className="font-mono text-base font-bold text-charcoal tabular-nums">
                {booking.finalAmountDisplay ?? formatCurrency(booking.total)}
              </span>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-beige/40 pt-3">
            <Detail label="Payment status" value={booking.paymentStatus.replace("_", " ")} />
            <Detail label="Booking status" value={booking.bookingStatus.replace("_", " ")} />
            {booking.paymentGateway && (
              <Detail label="Gateway" value={booking.paymentGateway} />
            )}
            {booking.paymentReference && (
              <Detail label="Reference" value={booking.paymentReference} mono />
            )}
            {booking.paymentPaidAt && (
              <Detail label="Paid at" value={formatDateTime(booking.paymentPaidAt)} />
            )}
          </dl>
        </section>
      </div>

      {booking.appliedCoupons.length > 0 && (
        <div className="rounded-lg border border-emerald-200/60 bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-800 mb-2">
            Benefits applied
          </p>
          <div className="space-y-1">
            {booking.appliedCoupons.map((c) => (
              <p key={c.code} className="text-xs text-emerald-900">
                {c.name}: −{formatCurrency(c.amountDeducted)}{" "}
                <span className="text-emerald-700/70">({c.redeemedAt})</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {canExtendCheckout && (
        <section className="rounded-xl border border-champagne/30 bg-champagne/5 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-champagne-dark mb-2">
            Extend checkout date
          </h3>
          <p className="text-xs text-muted mb-3">
            Update the guest&apos;s checkout when they stay longer. Current checkout:{" "}
            {formatDate(booking.checkOut)}.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                New checkout
              </label>
              <Input
                type="date"
                value={newCheckOut}
                min={booking.checkOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
                className="h-9 w-44"
              />
            </div>
            <Button
              variant="gold"
              size="sm"
              disabled={extendBusy || newCheckOut <= booking.checkOut}
              onClick={async () => {
                if (!onExtendCheckout) return;
                setExtendBusy(true);
                setExtendError(null);
                const result = await onExtendCheckout(booking.id, newCheckOut);
                setExtendBusy(false);
                if (!result.ok) {
                  setExtendError(result.error ?? "Could not extend stay.");
                }
              }}
            >
              {extendBusy ? "Saving…" : "Save new checkout"}
            </Button>
          </div>
          {extendError && (
            <p className="mt-2 text-xs text-red-700">{extendError}</p>
          )}
        </section>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-bold uppercase text-muted">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-medium text-charcoal",
          mono && "font-mono text-[11px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** @deprecated Use BookingList — kept for compact embeds */
export function BookingTable({
  bookings,
  onStatusChange,
  compact,
}: {
  bookings: ManagerBooking[];
  onStatusChange?: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige/50 text-left text-[10px] font-bold uppercase text-muted">
              <th className="py-2 px-3">Guest</th>
              <th className="py-2 px-3">Stay</th>
              <th className="py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-beige/30">
                <td className="py-2 px-3 font-bold">{b.guestName}</td>
                <td className="py-2 px-3 text-xs text-muted">
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                </td>
                <td className="py-2 px-3 font-mono">{formatCurrency(b.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <BookingList bookings={bookings} onStatusChange={onStatusChange} />;
}

export function BookingDetailCard({ booking }: { booking: ManagerBooking }) {
  return (
    <div className="card-manager p-5 space-y-4">
      <BookingExpandedDetail booking={booking} />
    </div>
  );
}
