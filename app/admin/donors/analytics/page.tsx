"use client";

import { useEffect } from "react";
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
import { formatINR } from "@/lib/utils";
import { useDonorAnalytics, useAdminStore } from "@/stores/admin-store";
import { useAuthStore } from "@/stores/auth-store";

export default function DonorAnalyticsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const loadDonors = useAdminStore((s) => s.loadDonors);
  const a = useDonorAnalytics();

  useEffect(() => {
    if (accessToken) void loadDonors(accessToken);
  }, [accessToken, loadDonors]);

  return (
    <PermissionGuard permission="analytics.donations">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-admin">Donor analytics</h1>
          <p className="text-sm text-slate-500">
            Live totals from Django donors and donations APIs
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total donors", value: String(a.totalDonors) },
            { label: "Active", value: String(a.activeDonors) },
            { label: "Pending approval", value: String(a.pendingApproval) },
            { label: "Total contributions", value: formatINR(a.totalContributions) },
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
              {a.tierChart.length === 0 ? (
                <p className="text-sm text-muted">No donor data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={a.tierChart}>
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
            <h2 className="mb-4 font-semibold text-admin">Top contributors (profile totals)</h2>
            {a.topContributors.length === 0 ? (
              <p className="text-sm text-muted">No donors loaded.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {a.topContributors.map((t, i) => (
                  <li key={i} className="flex justify-between border-b border-slate-100 py-2">
                    <span>{t.name}</span>
                    <span className="font-semibold">{formatINR(t.amount)}</span>
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
