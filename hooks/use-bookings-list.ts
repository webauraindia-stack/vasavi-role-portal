"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BOOKING_FILTERS,
  type BookingListQuery,
  type BookingListSummary,
} from "@/lib/booking-filters";
import { exportBookingsCsv, listBookingsFiltered } from "@/lib/api/bookings";
import type { ManagerBooking } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export function useBookingsList(branchId?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [filters, setFilters] = useState<BookingListQuery>({
    ...DEFAULT_BOOKING_FILTERS,
    branchId,
  });
  const [bookings, setBookings] = useState<ManagerBooking[]>([]);
  const [summary, setSummary] = useState<BookingListSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWith = useCallback(
    async (query: BookingListQuery) => {
      if (!accessToken) {
        setBookings([]);
        setSummary(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await listBookingsFiltered(accessToken, {
          ...query,
          branchId: branchId ?? query.branchId,
          includeSummary: true,
        });
        setBookings(result.bookings);
        setSummary(result.summary ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load bookings.");
        setBookings([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, branchId]
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, branchId }));
    void loadWith({ ...DEFAULT_BOOKING_FILTERS, branchId });
  }, [branchId, loadWith]);

  const applyFilters = useCallback(
    (next: BookingListQuery) => {
      const merged = { ...next, branchId: branchId ?? next.branchId };
      setFilters(merged);
      void loadWith(merged);
    },
    [branchId, loadWith]
  );

  const reload = useCallback(() => {
    void loadWith({ ...filters, branchId: branchId ?? filters.branchId });
  }, [filters, branchId, loadWith]);

  const handleExport = useCallback(async () => {
    if (!accessToken) return;
    await exportBookingsCsv(accessToken, {
      ...filters,
      branchId: branchId ?? filters.branchId,
    });
  }, [accessToken, filters, branchId]);

  return {
    bookings,
    summary,
    loading,
    error,
    filters,
    setFilters: applyFilters,
    reload,
    exportCsv: handleExport,
  };
}
