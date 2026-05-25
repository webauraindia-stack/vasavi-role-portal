"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DonorAvatar, donorPhotoSrc } from "@/components/ui/donor-avatar";
import { CreateCouponBatchForm } from "@/components/admin/create-coupon-batch-form";
import { RecordDonationForm } from "@/components/admin/record-donation-form";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Gift, History, Wallet } from "lucide-react";
import { formatDate, formatINR, sponsorshipLabel } from "@/lib/utils";
import { listDonationPurposes, type BackendPurpose } from "@/lib/api/donors";
import { useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";

type Tab = "profile" | "coupons" | "transactions" | "documents";

export default function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);
  const donor = useAdminStore((s) => s.donors.find((d) => d.id === id));
  const refreshDonorDetail = useAdminStore((s) => s.refreshDonorDetail);
  const updateDonor = useAdminStore((s) => s.updateDonor);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purposes, setPurposes] = useState<BackendPurpose[]>([]);

  useEffect(() => {
    if (!accessToken || !id) return;
    let cancelled = false;
    setLoading(true);
    void refreshDonorDetail(accessToken, id)
      .catch(() => {
        /* store surfaces errors via empty donor state */
      })
      .finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken, id, refreshDonorDetail]);

  useEffect(() => {
    if (!accessToken) return;
    void listDonationPurposes(accessToken).then(setPurposes);
  }, [accessToken]);

  const reload = () => {
    if (!accessToken || !id) return;
    void refreshDonorDetail(accessToken, id);
  };

  if (loading && !donor) {
    return <p className="text-sm text-muted p-6">Loading donorΓÇª</p>;
  }

  if (!donor) {
    return (
      <div className="p-6">
        <p>Donor not found.</p>
        <Link href="/platform/donors" className="text-admin underline">
          Back to list
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Gift }[] = [
    { id: "profile", label: "Profile", icon: Gift },
    { id: "coupons", label: "Coupons", icon: Wallet },
    { id: "transactions", label: "Donations", icon: History },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="p-6">
      <Link href="/platform/donors" className="mb-4 inline-flex items-center gap-1 text-sm text-admin">
        <ArrowLeft className="h-4 w-4" /> All donors
      </Link>
      <div className="admin-card mb-6 flex flex-wrap gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl">
          <DonorAvatar name={donor.name} src={donor.profilePhoto} sizes="96px" />
        </div>
        {donorPhotoSrc(donor.familyPhoto) && (
          <div className="relative h-24 w-36 overflow-hidden rounded-xl">
            <Image
              src={donorPhotoSrc(donor.familyPhoto)!}
              alt="Family"
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-admin">{donor.name}</h1>
          <p className="font-mono text-sm text-slate-500">{donor.donorId}</p>
          <p className="text-sm capitalize">
            {donor.status.replace(/_/g, " ")} ┬╖ {donor.city}
          </p>
          <p className="mt-1 text-sm font-semibold text-admin">
            Total contributed {formatINR(donor.totalContribution)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            type="button"
            onClick={() => setTab(tid)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm ${
              tab === tid ? "border-admin text-admin font-medium" : "border-transparent text-slate-500"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="admin-card space-y-3 text-sm">
            <h2 className="font-semibold text-admin">Profile & benefits</h2>
            <Row label="Email" value={donor.email} />
            <Row label="Phone" value={donor.phone} />
            <Row label="Category" value={donor.donationCategory} />
            <Row label="Membership" value={donor.membershipLevel} />
            <Row label="Total contribution" value={formatINR(donor.totalContribution)} />
            <Row label="Coupons available" value={String(donor.freeStayAllocation)} />
            <Row label="Sponsorship" value={donor.sponsorshipTypes.map(sponsorshipLabel).join(", ") || "ΓÇö"} />
            <p className="text-slate-600">{donor.notes || "ΓÇö"}</p>
          </div>
        </div>
      )}

      {tab === "coupons" && accessToken && (
        <div className="grid gap-6 lg:grid-cols-2">
          {donor.userId ? (
            <CreateCouponBatchForm
              accessToken={accessToken}
              donorProfileId={donor.id}
              donorUserId={donor.userId}
              onCreated={reload}
            />
          ) : (
            <p className="text-sm text-slate-500">Reload donor to issue coupons.</p>
          )}
          <div className="space-y-4 lg:col-span-2">
            {donor.coupons.length === 0 ? (
              <p className="text-sm text-slate-500">No coupons issued yet.</p>
            ) : (
              donor.coupons.map((c) => (
                <div key={c.id} className="admin-card">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm">
                        #{c.code}
                      </code>
                      <p className="mt-1 font-medium">{c.label}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {c.benefitType.replace(/_/g, " ")} ┬╖ {c.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "transactions" && accessToken && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RecordDonationForm
            accessToken={accessToken}
            donorProfileId={donor.id}
            purposes={purposes}
            onRecorded={reload}
          />
          <div className="admin-card overflow-x-auto lg:col-span-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="p-2">Date</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Dispatch</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donor.transactions.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="p-2">{formatDate(t.date)}</td>
                    <td className="font-semibold">{formatINR(t.amount)}</td>
                    <td>{t.category}</td>
                    <td className="capitalize">{t.paymentMethod}</td>
                    <td className="font-mono text-xs">{t.receiptNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donor.transactions.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No donations recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {tab === "documents" && (
        <ul className="space-y-2">
          {donor.documents.length === 0 && (
            <p className="text-sm text-slate-500">No documents uploaded.</p>
          )}
        </ul>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
