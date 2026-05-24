"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Label on the destructive/confirm button */
  confirmLabel?: string;
  /** If true, confirm button uses rose/danger styling */
  destructive?: boolean;
  /** If true, shows a textarea for reason input */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonMinLength?: number;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter reason…",
  reasonMinLength = 5,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setReason("");
      setReasonError("");
    }
  }, [open]);

  // Focus cancel on open
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleConfirm = () => {
    if (requireReason) {
      const trimmed = reason.trim();
      if (trimmed.length < reasonMinLength) {
        setReasonError(`Please provide at least ${reasonMinLength} characters.`);
        return;
      }
      onConfirm(trimmed);
    } else {
      onConfirm();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative z-10 w-full max-w-md rounded-2xl border border-beige/60 bg-white shadow-2xl p-6 space-y-5"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:bg-surface transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + title */}
        <div className="flex items-start gap-3">
          {destructive && (
            <div className="shrink-0 w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          )}
          <div>
            <h2
              id="confirm-title"
              className="font-display text-lg text-charcoal"
            >
              {title}
            </h2>
            <p id="confirm-message" className="text-sm text-muted mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Optional reason textarea */}
        {requireReason && (
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-reason"
              className="block text-[10px] font-bold uppercase text-muted"
            >
              {reasonLabel} *
            </label>
            <textarea
              id="confirm-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder={reasonPlaceholder}
              rows={3}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm resize-none",
                "focus:outline-none focus:ring-1 focus:ring-champagne",
                reasonError
                  ? "border-rose-400 bg-rose-50"
                  : "border-beige/60 bg-white"
              )}
            />
            {reasonError && (
              <p className="text-xs text-rose-600">{reasonError}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            ref={cancelRef}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && reason.trim().length < reasonMinLength)}
            className={cn(
              destructive &&
                "bg-rose-600 hover:bg-rose-700 text-white border-transparent"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 014 12z"
                  />
                </svg>
                Processing…
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
