"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  createDonor,
  listDonationPurposes,
  listTiers,
  mapDonorProfileToPlatform,
} from "@/lib/api/donors";
import { listBranches } from "@/lib/api/branches";
import type { BackendPurpose, BackendTier } from "@/lib/api/donors";
import type { BackendBranch } from "@/lib/api/branches";
import { useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";
import { PhoneInput } from "@/components/ui/phone-input";
import { validatePhoneField, toBackendPhone } from "@/lib/phone";

export default function NewDonorPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addDonorFromApi = useAdminStore((s) => s.addDonorFromApi);
  const refreshDonorDetail = useAdminStore((s) => s.refreshDonorDetail);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [donorId, setDonorId] = useState("");
  const [tierId, setTierId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [clubName, setClubName] = useState("");
  const [recordDonation, setRecordDonation] = useState(true);
  const [amountRupees, setAmountRupees] = useState("");
  const [purposeId, setPurposeId] = useState("");
  const [receiptNumbers, setReceiptNumbers] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [dispatchMethod, setDispatchMethod] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");

  const [tiers, setTiers] = useState<BackendTier[]>([]);
  const [branches, setBranches] = useState<BackendBranch[]>([]);
  const [purposes, setPurposes] = useState<BackendPurpose[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    void Promise.all([
      listTiers(accessToken),
      listBranches(accessToken),
      listDonationPurposes(accessToken),
    ]).then(([t, b, p]) => {
      setTiers(t);
      setBranches(b.filter((x) => x.is_active !== false));
      setPurposes(p);
      if (t[0]) setTierId(t[0].id);
      if (b[0]) setBranchId(b[0].id);
      if (p[0]) setPurposeId(p[0].id);
    });
  }, [accessToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !tierId || !branchId) {
      setError("Missing tier or branch.");
      return;
    }

    const phoneValidation = validatePhoneField(phone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    setPhoneError("");

    const amount = Number(amountRupees);
    const receipts = receiptNumbers
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (recordDonation) {
      if (!amount || amount <= 0) {
        setError("Enter a valid initial donation amount.");
        return;
      }
      if (!purposeId) {
        setError("Select a donation purpose.");
        return;
      }
      if (receipts.length === 0) {
        setError("Enter at least one receipt number for the initial donation.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const profile = await createDonor(accessToken, {
        phone: toBackendPhone(phone),
        name,
        tier_id: tierId,
        for_place_id: branchId,
        donor_id: donorId || undefined,
        club_name: clubName || undefined,
        district_code: districtCode || undefined,
        initial_donation: recordDonation
          ? {
              amount_paise: Math.round(amount * 100),
              purpose_id: purposeId,
              receipt_numbers: receipts,
              dispatch_date: dispatchDate || null,
              dispatch_method: dispatchMethod || undefined,
              dispatch_notes: dispatchNotes || undefined,
            }
          : undefined,
      });
      const mapped = mapDonorProfileToPlatform(profile);
      addDonorFromApi(mapped);
      await refreshDonorDetail(accessToken, profile.id);
      router.push(`/platform/donors/${profile.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create donor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/platform/donors" className="mb-4 inline-flex items-center gap-1 text-sm text-admin">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-admin">Create donor profile</h1>
      <p className="mb-6 text-sm text-slate-600">
        Register the donor and optionally record their first donation with receipt numbers.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <section className="admin-card space-y-4">
          <h2 className="font-semibold text-admin">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Donor name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <PhoneInput
                id="donor-phone"
                variant="admin"
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                error={phoneError}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Donor ID (optional)</label>
              <input
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <label className="text-sm font-medium">District code</label>
              <input
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="V101A"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Membership tier</label>
              <select
                value={tierId}
                onChange={(e) => setTierId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">For place (branch)</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Club name (optional)</label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </section>

        <section className="admin-card space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-admin">Initial donation</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={recordDonation}
                onChange={(e) => setRecordDonation(e.target.checked)}
              />
              Record donation now
            </label>
          </div>

          {recordDonation && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  required={recordDonation}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Purpose</label>
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
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Receipt number(s)</label>
                <textarea
                  value={receiptNumbers}
                  onChange={(e) => setReceiptNumbers(e.target.value)}
                  placeholder="6804/2020 — one per line or comma-separated"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  rows={2}
                  required={recordDonation}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dispatch date</label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dispatch method</label>
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
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Dispatch notes</label>
                <input
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
          )}
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-admin" disabled={loading}>
          {loading ? "Creating…" : "Create donor"}
        </button>
      </form>
    </div>
  );
}
