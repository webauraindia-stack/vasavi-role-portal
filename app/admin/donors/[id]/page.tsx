"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Gift, History, Wallet } from "lucide-react";
import { formatDate, formatINR, sponsorshipLabel } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";

type Tab = "profile" | "coupons" | "transactions" | "documents";

export default function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const donor = useAdminStore((s) => s.donors.find((d) => d.id === id));
  const updateDonor = useAdminStore((s) => s.updateDonor);
  const [tab, setTab] = useState<Tab>("profile");

  if (!donor) {
    return (
      <div>
        <p>Donor not found.</p>
        <Link href="/admin/donors" className="text-admin underline">
          Back to list
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Gift }[] = [
    { id: "profile", label: "Profile", icon: Gift },
    { id: "coupons", label: "Coupons & audit", icon: Wallet },
    { id: "transactions", label: "Donations", icon: History },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div>
      <Link href="/admin/donors" className="mb-4 inline-flex items-center gap-1 text-sm text-admin">
        <ArrowLeft className="h-4 w-4" /> All donors
      </Link>
      <div className="admin-card mb-6 flex flex-wrap gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl">
          <Image src={donor.profilePhoto} alt={donor.name} fill className="object-cover" sizes="96px" />
        </div>
        {donor.familyPhoto && (
          <div className="relative h-24 w-36 overflow-hidden rounded-xl">
            <Image src={donor.familyPhoto} alt="Family" fill className="object-cover" sizes="144px" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-admin">{donor.name}</h1>
          <p className="font-mono text-sm text-slate-500">{donor.donorId}</p>
          <p className="text-sm capitalize">{donor.status.replace(/_/g, " ")} · {donor.city}</p>
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
            <Row label="Validity" value={`${formatDate(donor.validityStart)} – ${formatDate(donor.validityEnd)}`} />
            <Row label="Free-stay allocation" value={String(donor.freeStayAllocation)} />
            <Row label="Compensation allocation" value={formatINR(donor.compensationAllocation)} />
            <Row label="Sponsorship" value={donor.sponsorshipTypes.map(sponsorshipLabel).join(", ")} />
            <Row label="Rewards" value={donor.rewardEligibility.join(", ") || "—"} />
            <p className="text-slate-600">{donor.notes}</p>
            {donor.appreciationMessage && (
              <p className="rounded-lg bg-amber-50 p-3 italic text-amber-900">
                {donor.appreciationMessage}
              </p>
            )}
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() =>
                updateDonor(donor.id, {
                  notes: donor.notes + " (edited by Super Admin)",
                })
              }
            >
              Save notes (demo)
            </button>
          </div>
        </div>
      )}

      {tab === "coupons" && (
        <div className="space-y-4">
          {donor.coupons.map((c) => (
            <div key={c.id} className="admin-card">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm">{c.code}</code>
                  <p className="mt-1 font-medium">{c.label}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {c.benefitType.replace(/_/g, " ")} · {c.status}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>Issued {formatDate(c.issuedAt)}</p>
                  <p>Expires {formatDate(c.expiresAt)}</p>
                  <p className="font-semibold">Balance {formatINR(c.remainingBalance)}</p>
                </div>
              </div>
              {c.usageHistory.length > 0 && (
                <table className="mt-4 w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-2">Date</th>
                      <th>Hotel</th>
                      <th>Booking</th>
                      <th>Applied</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.usageHistory.map((u, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="py-2">{formatDate(u.usedAt)}</td>
                        <td>{u.hotelName}</td>
                        <td className="font-mono">{u.bookingRef}</td>
                        <td>{formatINR(u.amountApplied)}</td>
                        <td>{formatINR(u.remainingAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "transactions" && (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="p-2">Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Method</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {donor.transactions.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="p-2">{formatDate(t.date)}</td>
                  <td className="font-semibold">{formatINR(t.amount)}</td>
                  <td>{t.category}</td>
                  <td>{t.paymentMethod}</td>
                  <td className="font-mono text-xs">{t.receiptNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "documents" && (
        <ul className="space-y-2">
          {donor.documents.map((doc) => (
            <li key={doc.id} className="admin-card flex justify-between text-sm">
              <span>{doc.name}</span>
              <span className="text-slate-500 capitalize">
                {doc.type} · {formatDate(doc.uploadedAt)}
              </span>
            </li>
          ))}
          {donor.documents.length === 0 && (
            <p className="text-sm text-slate-500">No documents uploaded.</p>
          )}
          <button type="button" className="btn-outline text-xs">
            Upload document (demo)
          </button>
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
