"use client";

import { useState } from "react";
import { createCouponBatch, dispatchCoupons, listCoupons } from "@/lib/api/coupons";
import { listDonations } from "@/lib/api/donors";

type Props = {
  accessToken: string;
  donorProfileId: string;
  donorUserId: string;
  onCreated: () => void;
};

export function CreateCouponBatchForm({
  accessToken,
  donorProfileId,
  donorUserId,
  onCreated,
}: Props) {
  const [donationId, setDonationId] = useState("");
  const [donations, setDonations] = useState<{ id: string; label: string }[]>([]);
  const [couponType, setCouponType] = useState<"concession" | "free">("concession");
  const [serialStart, setSerialStart] = useState("");
  const [serialEnd, setSerialEnd] = useState("");
  const [extraBenefit, setExtraBenefit] = useState("");
  const [dispatchAfterCreate, setDispatchAfterCreate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function loadDonations() {
    if (loaded) return;
    const rows = await listDonations(accessToken, donorProfileId);
    const options = rows.map((d) => ({
      id: d.id,
      label: `${d.amount_display ?? `₹${(d.amount_paise / 100).toLocaleString("en-IN")}`} · ${d.purpose?.name ?? "Donation"} · ${d.created_at?.slice(0, 10)}`,
    }));
    setDonations(options);
    if (options[0]) setDonationId(options[0].id);
    setLoaded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const start = Number(serialStart);
    const end = Number(serialEnd);
    if (!donationId) {
      setError("Select a donation to link this coupon batch.");
      return;
    }
    if (!start || !end || end < start) {
      setError("Enter a valid serial number range.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const batch = await createCouponBatch(accessToken, {
        donation_id: donationId,
        coupon_type: couponType,
        serial_start: start,
        serial_end: end,
        extra_benefit: extraBenefit || undefined,
        assigned_donor_ids: [donorUserId],
      });

      if (dispatchAfterCreate) {
        const coupons = await listCoupons(accessToken, { donorProfileId });
        const toDispatch = coupons
          .filter((c) => c.batch?.id === batch.id && c.status === "issued")
          .map((c) => c.id);
        if (toDispatch.length) {
          await dispatchCoupons(accessToken, toDispatch);
        }
      }

      setSerialStart("");
      setSerialEnd("");
      setExtraBenefit("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon batch.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={() => void loadDonations()}
      className="admin-card space-y-3 text-sm"
    >
      <h3 className="font-semibold text-admin">Issue coupon batch</h3>
      <p className="text-xs text-slate-500">
        Coupons are generated against a recorded donation, then dispatched to this donor.
      </p>
      <div>
        <label className="font-medium">Linked donation</label>
        <select
          value={donationId}
          onChange={(e) => setDonationId(e.target.value)}
          onFocus={() => void loadDonations()}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        >
          {donations.length === 0 ? (
            <option value="">Record a donation first</option>
          ) : (
            donations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="font-medium">Coupon type</label>
          <select
            value={couponType}
            onChange={(e) => setCouponType(e.target.value as "concession" | "free")}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="concession">Concession</option>
            <option value="free">Free stay</option>
          </select>
        </div>
        <div>
          <label className="font-medium">Serial start</label>
          <input
            type="number"
            min={1}
            value={serialStart}
            onChange={(e) => setSerialStart(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="font-medium">Serial end</label>
          <input
            type="number"
            min={1}
            value={serialEnd}
            onChange={(e) => setSerialEnd(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
      </div>
      <div>
        <label className="font-medium">Extra benefit (optional)</label>
        <input
          value={extraBenefit}
          onChange={(e) => setExtraBenefit(e.target.value)}
          placeholder="e.g. 50% concession on hall booking for 1 day"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={dispatchAfterCreate}
          onChange={(e) => setDispatchAfterCreate(e.target.checked)}
        />
        Dispatch coupons to donor immediately
      </label>
      {error && <p className="text-red-700">{error}</p>}
      <button type="submit" className="btn-admin text-xs" disabled={loading || !donationId}>
        {loading ? "Creating…" : "Create & dispatch coupons"}
      </button>
    </form>
  );
}
