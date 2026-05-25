"use client";

import { PermissionGuard } from "@/components/rbac/permission-guard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDonorAnalyticsApi } from "@/hooks/use-analytics";

export default function DonorAnalyticsPage() {
  const { data, loading, error } = useDonorAnalyticsApi();

  const tierChart = (data?.tier_chart ?? []).map((row) => ({
    month: row.tier,
    amount: row.count,
  }));

  return (
    <PermissionGuard permission="analytics.donations">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-admin">Donor analytics</h1>
          <p className="text-sm text-slate-500">
            Aggregated from Django donors and donations (server-side)
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total donors", value: String(data?.total_donors ?? (loading ? "…" : 0)) },
            { label: "Active", value: String(data?.active_donors ?? (loading ? "…" : 0)) },
            {
              label: "Pending profile confirmation",
              value: String(data?.pending_approval ?? (loading ? "…" : 0)),
            },
            {
              label: "Total contributions",
              value: loading ? "…" : (data?.total_contributions_display ?? "₹0.00"),
            },
          ].map(({ label, value }) => (
            <div key={label} className="admin-card">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-admin">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="admin-card">
            <h2 className="mb-4 font-semibold text-admin">Donors by tier</h2>
            <div className="h-56">
              {loading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : tierChart.length === 0 ? (
                <p className="text-sm text-muted">No donor data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="admin-card">
            <h2 className="mb-4 font-semibold text-admin">Top contributors</h2>
            {loading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (data?.top_contributors.length ?? 0) === 0 ? (
              <p className="text-sm text-muted">No donors loaded.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data!.top_contributors.map((t) => (
                  <li
                    key={t.donor_id}
                    className="flex justify-between border-b border-slate-100 py-2"
                  >
                    <span>{t.name}</span>
                    <span className="font-semibold">{t.amount_display}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
