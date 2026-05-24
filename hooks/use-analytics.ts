"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardAnalytics,
  fetchDonorAnalytics,
  fetchFinanceAnalytics,
  fetchReportsAnalytics,
  type DashboardAnalytics,
  type DonorAnalytics,
  type FinanceAnalytics,
  type ReportsAnalytics,
} from "@/lib/api/analytics";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";

function branchParam(hotelId: string): string | undefined {
  return hotelId === "all" ? undefined : hotelId;
}

export function useDashboardAnalytics() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hotelId = useManagerStore((s) => s.hotelId);
  const [data, setData] = useState<DashboardAnalytics | null>(null);
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
      setData(await fetchDashboardAnalytics(accessToken, branchParam(hotelId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, hotelId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useReportsAnalytics() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hotelId = useManagerStore((s) => s.hotelId);
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
      setData(await fetchReportsAnalytics(accessToken, branchParam(hotelId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, hotelId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useFinanceAnalytics() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hotelId = useManagerStore((s) => s.hotelId);
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
      setData(await fetchFinanceAnalytics(accessToken, branchParam(hotelId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, hotelId]);

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
  DashboardAnalytics,
  ReportsAnalytics,
  FinanceAnalytics,
  DonorAnalytics,
};
