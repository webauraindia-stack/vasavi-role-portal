"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useDonorAnalytics } from "@/stores/admin-store";

export default function DonorAnalyticsPage() {
  const a = useDonorAnalytics();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin">Donor analytics</h1>
          <p className="text-sm text-slate-500">
            Contributions, utilization, hotel-wise stays, downloadable reports
          </p>
        </div>
        <button type="button" className="btn-outline flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export report (demo)
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total donors", value: String(a.totalDonors) },
          { label: "Active", value: String(a.activeDonors) },
          { label: "Pending approval", value: String(a.pendingApproval) },
          { label: "Total contributions", value: formatINR(a.totalContributions) },
          { label: "Active benefits", value: String(a.activeBenefits) },
          { label: "Expired benefits", value: String(a.expiredBenefits) },
          { label: "Utilization rate", value: `${a.utilizationRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="admin-card">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-admin">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-admin">Monthly contributions</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.monthlyContributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="amount" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="admin-card">
          <h2 className="mb-4 font-semibold text-admin">Top contributors</h2>
          <ul className="space-y-2 text-sm">
            {a.topContributors.map((t, i) => (
              <li key={i} className="flex justify-between border-b border-slate-100 py-2">
                <span>{t.name}</span>
                <span className="font-semibold">{formatINR(t.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card lg:col-span-2">
          <h2 className="mb-4 font-semibold text-admin">Hotel-wise donor stays</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Hotel</th>
                <th>Stays</th>
                <th>Benefit savings</th>
              </tr>
            </thead>
            <tbody>
              {a.hotelWiseStays.map((h) => (
                <tr key={h.hotel} className="border-t border-slate-100">
                  <td className="py-2">{h.hotel}</td>
                  <td>{h.stays}</td>
                  <td className="font-semibold text-emerald-700">{formatINR(h.savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
