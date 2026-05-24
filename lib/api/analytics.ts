import { apiFetch } from "@/lib/api/client";
import type { DailyRevenue } from "@/lib/types";

export type RevenueChartPoint = {
  date: string;
  label: string;
  revenue_paise: number;
  revenue_rupees: number;
  donor_savings_paise: number;
  donor_savings_rupees: number;
  bookings: number;
};

export type DashboardAnalyticsStats = {
  today_revenue_paise: number;
  today_revenue_display: string;
  today_collected_bookings: number;
  revenue_7d_paise: number;
  revenue_7d_display: string;
  active_bookings: number;
  check_ins_today: number;
  donor_savings_paise: number;
  donor_savings_display: string;
  vip_arrivals: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_percent: number;
};

export type DashboardAnalytics = {
  stats: DashboardAnalyticsStats;
  revenue_chart: RevenueChartPoint[];
};

export type ReportsAnalytics = {
  coupon_redemptions: number;
  free_stays: number;
  total_discount_paise: number;
  total_discount_display: string;
  revenue_chart: RevenueChartPoint[];
};

export type FinanceAnalytics = {
  collected_paise: number;
  collected_display: string;
  paid_bookings: number;
  pending_paise: number;
  pending_display: string;
  unpaid_bookings: number;
  refunds_queue: number;
};

export type DonorAnalytics = {
  total_donors: number;
  active_donors: number;
  pending_approval: number;
  total_contributions_paise: number;
  total_contributions_display: string;
  tier_chart: { tier: string; count: number }[];
  top_contributors: {
    donor_id: string;
    name: string;
    amount_paise: number;
    amount_rupees: number;
    amount_display: string;
  }[];
};

function branchQuery(branchId?: string): string {
  if (!branchId || branchId === "all") return "";
  return `?branch_id=${encodeURIComponent(branchId)}`;
}

/** Map API chart points to Recharts-friendly daily revenue rows. */
export function chartPointsToDailyRevenue(points: RevenueChartPoint[]): DailyRevenue[] {
  return points.map((p) => ({
    date: p.label,
    revenue: p.revenue_rupees,
    donorSavings: p.donor_savings_rupees,
    bookings: p.bookings,
  }));
}

export async function fetchDashboardAnalytics(
  accessToken: string,
  branchId?: string
): Promise<DashboardAnalytics> {
  return apiFetch<DashboardAnalytics>(
    `staff/analytics/dashboard/${branchQuery(branchId)}`,
    { method: "GET", accessToken }
  );
}

export async function fetchReportsAnalytics(
  accessToken: string,
  branchId?: string
): Promise<ReportsAnalytics> {
  return apiFetch<ReportsAnalytics>(
    `staff/analytics/reports/${branchQuery(branchId)}`,
    { method: "GET", accessToken }
  );
}

export async function fetchFinanceAnalytics(
  accessToken: string,
  branchId?: string
): Promise<FinanceAnalytics> {
  return apiFetch<FinanceAnalytics>(
    `staff/analytics/finance/${branchQuery(branchId)}`,
    { method: "GET", accessToken }
  );
}

export async function fetchDonorAnalytics(
  accessToken: string
): Promise<DonorAnalytics> {
  return apiFetch<DonorAnalytics>("staff/analytics/donors/", {
    method: "GET",
    accessToken,
  });
}
