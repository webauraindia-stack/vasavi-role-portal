"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  SUPPORT_QUERY_CATEGORIES,
  categoryLabel,
  type SupportQueryCategory,
} from "@/lib/support/query-categories";
import type { SupportTicket } from "@/lib/types";

export type SupportQueryPayload = {
  category: SupportQueryCategory;
  bookingReference: string;
  guestName: string;
  description: string;
  priority: SupportTicket["priority"];
};

const emptyForm: SupportQueryPayload = {
  category: "booking_sync",
  bookingReference: "",
  guestName: "",
  description: "",
  priority: "medium",
};

type Props = {
  hotelId: string;
  formId?: string;
  onSubmit: (ticket: SupportTicket) => void;
  /** Reset fields when dialog closes */
  resetKey?: number;
  onSubmittingChange?: (submitting: boolean) => void;
};

const fieldLabel =
  "text-xs font-bold text-muted uppercase tracking-wider";

const selectClass =
  "flex h-10 w-full rounded-lg border border-beige/60 bg-white px-3 text-sm font-medium focus:border-champagne focus:outline-none";

export function SupportQueryForm({
  hotelId,
  formId = "support-ticket-form",
  onSubmit,
  resetKey = 0,
  onSubmittingChange,
}: Props) {
  const [form, setForm] = useState<SupportQueryPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(emptyForm);
    setSubmitting(false);
    onSubmittingChange?.(false);
  }, [resetKey, onSubmittingChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) return;

    setSubmitting(true);
    onSubmittingChange?.(true);
    const label = categoryLabel(form.category);
    const ticket: SupportTicket = {
      id: `mock-${Date.now()}`,
      subject: label,
      guestName: form.guestName.trim() || "Branch staff report",
      status: "open",
      priority: form.priority,
      createdAt: new Date().toISOString(),
      hotelId,
      category: form.category,
      description: form.description.trim(),
      bookingReference: form.bookingReference.trim() || undefined,
    };

    window.setTimeout(() => {
      onSubmit(ticket);
      setForm(emptyForm);
      setSubmitting(false);
      onSubmittingChange?.(false);
    }, 400);
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label htmlFor="support-category" className={fieldLabel}>
          Issue type
        </label>
        <select
          id="support-category"
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value as SupportQueryCategory }))
          }
          className={selectClass}
        >
          {SUPPORT_QUERY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="support-ref" className={fieldLabel}>
            Booking ref (optional)
          </label>
          <Input
            id="support-ref"
            placeholder="e.g. VHB-2024-0012"
            value={form.bookingReference}
            onChange={(e) => setForm((f) => ({ ...f, bookingReference: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="support-guest" className={fieldLabel}>
            Guest name (optional)
          </label>
          <Input
            id="support-guest"
            placeholder="Guest or contact name"
            value={form.guestName}
            onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="support-priority" className={fieldLabel}>
          Priority
        </label>
        <select
          id="support-priority"
          value={form.priority}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              priority: e.target.value as SupportTicket["priority"],
            }))
          }
          className={selectClass}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="support-desc" className={fieldLabel}>
          What happened?
        </label>
        <textarea
          id="support-desc"
          required
          rows={4}
          placeholder="Describe the issue staff or guests are facing…"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="flex w-full rounded-lg border border-beige/60 bg-white px-3 py-2 text-sm font-medium focus:border-champagne focus:outline-none resize-y min-h-[96px]"
        />
      </div>

      {/* Hidden submit for form association; visible button is in dialog footer */}
      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden disabled={submitting}>
        Submit
      </button>
    </form>
  );
}
