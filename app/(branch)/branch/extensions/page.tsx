"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CalendarClock,
  Check,
  IndianRupee,
  RefreshCw,
  X,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useAuthStore } from "@/stores/auth-store";
import { useExtensionStore } from "@/stores/extension-store";
import { useManagerStore } from "@/stores/manager-store";
import type { StayExtensionRequest } from "@/lib/stay-extension/types";
import {
  cn,
  EXTENSION_STATUS_COLORS,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";

export default function ExtensionsDashboardPage() {
  const { hotelId } = useHotelScope();
  const user = useAuthStore((s) => s.user);
  const { requests, loading, fetchRequests, patchRequest } = useExtensionStore();
  const applyStayExtension = useManagerStore((s) => s.applyStayExtension);
  const pushExtensionNotification = useManagerStore((s) => s.pushExtensionNotification);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(() => {
    void fetchRequests(hotelId);
  }, [fetchRequests, hotelId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0];

  const handleAction = async (
    action: "approve" | "reject" | "waive" | "complete_payment" | "suggest_alternative",
    ext: StayExtensionRequest
  ) => {
    const result = await patchRequest({
      id: ext.id,
      action,
      actor: user?.email ?? "admin@vasavi.org",
      actorRole: user?.role ?? "admin",
      rejectionReason: rejectReason || undefined,
      adminNote: adminNote || undefined,
      paymentTransactionId:
        action === "complete_payment" ? `TXN-ADM-${Date.now()}` : undefined,
    });

    if (!result) return;

    if (result.status === "completed") {
      applyStayExtension({
        bookingId: result.bookingId,
        newCheckOut: result.requestedCheckOut,
        roomNumber: result.roomNumber,
        extraAmount: result.pricing?.totalDue ?? 0,
        guestName: result.guestName,
        reference: result.bookingReference,
        hotelId: result.hotelId,
      });
    } else {
      pushExtensionNotification({
        hotelId: result.hotelId,
        guestName: result.guestName,
        reference: result.bookingReference,
        status: result.status,
      });
    }

    setRejectReason("");
    setAdminNote("");
  };

  return (
    <PermissionGuard permission="bookings.extend">
      <DashboardHeader
        title="Stay extensions"
        subtitle="Review extension requests, approve pricing, suggest room transfers, and sync inventory in real time"
      />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All statuses</option>
            <option value="pending_approval">Pending approval</option>
            <option value="pending_payment">Pending payment</option>
            <option value="alternative_offered">Alternative offered</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Badge className="bg-champagne/15 text-champagne-dark">
            {filtered.filter((r) => r.status.includes("pending")).length} active
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2 card-manager overflow-hidden">
            <div className="border-b border-beige/40 px-4 py-3 text-xs font-bold uppercase text-muted">
              Request queue
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-beige/30">
              {filtered.length === 0 && (
                <p className="p-6 text-sm text-muted">No extension requests yet.</p>
              )}
              {filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-beige/20 transition-colors",
                    selected?.id === r.id && "bg-champagne/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-charcoal">{r.guestName}</p>
                      <p className="text-[11px] text-muted">{r.bookingReference}</p>
                    </div>
                    <Badge className={EXTENSION_STATUS_COLORS[r.status] ?? ""}>
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(r.originalCheckOut)} → {formatDate(r.requestedCheckOut)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <ExtensionDetailPanel
              ext={selected}
              rejectReason={rejectReason}
              adminNote={adminNote}
              onRejectReason={setRejectReason}
              onAdminNote={setAdminNote}
              onAction={handleAction}
            />
          ) : (
            <div className="lg:col-span-3 card-manager p-8 text-center text-muted text-sm">
              Select a request to review guest details, availability, and pricing.
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

function ExtensionDetailPanel({
  ext,
  rejectReason,
  adminNote,
  onRejectReason,
  onAdminNote,
  onAction,
}: {
  ext: StayExtensionRequest;
  rejectReason: string;
  adminNote: string;
  onRejectReason: (v: string) => void;
  onAdminNote: (v: string) => void;
  onAction: (
    action: "approve" | "reject" | "waive" | "complete_payment" | "suggest_alternative",
    ext: StayExtensionRequest
  ) => void;
}) {
  return (
    <div className="lg:col-span-3 card-manager p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-charcoal flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-champagne" />
            {ext.guestName}
          </h2>
          <p className="text-sm text-muted mt-1">
            {ext.bookingReference} · {ext.hotelName}
          </p>
        </div>
        <Badge className={EXTENSION_STATUS_COLORS[ext.status] ?? ""}>
          {ext.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <Info label="Guest email" value={ext.guestEmail} />
        <Info label="Phone" value={ext.guestPhone} />
        <Info label="Room" value={`${ext.roomNumber ?? "—"} · ${ext.roomType}`} />
        <Info
          label="Checkout change"
          value={`${formatDate(ext.originalCheckOut)} → ${formatDate(ext.requestedCheckOut)}`}
        />
        <Info label="Availability" value={ext.availabilityStatus} />
        <Info label="Approval" value={ext.approvalSource ?? "manual review"} />
      </div>

      {ext.conflictReason && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {ext.conflictReason}
        </div>
      )}

      {ext.pricing && (
        <div className="rounded-lg border border-beige/50 bg-white/80 p-4 space-y-2 text-sm">
          <p className="text-xs font-bold uppercase text-muted flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            Additional charges
          </p>
          <PricingRow label={`${ext.pricing.extraNights} extra night(s)`} value={ext.pricing.subtotal} />
          <PricingRow label="Tier discount" value={-ext.pricing.tierDiscount} />
          <PricingRow label="GST (12%)" value={ext.pricing.taxes} />
          {ext.pricing.waivedAmount > 0 && (
            <PricingRow label="Waived" value={-ext.pricing.waivedAmount} />
          )}
          <div className="border-t border-beige/40 pt-2 flex justify-between font-bold">
            <span>Total due</span>
            <span>{formatCurrency(ext.pricing.totalDue)}</span>
          </div>
        </div>
      )}

      {ext.alternativeRooms && ext.alternativeRooms.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-muted">Alternative rooms</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ext.alternativeRooms.map((alt) => (
              <div
                key={alt.roomId}
                className="rounded-lg border border-beige/50 p-3 text-sm flex items-start gap-2"
              >
                <BedDouble className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {alt.roomNumber} · {alt.roomName}
                  </p>
                  <p className="text-xs text-muted">{alt.category}</p>
                  {alt.priceDifference > 0 && (
                    <p className="text-xs text-amber-800">
                      +{formatCurrency(alt.priceDifference)} vs current room
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Rejection reason (optional)"
          value={rejectReason}
          onChange={(e) => onRejectReason(e.target.value)}
        />
        <Input
          placeholder="Admin note to guest"
          value={adminNote}
          onChange={(e) => onAdminNote(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ext.status === "pending_approval" && (
          <>
            <Button size="sm" className="gap-1" onClick={() => onAction("approve", ext)}>
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("reject", ext)}
              className="gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAction("waive", ext)}>
              Waive & complete
            </Button>
          </>
        )}
        {ext.status === "pending_payment" && (
          <Button size="sm" onClick={() => onAction("complete_payment", ext)}>
            Mark payment received
          </Button>
        )}
        {ext.status === "alternative_offered" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("suggest_alternative", ext)}
          >
            Re-send alternatives
          </Button>
        )}
      </div>

      <div className="border-t border-beige/40 pt-4">
        <p className="text-xs font-bold uppercase text-muted mb-2">Audit trail</p>
        <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
          {ext.auditLog.map((entry) => (
            <div key={entry.id} className="flex justify-between gap-2 text-muted">
              <span>
                <span className="font-bold text-charcoal">{entry.action}</span> — {entry.actor}{" "}
                <span className="opacity-70">({entry.actorRole})</span>
              </span>
              <span className="shrink-0">{formatDateTime(entry.at)}</span>
            </div>
          ))}
        </div>
      </div>

      {ext.notificationsSent.length > 0 && (
        <p className="text-[11px] text-muted">
          Notifications: {ext.notificationsSent.join(" · ")}
        </p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
      <p className="font-medium text-charcoal capitalize">{value}</p>
    </div>
  );
}

function PricingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono font-bold">
        {value < 0 ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
