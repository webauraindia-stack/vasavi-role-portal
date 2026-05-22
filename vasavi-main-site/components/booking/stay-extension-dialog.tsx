"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  BedDouble,
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
} from "lucide-react";
import { ExtensionPricingPanel } from "@/components/booking/extension-pricing-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { minExtensionDate } from "@/lib/data/customer-bookings";
import type { DonorBooking } from "@/types";
import {
  checkExtensionAvailability,
  completeStayExtensionPayment,
  createStayExtension,
  type AvailabilityCheckResult,
  type StayExtensionRequest,
} from "@/lib/stay-extension/client";
import { formatDate } from "@/lib/utils";

type Step = "date" | "review" | "payment" | "success";

export function StayExtensionDialog({
  booking,
  open,
  onOpenChange,
  onCompleted,
}: {
  booking: DonorBooking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: (newCheckOut: string) => void;
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("date");
  const [requestedCheckOut, setRequestedCheckOut] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityCheckResult | null>(null);
  const [extension, setExtension] = useState<StayExtensionRequest | null>(null);
  const [selectedAltId, setSelectedAltId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [error, setError] = useState<string | null>(null);

  const reference = booking.reference ?? "";
  const minDate = minExtensionDate(booking.checkOut);

  const reset = useCallback(() => {
    setStep("date");
    setRequestedCheckOut("");
    setAvailability(null);
    setExtension(null);
    setSelectedAltId(undefined);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const runAvailabilityCheck = async (date: string) => {
    if (!reference || !date) return;
    setChecking(true);
    setError(null);
    try {
      const result = await checkExtensionAvailability(reference, date);
      setAvailability(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check availability");
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const handleDateChange = (date: string) => {
    setRequestedCheckOut(date);
    if (date) void runAvailabilityCheck(date);
  };

  const handleContinue = async () => {
    if (!reference || !requestedCheckOut) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createStayExtension({
        bookingReference: reference,
        requestedCheckOut,
        selectedAlternativeRoomId: selectedAltId,
        actorEmail: session?.user?.email ?? booking.guestEmail,
      });
      setExtension(created);

      if (created.status === "rejected") {
        setError(created.conflictReason ?? "Extension not available for these dates.");
        return;
      }

      if (created.status === "alternative_offered" && !selectedAltId) {
        setStep("review");
        return;
      }

      if (created.status === "pending_approval") {
        setStep("success");
        return;
      }

      setStep(created.pricing?.totalDue ? "payment" : "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit extension");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!extension) return;
    setSubmitting(true);
    setError(null);
    try {
      const txn = `TXN-GST-${Date.now()}`;
      const completed = await completeStayExtensionPayment({
        id: extension.id,
        paymentTransactionId: txn,
        actorEmail: session?.user?.email ?? booking.guestEmail,
      });
      setExtension(completed);
      setStep("success");
      onCompleted?.(completed.requestedCheckOut);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-champagne" />
            Extend your stay
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted">
          Current checkout: <strong>{formatDate(booking.checkOut)}</strong>
          {booking.roomNumber && (
            <> · Room {booking.roomNumber}</>
          )}
        </p>

        {step === "date" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted block mb-1.5">
                New checkout date
              </label>
              <input
                type="date"
                min={minDate}
                value={requestedCheckOut}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-charcoal/15 px-3 text-sm"
              />
            </div>

            {checking && (
              <p className="text-sm text-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking room availability…
              </p>
            )}

            {availability?.available && availability.pricing && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                Same room is available for your extension dates.
              </div>
            )}

            {availability && !availability.available && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {availability.conflictReason ??
                  "Your current room is not available for the full extension period."}
              </div>
            )}

            {availability?.alternatives && availability.alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted">Alternative rooms</p>
                {availability.alternatives.map((alt) => (
                  <button
                    key={alt.roomId}
                    type="button"
                    onClick={() => setSelectedAltId(alt.roomId)}
                    className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                      selectedAltId === alt.roomId
                        ? "border-champagne bg-champagne/10"
                        : "border-beige/50 hover:border-champagne/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <BedDouble className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          {alt.roomNumber} · {alt.roomName}
                        </p>
                        <p className="text-xs text-muted">{alt.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {availability?.pricing && (
              <ExtensionPricingPanel pricing={availability.pricing} />
            )}

            {error && <p className="text-sm text-rose-700">{error}</p>}

            <Button
              className="w-full"
              disabled={
                !requestedCheckOut ||
                checking ||
                submitting ||
                (!availability?.available && !selectedAltId)
              }
              onClick={() => void handleContinue()}
            >
              {submitting ? "Submitting…" : "Continue"}
            </Button>
          </div>
        )}

        {step === "review" && extension && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Select an alternative room above, then confirm to proceed with your extension request.
            </p>
            <Button
              className="w-full"
              disabled={!selectedAltId || submitting}
              onClick={() => void handleContinue()}
            >
              Confirm room transfer
            </Button>
          </div>
        )}

        {step === "payment" && extension?.pricing && (
          <div className="space-y-4">
            <ExtensionPricingPanel pricing={extension.pricing} />
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-muted">Payment method</p>
              {(["upi", "card", "netbanking"] as const).map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                    paymentMethod === m ? "border-champagne bg-champagne/10" : "border-beige/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                  />
                  <CreditCard className="h-4 w-4" />
                  {m.toUpperCase()}
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <Button className="w-full" disabled={submitting} onClick={() => void handlePayment()}>
              {submitting ? "Processing…" : `Pay & extend stay`}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <p className="font-display text-lg text-charcoal">
              {extension?.status === "pending_approval"
                ? "Extension submitted for hotel approval"
                : "Stay extended successfully"}
            </p>
            <p className="text-sm text-muted">
              New checkout:{" "}
              <strong>{formatDate(extension?.requestedCheckOut ?? requestedCheckOut)}</strong>
            </p>
            <p className="text-xs text-muted">
              Confirmation sent via email, SMS, and WhatsApp (demo).
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
