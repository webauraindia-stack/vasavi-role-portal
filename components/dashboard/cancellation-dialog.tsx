"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { ManagerBooking } from "@/lib/types";

interface CancellationDialogProps {
  open: boolean;
  booking: ManagerBooking | null;
  isLoading?: boolean;
  onConfirm: (params: {
    reason: string;
    refundType: "full" | "partial" | "none";
    refundAmountPaise?: number;
    refundReference?: string;
  }) => void;
  onClose: () => void;
}

export function CancellationDialog({
  open,
  booking,
  isLoading = false,
  onConfirm,
  onClose,
}: CancellationDialogProps) {
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial" | "none">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPaid = booking?.paymentStatus === "paid";
  const totalRupees = booking ? Math.round((booking.finalAmountPaise ?? 0) / 100) : 0;

  useEffect(() => {
    if (!open) {
      setReason("");
      setRefundType("full");
      setPartialAmount("");
      setRefundReference("");
      setErrors({});
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isLoading, onClose]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters.";
    }
    if (isPaid && refundType === "partial") {
      const amt = parseFloat(partialAmount);
      if (isNaN(amt) || amt <= 0) {
        newErrors.partialAmount = "Enter a valid refund amount.";
      } else if (amt > totalRupees) {
        newErrors.partialAmount = `Cannot exceed ₹${totalRupees.toLocaleString("en-IN")}.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const refundAmountPaise =
      refundType === "full"
        ? booking?.finalAmountPaise
        : refundType === "partial"
        ? Math.round(parseFloat(partialAmount) * 100)
        : undefined;

    onConfirm({
      reason: reason.trim(),
      refundType,
      refundAmountPaise,
      refundReference: refundReference.trim() || undefined,
    });
  };

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-beige/60 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <h2 id="cancel-title" className="font-display text-lg text-charcoal">
                Cancel booking
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

        <div className="p-6 space-y-5">
          {/* Warning for paid bookings */}
          {isPaid && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              <strong>This booking has been paid (
                {booking.finalAmountDisplay ?? `₹${totalRupees.toLocaleString("en-IN")}`}
              ).</strong>
              {" "}Please specify refund details below.
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1.5">
            <label htmlFor="cancel-reason" className="block text-[10px] font-bold uppercase text-muted">
              Cancellation reason *
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) setErrors((p) => ({ ...p, reason: "" }));
              }}
              placeholder="Provide a reason for the cancellation (min 10 characters)…"
              rows={3}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                "focus:outline-none focus:ring-1 focus:ring-champagne",
                errors.reason ? "border-rose-400 bg-rose-50" : "border-beige/60"
              )}
            />
            {errors.reason && (
              <p className="text-xs text-rose-600">{errors.reason}</p>
            )}
          </div>

          {/* Refund options (only for paid bookings) */}
          {isPaid && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-muted">Refund</p>
              <div className="grid grid-cols-3 gap-2">
                {(["full", "partial", "none"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRefundType(t)}
                    className={cn(
                      "rounded-lg border p-2.5 text-sm font-medium text-center transition-colors",
                      refundType === t
                        ? "border-champagne bg-champagne/10 text-charcoal"
                        : "border-beige/60 hover:border-champagne/40 text-muted"
                    )}
                  >
                    {t === "full"
                      ? `Full (${booking.finalAmountDisplay ?? `₹${totalRupees.toLocaleString("en-IN")}`})`
                      : t === "partial"
                      ? "Partial"
                      : "No refund"}
                  </button>
                ))}
              </div>

              {refundType === "partial" && (
                <div className="space-y-1.5">
                  <label htmlFor="partial-amount" className="block text-[10px] font-bold uppercase text-muted">
                    Refund amount (₹) *
                  </label>
                  <Input
                    id="partial-amount"
                    type="number"
                    min="1"
                    max={totalRupees}
                    value={partialAmount}
                    onChange={(e) => {
                      setPartialAmount(e.target.value);
                      if (errors.partialAmount)
                        setErrors((p) => ({ ...p, partialAmount: "" }));
                    }}
                    placeholder={`Max ₹${totalRupees.toLocaleString("en-IN")}`}
                    className={errors.partialAmount ? "border-rose-400" : ""}
                  />
                  {errors.partialAmount && (
                    <p className="text-xs text-rose-600">{errors.partialAmount}</p>
                  )}
                </div>
              )}

              {refundType !== "none" && (
                <div className="space-y-1.5">
                  <label htmlFor="refund-ref" className="block text-[10px] font-bold uppercase text-muted">
                    Cash receipt / refund reference (optional)
                  </label>
                  <Input
                    id="refund-ref"
                    value={refundReference}
                    onChange={(e) => setRefundReference(e.target.value)}
                    placeholder="Receipt number or bank ref…"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-beige/40">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep booking
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || reason.trim().length < 10}
            className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 014 12z" />
                </svg>
                Cancelling…
              </span>
            ) : isPaid && refundType !== "none" ? (
              `Cancel & Refund ${
                refundType === "full"
                  ? booking.finalAmountDisplay ?? formatCurrency(totalRupees)
                  : partialAmount
                  ? formatCurrency(parseFloat(partialAmount) || 0)
                  : "amount"
              }`
            ) : (
              "Cancel booking"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
