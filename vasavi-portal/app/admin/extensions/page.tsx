"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExtensionStore } from "@/stores/extension-store";
import { computeAnalytics } from "@/lib/stay-extension/engine";
import {
  cn,
  EXTENSION_STATUS_COLORS,
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";

export default function SuperAdminExtensionsPage() {
  const { requests, loading, fetchRequests } = useExtensionStore();
  const [hotelFilter, setHotelFilter] = useState("all");

  const load = useCallback(() => {
    void fetchRequests(hotelFilter === "all" ? undefined : hotelFilter);
  }, [fetchRequests, hotelFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const analytics = useMemo(() => computeAnalytics(requests), [requests]);
  const hotels = useMemo(
    () => [...new Map(requests.map((r) => [r.hotelId, r.hotelName])).entries()],
    [requests]
  );

  const auditEntries = useMemo(
    () =>
      requests
        .flatMap((r) =>
          r.auditLog.map((a) => ({
            ...a,
            reference: r.bookingReference,
            hotelName: r.hotelName,
            oldCheckOut: r.originalCheckOut,
            newCheckOut: r.requestedCheckOut,
            amount: r.pricing?.totalDue,
            txn: r.paymentTransactionId,
            approval: r.approvalSource,
          }))
        )
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [requests]
  );

  return (
    <PermissionGuard permission="audit.view">
      <PlatformModuleHeader
        badge="Super Admin · Platform"
        title="Stay extension analytics"
        description="Cross-hotel extension requests, approval rates, conflict failures, revenue impact, and audit logs."
      />
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All hotels</option>
            {hotels.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarClock}
            label="Total requests"
            value={String(analytics.totalRequests)}
            tone="text-charcoal"
          />
          <StatCard
            icon={CheckCircle2}
            label="Successful extensions"
            value={String(analytics.completed)}
            sub={`${analytics.approvalRate}% approval rate`}
            tone="text-emerald-800"
          />
          <StatCard
            icon={XCircle}
            label="Failed (room conflict)"
            value={String(analytics.failedConflict)}
            sub={`${analytics.rejected} total rejected`}
            tone="text-rose-800"
          />
          <StatCard
            icon={TrendingUp}
            label="Extension revenue"
            value={formatCurrency(analytics.additionalRevenue)}
            sub={`${analytics.pending} pending`}
            tone="text-champagne-dark"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card-manager p-4">
            <p className="text-xs font-bold uppercase text-muted flex items-center gap-1 mb-3">
              <BarChart3 className="h-3.5 w-3.5" />
              Performance by hotel
            </p>
            <div className="space-y-2">
              {analytics.byHotel.map((h) => (
                <div
                  key={h.hotelId}
                  className="flex items-center justify-between text-sm border-b border-beige/30 pb-2"
                >
                  <span className="font-medium">{h.hotelName}</span>
                  <span className="text-muted">
                    {h.count} req · {formatCurrency(h.revenue)}
                  </span>
                </div>
              ))}
              {analytics.byHotel.length === 0 && (
                <p className="text-sm text-muted">No data yet.</p>
              )}
            </div>
          </div>

          <div className="card-manager p-4">
            <p className="text-xs font-bold uppercase text-muted mb-3">Status breakdown</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.byStatus).map(([status, count]) => (
                <Badge key={status} className={EXTENSION_STATUS_COLORS[status] ?? ""}>
                  {status.replace(/_/g, " ")}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="card-manager overflow-hidden">
          <div className="border-b border-beige/40 px-4 py-3 text-xs font-bold uppercase text-muted">
            All extension requests
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige/30 text-left text-xs text-muted">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Hotel</th>
                  <th className="p-3">Guest</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-beige/20">
                    <td className="p-3 font-mono text-xs">{r.bookingReference}</td>
                    <td className="p-3">{r.hotelName}</td>
                    <td className="p-3">{r.guestName}</td>
                    <td className="p-3 text-xs">
                      {r.originalCheckOut} → {r.requestedCheckOut}
                    </td>
                    <td className="p-3 font-mono">
                      {r.pricing ? formatCurrency(r.pricing.totalDue) : "—"}
                    </td>
                    <td className="p-3">
                      <Badge className={EXTENSION_STATUS_COLORS[r.status] ?? ""}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-manager overflow-hidden">
          <div className="border-b border-beige/40 px-4 py-3 text-xs font-bold uppercase text-muted">
            Audit trail (platform-wide)
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-beige/20 text-xs">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 grid gap-1 sm:grid-cols-4">
                <div>
                  <p className="font-bold text-charcoal">{entry.action}</p>
                  <p className="text-muted">{entry.reference}</p>
                </div>
                <div className="text-muted">
                  {entry.actor} ({entry.actorRole})
                  <br />
                  {entry.hotelName}
                </div>
                <div className="text-muted">
                  {entry.oldCheckOut} → {entry.newCheckOut}
                  {entry.amount != null && (
                    <>
                      <br />
                      {formatCurrency(entry.amount)}
                    </>
                  )}
                </div>
                <div className="text-muted sm:text-right">
                  {formatDateTime(entry.at)}
                  {entry.txn && (
                    <>
                      <br />
                      TXN: {entry.txn}
                    </>
                  )}
                  {entry.approval && (
                    <>
                      <br />
                      via {entry.approval}
                    </>
                  )}
                </div>
              </div>
            ))}
            {auditEntries.length === 0 && (
              <p className="p-6 text-muted">No audit entries yet.</p>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone: string;
}) {
  return (
    <div className="card-manager p-4">
      <p className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold", tone)}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}
