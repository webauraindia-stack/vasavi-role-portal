"use client";

import { useState } from "react";
import { createDonation, type BackendPurpose } from "@/lib/api/donors";

type Props = {
  accessToken: string;
  donorProfileId: string;
  purposes: BackendPurpose[];
  onRecorded: () => void;
};

export function RecordDonationForm({
  accessToken,
  donorProfileId,
  purposes,
  onRecorded,
}: Props) {
  const [amountRupees, setAmountRupees] = useState("");
  const [purposeId, setPurposeId] = useState(purposes[0]?.id ?? "");
  const [receiptNumbers, setReceiptNumbers] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [dispatchMethod, setDispatchMethod] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(amountRupees);
    const receipts = receiptNumbers
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!amount || amount <= 0) {
      setError("Enter a valid donation amount.");
      return;
    }
    if (!purposeId) {
      setError("Select a donation purpose.");
      return;
    }
    if (receipts.length === 0) {
      setError("Enter at least one receipt number.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createDonation(accessToken, {
        donor_id: donorProfileId,
        amount_paise: Math.round(amount * 100),
        purpose_id: purposeId,
        receipt_numbers: receipts,
        dispatch_date: dispatchDate || null,
        dispatch_method: dispatchMethod || undefined,
        dispatch_notes: dispatchNotes || undefined,
      });
      setAmountRupees("");
      setReceiptNumbers("");
      setDispatchDate("");
      setDispatchMethod("");
      setDispatchNotes("");
      onRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record donation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-3 text-sm">
      <h3 className="font-semibold text-admin">Record donation</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="font-medium">Amount (₹)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={amountRupees}
            onChange={(e) => setAmountRupees(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="font-medium">Purpose</label>
          <select
            value={purposeId}
            onChange={(e) => setPurposeId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            {purposes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="font-medium">Receipt number(s)</label>
        <textarea
          value={receiptNumbers}
          onChange={(e) => setReceiptNumbers(e.target.value)}
          placeholder="6804/2020 — one per line or comma-separated"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          rows={2}
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="font-medium">Dispatch date</label>
          <input
            type="date"
            value={dispatchDate}
            onChange={(e) => setDispatchDate(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="font-medium">Dispatch method</label>
          <select
            value={dispatchMethod}
            onChange={(e) => setDispatchMethod(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="">—</option>
            <option value="courier">Courier</option>
            <option value="by_hand">By hand</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="font-medium">Dispatch notes</label>
          <input
            value={dispatchNotes}
            onChange={(e) => setDispatchNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>
      {error && <p className="text-red-700">{error}</p>}
      <button type="submit" className="btn-admin text-xs" disabled={loading}>
        {loading ? "Saving…" : "Record donation"}
      </button>
    </form>
  );
}
