import { apiFetch } from "@/lib/api/client";
import { buildAnalyticsQueryString } from "@/lib/booking-filters";
import type { BookingListQuery } from "@/lib/booking-filters";
import type { DailyRevenue } from "@/lib/types";
import { formatDate } from "@/lib/utils";

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

export type AnalyticsPeriod = {
  start: string;
  end: string;
};

export type DashboardCollectionsChart = {
  period: AnalyticsPeriod;
  revenue_chart: RevenueChartPoint[];
};

/** @deprecated Combined payload; prefer separate stats + collections endpoints. */
export type DashboardAnalytics = {
  period?: AnalyticsPeriod | null;
  stats: DashboardAnalyticsStats;
  revenue_chart: RevenueChartPoint[];
};

export type ReportsAnalytics = {
  period?: AnalyticsPeriod | null;
  coupon_redemptions: number;
  free_stays: number;
  total_discount_paise: number;
  total_discount_display: string;
  revenue_chart: RevenueChartPoint[];
};

export type FinanceAnalytics = {
  period?: AnalyticsPeriod | null;
  collected_paise: number;
  collected_display: string;
  paid_bookings: number;
  pending_paise: number;
  pending_display: string;
  unpaid_bookings: number;
  refunds_queue: number;
  discounts_paise: number;
  discounts_display: string;
  free_stays: number;
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

type AnalyticsQuery = Pick<BookingListQuery, "branchId" | "period" | "dateFrom" | "dateTo">;

function analyticsPath(path: string, query?: AnalyticsQuery): string {
  const qs = query ? buildAnalyticsQueryString(query) : "";
  return `${path}${qs}`;
}

/** Map API chart points to Recharts-friendly daily revenue rows (x-axis = calendar date). */
export function chartPointsToDailyRevenue(points: RevenueChartPoint[]): DailyRevenue[] {
  return points.map((p) => ({
    date: formatDate(p.date),
    revenue: p.revenue_rupees,
    donorSavings: p.donor_savings_rupees,
    bookings: p.bookings,
  }));
}

export async function fetchDashboardStats(
  accessToken: string,
  query: Pick<AnalyticsQuery, "branchId"> = {}
): Promise<DashboardAnalyticsStats> {
  return apiFetch<DashboardAnalyticsStats>(
    analyticsPath("staff/analytics/dashboard/", query),
    { method: "GET", accessToken }
  );
}

export async function fetchDashboardCollectionsChart(
  accessToken: string,
  query: AnalyticsQuery = { period: "7d" }
): Promise<DashboardCollectionsChart> {
  return apiFetch<DashboardCollectionsChart>(
    analyticsPath("staff/analytics/dashboard/collections/", {
      ...query,
      period: query.period ?? "7d",
    }),
    { method: "GET", accessToken }
  );
}

/** @deprecated Use fetchDashboardStats + fetchDashboardCollectionsChart. */
export async function fetchDashboardAnalytics(
  accessToken: string,
  query: AnalyticsQuery = { period: "7d" }
): Promise<DashboardAnalytics> {
  const [stats, chart] = await Promise.all([
    fetchDashboardStats(accessToken, query),
    fetchDashboardCollectionsChart(accessToken, query),
  ]);
  return { stats, period: chart.period, revenue_chart: chart.revenue_chart };
}

export async function fetchReportsAnalytics(
  accessToken: string,
  query: AnalyticsQuery = { period: "7d" }
): Promise<ReportsAnalytics> {
  return apiFetch<ReportsAnalytics>(
    analyticsPath("staff/analytics/reports/", {
      ...query,
      period: query.period ?? "7d",
    }),
    { method: "GET", accessToken }
  );
}

export async function fetchFinanceAnalytics(
  accessToken: string,
  query: AnalyticsQuery = { period: "30d" }
): Promise<FinanceAnalytics> {
  return apiFetch<FinanceAnalytics>(
    analyticsPath("staff/analytics/finance/", {
      ...query,
      period: query.period ?? "30d",
    }),
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
