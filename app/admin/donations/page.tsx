"use client";

import Link from "next/link";
import { ArrowRight, Crown, FileText, Heart } from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { Can } from "@/components/rbac/can";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import { useAdminStore } from "@/stores/admin-store";
import { formatINR } from "@/lib/utils";

export default function DonationsAdminPage() {
  const donors = useAdminStore((s) => s.donors);
  const totalContributions = donors.reduce((s, d) => s + d.totalContribution, 0);
  const pending = donors.filter((d) => d.status === "pending_approval").length;

  return (
    <PermissionGuard
      permission={["donations.view", "donations.manage", "donors.manage"]}
    >
      <PlatformModuleHeader
        badge="Super Admin · Platform"
        title="Donations"
        description="Platform-wide donation programs, donor records, receipts, and certificates — managed from this portal."
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Total donors</p>
            <p className="mt-1 text-2xl font-bold text-charcoal">{donors.length}</p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Pending approval</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{pending}</p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Contributions (demo)</p>
            <p className="mt-1 text-2xl font-bold text-champagne-dark">
              {formatINR(totalContributions)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Can permission="donors.manage">
            <Link
              href="/admin/donors"
              className="card-manager flex items-start gap-4 p-5 transition-colors hover:border-champagne/40"
            >
              <Crown className="h-8 w-8 text-champagne shrink-0" />
              <div className="flex-1">
                <h2 className="font-bold text-charcoal">Donor management</h2>
                <p className="text-sm text-muted mt-1">
                  Create, approve, suspend, and archive platform donors
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted shrink-0 mt-1" />
            </Link>
          </Can>
          <Can permission="analytics.donations">
            <Link
              href="/admin/donors/analytics"
              className="card-manager flex items-start gap-4 p-5 transition-colors hover:border-champagne/40"
            >
              <Heart className="h-8 w-8 text-champagne shrink-0" />
              <div className="flex-1">
                <h2 className="font-bold text-charcoal">Donation analytics</h2>
                <p className="text-sm text-muted mt-1">
                  Contributions, utilization, and hotel-wise reports
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted shrink-0 mt-1" />
            </Link>
          </Can>
          <Can permission="donors.receipts">
            <div className="card-manager flex items-start gap-4 p-5 opacity-90">
              <FileText className="h-8 w-8 text-muted shrink-0" />
              <div>
                <h2 className="font-bold text-charcoal">Receipts & certificates</h2>
                <p className="text-sm text-muted mt-1">
                  Generate tax receipts and donor certificates (production PDF service)
                </p>
              </div>
            </div>
          </Can>
        </div>
      </div>
    </PermissionGuard>
  );
}
