"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, Check, Pause, Plus, Search } from "lucide-react";
import { cn, formatDate, formatINR, sponsorshipLabel } from "@/lib/utils";
import type { DonorStatus } from "@/lib/donor-types";
import { useAdminStore } from "@/stores/admin-store";

const STATUS_FILTERS: (DonorStatus | "all")[] = [
  "all",
  "active",
  "pending_approval",
  "suspended",
  "archived",
];

export default function DonorsListPage() {
  const donors = useAdminStore((s) => s.donors);
  const updateDonorStatus = useAdminStore((s) => s.updateDonorStatus);
  const archiveDonor = useAdminStore((s) => s.archiveDonor);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [q, setQ] = useState("");

  const filtered = donors.filter((d) => {
    if (filter !== "all" && d.status !== filter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      d.name.toLowerCase().includes(s) ||
      d.donorId.toLowerCase().includes(s) ||
      d.city.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin">Donor management</h1>
          <p className="text-sm text-slate-500">
            Create, approve, suspend, archive — full platform donor control
          </p>
        </div>
        <Link href="/admin/donors/new" className="btn-admin flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add donor
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, ID, city…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                filter === s ? "bg-admin text-white" : "bg-white border border-slate-200"
              )}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((d) => (
          <div key={d.id} className="admin-card flex flex-wrap gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Image src={d.profilePhoto} alt={d.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/donors/${d.id}`} className="font-semibold text-admin hover:underline">
                  {d.name}
                </Link>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    d.status === "active" && "bg-emerald-100 text-emerald-800",
                    d.status === "pending_approval" && "bg-amber-100 text-amber-800",
                    d.status === "suspended" && "bg-orange-100 text-orange-800",
                    d.status === "archived" && "bg-slate-100 text-slate-600"
                  )}
                >
                  {d.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500">{d.donorId}</p>
              <p className="text-sm text-slate-600">
                {d.membershipLevel} · {d.city} · {formatINR(d.totalContribution)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {d.sponsorshipTypes.map(sponsorshipLabel).join(", ")} ·{" "}
                {d.coupons.filter((c) => c.status === "active").length} active coupons
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              {d.status === "pending_approval" && (
                <button
                  type="button"
                  onClick={() => updateDonorStatus(d.id, "active")}
                  className="btn-outline flex items-center gap-1 text-xs text-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
              )}
              {d.status === "active" && (
                <button
                  type="button"
                  onClick={() => updateDonorStatus(d.id, "suspended")}
                  className="btn-outline flex items-center gap-1 text-xs"
                >
                  <Pause className="h-3.5 w-3.5" /> Suspend
                </button>
              )}
              {d.status !== "archived" && (
                <button
                  type="button"
                  onClick={() => archiveDonor(d.id)}
                  className="btn-outline flex items-center gap-1 text-xs text-slate-600"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              )}
              <Link href={`/admin/donors/${d.id}`} className="btn-admin text-xs py-1.5">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
