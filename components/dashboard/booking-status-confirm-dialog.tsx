"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_STATUS_LABELS, type StatusAction } from "@/lib/booking/status-workflow";
import type { ManagerBooking } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingStatusConfirmDialog({
  open,
  booking,
  action,
  isLoading = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  booking: ManagerBooking | null;
  action: StatusAction | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isLoading, onClose]);

  if (!open || !booking || !action) return null;

  const handleConfirm = () => {
    if (action.requiresReason && reason.trim().length < 5) {
      setError("Please enter a brief reason (at least 5 characters).");
      return;
    }
    setError(null);
    onConfirm(action.requiresReason ? reason.trim() : undefined);
  };

  const isDanger = action.tone === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-confirm-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-beige/60 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige/40">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isDanger ? "bg-rose-100" : "bg-champagne/15"
              )}
            >
              <AlertTriangle
                className={cn("h-4 w-4", isDanger ? "text-rose-600" : "text-champagne-dark")}
              />
            </div>
            <div>
              <h2 id="status-confirm-title" className="font-display text-lg text-charcoal">
                Confirm change
              </h2>
              <p className="text-xs text-muted">
                {booking.reference} · {booking.guestName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={!isLoading ? onClose : undefined}
            className="p-1 rounded-lg text-muted hover:bg-surface transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-charcoal">
            Change status from{" "}
            <strong>{BOOKING_STATUS_LABELS[booking.bookingStatus]}</strong> to{" "}
            <strong>{BOOKING_STATUS_LABELS[action.status]}</strong>?
          </p>
          <p className="text-sm text-muted">{action.description}</p>

          {action.requiresReason && (
            <div className="space-y-1.5">
              <label
                htmlFor="status-reason"
                className="block text-[10px] font-bold uppercase text-muted"
              >
                Reason *
              </label>
              <textarea
                id="status-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                rows={3}
                placeholder="Brief note for the audit log…"
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                  "focus:outline-none focus:ring-1 focus:ring-champagne",
                  error ? "border-rose-400 bg-rose-50" : "border-beige/60"
                )}
              />
              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-beige/40">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Go back
          </Button>
          <Button
            variant={isDanger ? "default" : "gold"}
            onClick={handleConfirm}
            disabled={isLoading}
            className={isDanger ? "bg-rose-600 hover:bg-rose-700 text-white border-transparent" : ""}
          >
            {isLoading ? "Updating…" : `Yes, ${action.label.toLowerCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
