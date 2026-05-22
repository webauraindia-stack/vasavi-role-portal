"use client";

import { useMemo } from "react";
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
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { formatINR } from "@/lib/utils";

export default function FinanceAdminPage() {
  const { hotelId, viewAll } = useHotelScope();
  const bookings = useManagerStore((s) => s.bookings);
  const scoped = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [hotelId, bookings]
  );

  const paid = scoped.filter((b) => b.paymentStatus === "paid");
  const pending = scoped.filter((b) => b.paymentStatus === "pending");
  const totalRevenue = paid.reduce((s, b) => s + b.total, 0);
  const pendingAmount = pending.reduce((s, b) => s + b.total, 0);

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
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Collected (demo)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {formatINR(totalRevenue)}
            </p>
            <p className="text-xs text-muted mt-1">{paid.length} paid bookings</p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {formatINR(pendingAmount)}
            </p>
            <p className="text-xs text-muted mt-1">{pending.length} awaiting payment</p>
          </div>
          <div className="card-manager p-4">
            <p className="text-[10px] font-bold uppercase text-muted">Refunds queue</p>
            <p className="mt-1 text-2xl font-bold text-charcoal">0</p>
            <p className="text-xs text-muted mt-1">Connect refund workflow in production</p>
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
            href="/dashboard/payments"
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
      <p className="text-[10px] text-muted mt-3">Demo — API integration pending</p>
    </div>
  );
}
