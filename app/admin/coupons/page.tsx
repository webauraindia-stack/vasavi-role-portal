"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import {
  createCouponBatch,
  dispatchCoupons,
  listCouponBatches,
  listCoupons,
  type BackendCoupon,
  type BackendCouponBatch,
} from "@/lib/api/coupons";
import { listDonations } from "@/lib/api/donors";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/utils";

export default function CouponsAdminPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [batches, setBatches] = useState<BackendCouponBatch[]>([]);
  const [coupons, setCoupons] = useState<BackendCoupon[]>([]);
  const [donations, setDonations] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [donationId, setDonationId] = useState("");
  const [couponType, setCouponType] = useState<"concession" | "free">("concession");
  const [serialStart, setSerialStart] = useState("");
  const [serialEnd, setSerialEnd] = useState("");
  const [extraBenefit, setExtraBenefit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [batchRows, couponRows, donationRows] = await Promise.all([
        listCouponBatches(accessToken),
        listCoupons(accessToken, { status: "issued" }),
        listDonations(accessToken),
      ]);
      setBatches(batchRows);
      setCoupons(couponRows.slice(0, 50));
      const opts = donationRows.map((d) => ({
        id: d.id,
        label: `${d.amount_display ?? ""} · ${d.purpose?.name ?? "Donation"} · ${d.donor?.name ?? ""}`,
      }));
      setDonations(opts);
      if (opts[0]) setDonationId(opts[0].id);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !donationId) return;
    const start = Number(serialStart);
    const end = Number(serialEnd);
    if (!start || !end || end < start) {
      setError("Enter a valid serial range.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const batch = await createCouponBatch(accessToken, {
        donation_id: donationId,
        coupon_type: couponType,
        serial_start: start,
        serial_end: end,
        extra_benefit: extraBenefit || undefined,
      });
      const issued = await listCoupons(accessToken, { status: "issued" });
      const ids = issued.filter((c) => c.batch?.id === batch.id).map((c) => c.id);
      if (ids.length) await dispatchCoupons(accessToken, ids);
      setShowForm(false);
      setSerialStart("");
      setSerialEnd("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create batch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PermissionGuard permission="coupons.manage">
      <PlatformModuleHeader
        badge="Super Admin"
        title="Coupon management"
        description="Create coupon batches against donations and dispatch them to donors."
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-admin" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4 inline" />
            {showForm ? "Cancel" : "New coupon batch"}
          </button>
          <Link href="/admin/donors" className="btn-outline text-sm">
            Donor management
          </Link>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="admin-card space-y-3 text-sm">
            <h2 className="font-semibold text-admin">Create batch</h2>
            <div>
              <label className="font-medium">Donation</label>
              <select
                value={donationId}
                onChange={(e) => setDonationId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {donations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="font-medium">Type</label>
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
              <label className="font-medium">Extra benefit</label>
              <input
                value={extraBenefit}
                onChange={(e) => setExtraBenefit(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            {error && <p className="text-red-700">{error}</p>}
            <button type="submit" className="btn-admin text-xs" disabled={submitting}>
              {submitting ? "Creating…" : "Create & dispatch"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-admin">
                <Ticket className="h-5 w-5" /> Recent batches
              </h2>
              {batches.length === 0 ? (
                <p className="text-sm text-slate-500">No coupon batches yet.</p>
              ) : (
                batches.map((b) => (
                  <div key={b.id} className="admin-card text-sm">
                    <p className="font-medium capitalize">
                      {b.coupon_type} · #{b.serial_start}–{b.serial_end} ({b.count} coupons)
                    </p>
                    <p className="text-slate-500">
                      Donation {b.donation?.amount_display ?? "—"} ·{" "}
                      {b.created_at ? formatDate(b.created_at.slice(0, 10)) : ""}
                    </p>
                    {b.extra_benefit && (
                      <p className="mt-1 text-slate-600">{b.extra_benefit}</p>
                    )}
                  </div>
                ))
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold text-admin">Issued (pending dispatch)</h2>
              <p className="text-xs text-slate-500">
                Showing up to 50 issued coupons. Use donor profile to assign to a specific donor.
              </p>
              {coupons.length === 0 ? (
                <p className="text-sm text-slate-500">None</p>
              ) : (
                <p className="font-mono text-sm">{coupons.map((c) => c.serial_number).join(", ")}</p>
              )}
            </section>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
