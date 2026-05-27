"use client";

import { useEffect, useState } from "react";
import { Headphones, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportQueryForm } from "@/components/support/support-query-form";
import type { SupportTicket } from "@/lib/types";

const FORM_ID = "support-ticket-form";

type Props = {
  open: boolean;
  hotelId: string;
  onClose: () => void;
  onSubmit: (ticket: SupportTicket) => void;
};

export function CreateSupportTicketDialog({ open, hotelId, onClose, onSubmit }: Props) {
  const [resetKey, setResetKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setResetKey((k) => k + 1);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, submitting, onClose]);

  const handleSubmit = (ticket: SupportTicket) => {
    onSubmit(ticket);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close"
        onClick={!submitting ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-ticket-title"
        className="relative z-10 flex w-full max-h-[min(92dvh,640px)] sm:max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-beige/60 bg-white shadow-2xl sm:max-w-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-beige/40 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 id="support-ticket-title" className="font-display text-lg text-charcoal">
                Create support ticket
              </h2>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Mock only — saved in this browser until a support API is connected.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="shrink-0 rounded-lg p-2 text-muted hover:bg-surface hover:text-charcoal disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <SupportQueryForm
            formId={FORM_ID}
            hotelId={hotelId}
            resetKey={resetKey}
            onSubmit={handleSubmit}
            onSubmittingChange={setSubmitting}
          />
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-beige/40 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-4 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Submitting…" : "Submit ticket"}
          </Button>
        </div>
      </div>
    </div>
  );
}
