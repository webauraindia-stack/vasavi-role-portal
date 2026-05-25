"use client";

import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { Can } from "@/components/rbac/can";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import { useFinanceAnalytics } from "@/hooks/use-analytics";
import { useHotelScope } from "@/hooks/use-hotel-scope";

export default function FinanceAdminPage() {
  const { viewAll } = useHotelScope();
  const { data, loading, error } = useFinanceAnalytics();

  return (
    <PermissionGuard
      permission={[
        "finance.transactions",
        "finance.revenue",
        "finance.refunds",
        "payments.view",
      ]}
    >
      <PlatformModuleHeader
        badge="Super Admin · Platform"
        title="Finance"
        description={
          viewAll
            ? "Platform-wide transactions, revenue, refunds, and payment reconciliation."
            : "Financial view for your assigned property."
        }
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Collected</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {loading ? "…" : (data?.collected_display ?? "₹0.00")}
            </p>
            <p className="text-xs text-muted mt-1">
              {loading ? "" : `${data?.paid_bookings ?? 0} paid bookings`}
            </p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {loading ? "…" : (data?.pending_display ?? "₹0.00")}
            </p>
            <p className="text-xs text-muted mt-1">
              {loading ? "" : `${data?.unpaid_bookings ?? 0} awaiting payment`}
            </p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Refunds queue</p>
            <p className="mt-1 text-2xl font-bold text-charcoal">
              {loading ? "…" : (data?.refunds_queue ?? 0)}
            </p>
            <p className="text-xs text-muted mt-1">Refund pending approval</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Can permission={["finance.transactions", "payments.view"]}>
            <ModuleCard
              icon={IndianRupee}
              title="Transactions"
              description="UPI, card, and walk-in payment logs across properties"
            />
          </Can>
          <Can permission={["finance.revenue", "analytics.dashboard"]}>
            <ModuleCard
              icon={TrendingUp}
              title="Revenue reports"
              description="Daily revenue, donor savings, and occupancy-linked income"
            />
          </Can>
          <Can permission="finance.refunds">
            <ModuleCard
              icon={RefreshCw}
              title="Refunds"
              description="Approve and track booking and donation refunds"
            />
          </Can>
        </div>

        <Can permission="payments.view">
          <Link
            href="/platform/operations/payments"
            className="card-manager flex items-center gap-4 p-5 hover:border-champagne/40 transition-colors"
          >
            <CreditCard className="h-8 w-8 text-champagne shrink-0" />
            <div className="flex-1">
              <h2 className="font-bold text-charcoal">Payment operations</h2>
              <p className="text-sm text-muted mt-1">
                Open live payment list and booking settlement
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </Can>
      </div>
    </PermissionGuard>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof IndianRupee;
  title: string;
  description: string;
}) {
  return (
    <div className="card-manager p-5">
      <Icon className="h-7 w-7 text-champagne mb-3" />
      <h2 className="font-bold text-charcoal">{title}</h2>
      <p className="text-sm text-muted mt-1">{description}</p>
      <p className="text-[10px] text-muted mt-3">
        Figures from server-side analytics for your role scope.
      </p>
    </div>
  );
}
