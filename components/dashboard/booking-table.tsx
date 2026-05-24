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
import { useToast } from "@/components/ui/toast";
import { CancellationDialog } from "@/components/dashboard/cancellation-dialog";
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
  onCancel,
  onExtendCheckout,
}: {
  bookings: ManagerBooking[];
  onStatusChange?: (id: string, status: ManagerBooking["bookingStatus"], reason?: string) => Promise<{ ok: boolean; error?: string }>;
  onRecordCash?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  onRefund?: (id: string) => void;
  onCancel?: (id: string, reason: string, refundType: "full" | "partial" | "none", refundAmountPaise?: number, refundReference?: string) => Promise<{ ok: boolean; error?: string }>;
  onExtendCheckout?: (
    id: string,
    newCheckOut: string
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Dialog state
  const [cancelBookingObj, setCancelBookingObj] = useState<ManagerBooking | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const toast = useToast();

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

  const handleAction = async (id: string, action: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) => {
    setActionBusyId(id);
    const res = await action();
    setActionBusyId(null);
    if (res.ok) {
      toast.success(successMsg);
    } else {
      toast.error(res.error ?? "Action failed");
    }
  };

  const doCancel = async (params: { reason: string; refundType: "full" | "partial" | "none"; refundAmountPaise?: number; refundReference?: string }) => {
    if (!cancelBookingObj || !onCancel) return;
    setDialogBusy(true);
    const res = await onCancel(
      cancelBookingObj.id,
      params.reason,
      params.refundType,
      params.refundAmountPaise,
      params.refundReference
    );
    setDialogBusy(false);
    if (res.ok) {
      toast.success("Booking cancelled successfully.");
      setCancelBookingObj(null);
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
  };

  return (
    <div className="space-y-4">
      <CancellationDialog
        open={!!cancelBookingObj}
        booking={cancelBookingObj}
        isLoading={dialogBusy}
        onClose={() => setCancelBookingObj(null)}
        onConfirm={doCancel}
      />

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
            const isBusy = actionBusyId === booking.id;

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
                      <p className="text-[10px] text-muted">{booking.guestPhone}</p>
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
                    <Badge className={cn("ml-5 text-[9px]", GUEST_TYPE_COLORS[booking.guestType] || "bg-slate-100 text-slate-700")}>
                      {booking.guestTypeLabel}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div>
                      <p className="font-mono font-bold text-charcoal">
                        {booking.finalAmountDisplay || formatCurrency(booking.finalAmountPaise / 100)}
                      </p>
                      <Badge
                        className={cn(
                          "mt-0.5 text-[9px]",
                          PAYMENT_STATUS_COLORS[booking.paymentStatus] || "bg-slate-100 text-slate-700"
                        )}
                      >
                        {booking.paymentStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <Badge
                      className={cn("text-[9px]", BOOKING_STATUS_COLORS[booking.bookingStatus] || "bg-slate-100 text-slate-700")}
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
                    
                    {/* Record Cash Button */}
                    {(booking.paymentStatus === "unpaid" || booking.paymentStatus === "partial") && onRecordCash && booking.bookingStatus !== "cancelled" && (
                      <Button
                        variant="gold"
                        size="sm"
                        disabled={isBusy}
                        className="text-[10px] px-2"
                        onClick={() => handleAction(booking.id, () => onRecordCash(booking.id), "Cash payment recorded.")}
                      >
                        Record cash
                      </Button>
                    )}

                    {/* Check In Button directly accessible from row */}
                    {booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid" && onStatusChange && (
                       <Button
                         variant="default"
                         size="sm"
                         disabled={isBusy}
                         className="text-[10px] px-2"
                         onClick={() => handleAction(booking.id, () => onStatusChange(booking.id, "checked_in"), "Guest checked in.")}
                       >
                         Check in
                       </Button>
                    )}

                    {onStatusChange && (
                      <StatusMenu
                        booking={booking}
                        disabled={isBusy}
                        onStatusChange={async (status) => {
                           if (status === "cancelled") {
                             setCancelBookingObj(booking);
                           } else if (status === "no_show") {
                             const reason = window.prompt("Reason for no-show:", "Guest did not arrive");
                             if (reason) {
                               await handleAction(booking.id, () => onStatusChange(booking.id, status, reason), "Marked as no-show.");
                             }
                           } else {
                             await handleAction(booking.id, () => onStatusChange(booking.id, status), "Status updated.");
                           }
                        }}
                      />
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
  disabled,
  onStatusChange,
}: {
  booking: ManagerBooking;
  disabled?: boolean;
  onStatusChange: (status: ManagerBooking["bookingStatus"]) => void;
}) {
  const nextActions: { label: string; status: ManagerBooking["bookingStatus"] }[] = [];

  if (
    booking.bookingStatus === "pending" &&
    (booking.paymentStatus === "paid" || booking.paymentStatus === "free_stay")
  ) {
    nextActions.push({ label: "Confirm", status: "confirmed" });
  }
  if (booking.bookingStatus === "checked_in") {
    nextActions.push({ label: "Check out", status: "checked_out" });
  }
  if (
    booking.bookingStatus !== "cancelled" &&
    booking.bookingStatus !== "checked_out"
  ) {
    nextActions.push({ label: "No-show", status: "no_show" });
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
          disabled={disabled}
          className="text-[10px] px-2"
          onClick={() => onStatusChange(action.status)}
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
  const toast = useToast();

  const canExtendCheckout =
    onExtendCheckout &&
    (booking.bookingStatus === "checked_in" || booking.bookingStatus === "confirmed");

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
            <div className="flex justify-between gap-4">
              <span className="text-muted">Base amount</span>
              <span className="font-mono font-semibold text-charcoal tabular-nums">
                {booking.baseAmountDisplay || formatCurrency(booking.baseAmountPaise / 100)}
              </span>
            </div>
            {booking.discountAmountPaise > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-muted">Discount</span>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                  −{booking.discountDisplay || formatCurrency(booking.discountAmountPaise / 100)}
                </span>
              </div>
            )}
            <div className="border-t border-beige/50 pt-2 mt-2 flex justify-between gap-4">
              <span className="font-bold text-charcoal">Final amount</span>
              <span className="font-mono text-base font-bold text-charcoal tabular-nums">
                {booking.finalAmountDisplay || formatCurrency(booking.finalAmountPaise / 100)}
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
          
          {(booking.bookingStatus === "cancelled" || booking.refundAmount > 0) && (
             <dl className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-beige/40 pt-3">
                {booking.cancellationReason && (
                   <Detail label="Cancel Reason" value={booking.cancellationReason} className="col-span-2" />
                )}
                {booking.refundAmount > 0 && (
                   <Detail label="Refund Amount" value={formatCurrency(booking.refundAmount / 100)} mono className="text-rose-700" />
                )}
                {booking.refundReference && (
                   <Detail label="Refund Ref" value={booking.refundReference} mono />
                )}
             </dl>
          )}
        </section>
      </div>

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
                } else {
                  toast.success("Stay extended successfully.");
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
  compact,
}: {
  bookings: ManagerBooking[];
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
                <td className="py-2 px-3 font-mono">{b.finalAmountDisplay || formatCurrency(b.finalAmountPaise / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <BookingList bookings={bookings} />;
}

export function BookingDetailCard({ booking }: { booking: ManagerBooking }) {
  return (
    <div className="card-manager p-5 space-y-4">
      <BookingExpandedDetail booking={booking} />
    </div>
  );
}
