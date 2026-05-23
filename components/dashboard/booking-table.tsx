"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Crown,
  Eye,
  Search,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StayExtensionRequest } from "@/lib/stay-extension/types";
import type { ManagerBooking } from "@/lib/types";
import {
  BOOKING_STATUS_COLORS,
  EXTENSION_STATUS_COLORS,
  GUEST_TYPE_COLORS,
  PAYMENT_STATUS_COLORS,
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "checked_in", label: "In-house" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "checked_out", label: "Departed" },
] as const;

export function BookingList({
  bookings,
  extensions = [],
  onStatusChange,
}: {
  bookings: ManagerBooking[];
  extensions?: StayExtensionRequest[];
  onStatusChange?: (id: string, status: ManagerBooking["bookingStatus"]) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]["value"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const extensionByRef = useMemo(
    () => new Map(extensions.map((e) => [e.bookingReference, e])),
    [extensions]
  );

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusTab !== "all") {
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
          b.guestEmail.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, query, statusTab]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      inHouse: bookings.filter((b) => b.bookingStatus === "checked_in").length,
      pending: bookings.filter((b) => b.bookingStatus === "pending").length,
      extensions: extensions.filter((e) =>
        ["pending_approval", "pending_payment", "alternative_offered"].includes(e.status)
      ).length,
    }),
    [bookings, extensions]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={stats.total} />
        <StatCard label="In-house guests" value={stats.inHouse} tone="text-blue-800" />
        <StatCard label="Awaiting confirmation" value={stats.pending} tone="text-amber-800" />
        <StatCard
          label="Open extensions"
          value={stats.extensions}
          tone="text-champagne-dark"
          href="/dashboard/extensions"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, reference, room, email…"
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
            const extension = extensionByRef.get(booking.reference);
            const expanded = expandedId === booking.id;
            const canExtend =
              booking.bookingStatus === "checked_in" ||
              booking.bookingStatus === "confirmed";

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
                        {extension && (
                          <Badge
                            className={cn(
                              "text-[9px]",
                              EXTENSION_STATUS_COLORS[extension.status] ?? ""
                            )}
                          >
                            Extension · {extension.status.replace(/_/g, " ")}
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
                      <Badge className={cn("mt-0.5 text-[9px]", PAYMENT_STATUS_COLORS[booking.paymentStatus])}>
                        {booking.paymentStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <Badge className={cn("text-[9px]", BOOKING_STATUS_COLORS[booking.bookingStatus])}>
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
                    {canExtend && (
                      <Link
                        href="/dashboard/extensions"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Extend
                      </Link>
                    )}
                    {onStatusChange && (
                      <StatusMenu booking={booking} onStatusChange={onStatusChange} />
                    )}
                  </div>
                </div>

                {(booking.appliedCoupons.length > 0 || booking.tierDiscount > 0) && !expanded && (
                  <div className="border-t border-beige/30 bg-emerald-50/40 px-4 py-2 flex flex-wrap gap-x-4 gap-y-1">
                    {booking.tierDiscount > 0 && (
                      <span className="text-[10px] font-semibold text-amber-800">
                        Tier −{formatCurrency(booking.tierDiscount)}
                      </span>
                    )}
                    {booking.appliedCoupons.map((c) => (
                      <span
                        key={c.code}
                        className="text-[10px] font-semibold text-emerald-800"
                      >
                        −{formatCurrency(c.amountDeducted)} · {c.code}
                      </span>
                    ))}
                  </div>
                )}

                {expanded && (
                  <div className="border-t border-beige/40 bg-surface/40 p-4">
                    <BookingExpandedDetail booking={booking} extension={extension} />
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
  href,
}: {
  label: string;
  value: number;
  tone?: string;
  href?: string;
}) {
  const inner = (
    <div className="card-manager p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", tone)}>{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}

function StatusMenu({
  booking,
  onStatusChange,
}: {
  booking: ManagerBooking;
  onStatusChange: (id: string, status: ManagerBooking["bookingStatus"]) => void;
}) {
  const nextActions: { label: string; status: ManagerBooking["bookingStatus"] }[] = [];

  if (booking.bookingStatus === "pending") {
    nextActions.push({ label: "Confirm", status: "confirmed" });
  }
  if (booking.bookingStatus === "confirmed") {
    nextActions.push({ label: "Check in", status: "checked_in" });
  }
  if (booking.bookingStatus === "checked_in") {
    nextActions.push({ label: "Check out", status: "checked_out" });
  }
  if (booking.bookingStatus !== "cancelled") {
    nextActions.push({ label: "Cancel", status: "cancelled" });
  }

  if (nextActions.length === 0) {
    return null;
  }

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
  extension,
}: {
  booking: ManagerBooking;
  extension?: StayExtensionRequest;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
        <Detail label="Email" value={booking.guestEmail} />
        <Detail label="Phone" value={booking.guestPhone} />
        <Detail label="Source" value={booking.source.replace("_", " ")} />
        <Detail label="Booked on" value={formatDateTime(booking.createdAt)} />
        <Detail label="Subtotal" value={formatCurrency(booking.subtotal)} />
        <Detail label="Taxes" value={formatCurrency(booking.taxes)} />
        <Detail
          label="Special requests"
          value={booking.specialRequests ?? "None"}
          className="col-span-2 sm:col-span-3"
        />
      </dl>
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-xl border border-beige bg-white p-3">
          <QRCodeSVG value={booking.qrCode} size={88} />
        </div>
        <p className="text-[10px] font-mono text-muted">{booking.qrCode}</p>
      </div>

      {booking.appliedCoupons.length > 0 && (
        <div className="lg:col-span-2 rounded-lg border border-emerald-200/60 bg-emerald-50 p-3">
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

      {extension && (
        <div className="lg:col-span-2 rounded-lg border border-champagne/30 bg-champagne/5 p-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-champagne-dark">Stay extension in progress</p>
            <p className="text-xs text-muted mt-0.5">
              Requested checkout: {formatDate(extension.requestedCheckOut)}
              {extension.pricing && ` · ${formatCurrency(extension.pricing.totalDue)} due`}
            </p>
          </div>
          <Link
            href="/dashboard/extensions"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Manage extension
          </Link>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-charcoal capitalize">{value}</dd>
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

  return (
    <BookingList bookings={bookings} onStatusChange={onStatusChange} />
  );
}

export function BookingDetailCard({ booking }: { booking: ManagerBooking }) {
  return (
    <div className="card-manager p-5 space-y-4">
      <BookingExpandedDetail booking={booking} />
    </div>
  );
}
