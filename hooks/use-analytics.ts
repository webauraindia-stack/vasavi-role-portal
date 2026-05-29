"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardCollectionsChart,
  fetchDashboardStats,
  fetchDonorAnalytics,
  fetchFinanceAnalytics,
  fetchReportsAnalytics,
  type DashboardAnalyticsStats,
  type DashboardCollectionsChart,
  type DonorAnalytics,
  type FinanceAnalytics,
  type ReportsAnalytics,
} from "@/lib/api/analytics";
import type { BookingListQuery } from "@/lib/booking-filters";
import { branchIdForApi } from "@/lib/hotel-scope";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";

type AnalyticsPeriodQuery = Pick<BookingListQuery, "period" | "dateFrom" | "dateTo">;

/** Live dashboard stat cards (today, occupancy, rolling 7d) — no date filter. */
export function useDashboardStats() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hotelId = useManagerStore((s) => s.hotelId);
  const branchId = branchIdForApi(user, hotelId);
  const [data, setData] = useState<DashboardAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDashboardStats(accessToken, { branchId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard stats.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

/** Collections chart for the dashboard — period from API query params. */
export function useDashboardCollectionsChart(
  periodQuery: AnalyticsPeriodQuery = { period: "7d" }
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hotelId = useManagerStore((s) => s.hotelId);
  const branchId = branchIdForApi(user, hotelId);
  const [data, setData] = useState<DashboardCollectionsChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchDashboardCollectionsChart(accessToken, {
          branchId,
          ...periodQuery,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load collections chart.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId, periodQuery.period, periodQuery.dateFrom, periodQuery.dateTo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

/** @deprecated Use useDashboardStats + useDashboardCollectionsChart. */
export function useDashboardAnalytics(periodQuery: AnalyticsPeriodQuery = { period: "7d" }) {
  const stats = useDashboardStats();
  const chart = useDashboardCollectionsChart(periodQuery);
  return {
    data:
      stats.data && chart.data
        ? {
            stats: stats.data,
            period: chart.data.period,
            revenue_chart: chart.data.revenue_chart,
          }
        : null,
    loading: stats.loading || chart.loading,
    error: stats.error ?? chart.error,
    reload: async () => {
      await Promise.all([stats.reload(), chart.reload()]);
    },
  };
}

export function useReportsAnalytics(periodQuery: AnalyticsPeriodQuery = { period: "7d" }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hotelId = useManagerStore((s) => s.hotelId);
  const branchId = branchIdForApi(user, hotelId);
  const [data, setData] = useState<ReportsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchReportsAnalytics(accessToken, {
          branchId,
          ...periodQuery,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId, periodQuery.period, periodQuery.dateFrom, periodQuery.dateTo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useFinanceAnalytics(periodQuery: AnalyticsPeriodQuery = { period: "30d" }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hotelId = useManagerStore((s) => s.hotelId);
  const branchId = branchIdForApi(user, hotelId);
  const [data, setData] = useState<FinanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchFinanceAnalytics(accessToken, {
          branchId,
          ...periodQuery,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId, periodQuery.period, periodQuery.dateFrom, periodQuery.dateTo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useDonorAnalyticsApi() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<DonorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDonorAnalytics(accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load donor analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export type {
  DashboardAnalyticsStats,
  DashboardCollectionsChart,
  ReportsAnalytics,
  FinanceAnalytics,
  DonorAnalytics,
};
