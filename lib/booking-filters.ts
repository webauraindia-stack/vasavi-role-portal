/** Booking list / analytics filter types — values sent as API query params. */

export type BookingPeriodPreset = "7d" | "30d" | "all" | "custom";

export type BookingStatusFilter =
  | "all"
  | "in_house"
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out";

export type BookingListQuery = {
  branchId?: string;
  status?: BookingStatusFilter;
  period?: BookingPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  includeSummary?: boolean;
};

export type BookingListSummary = {
  total: number;
  in_house: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  checked_out: number;
};

export const BOOKING_STATUS_OPTIONS: { value: BookingStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_house", label: "In-house" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "checked_in", label: "Checked in" },
  { value: "checked_out", label: "Departed" },
];

export const PERIOD_PRESET_OPTIONS: { value: BookingPeriodPreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

export const DEFAULT_BOOKING_FILTERS: BookingListQuery = {
  status: "all",
  period: "30d",
};

export function buildBookingQueryString(query: BookingListQuery): string {
  const params = new URLSearchParams();

  if (query.branchId) {
    params.set("branch_id", query.branchId);
  }

  const status = query.status ?? "all";
  if (status === "in_house") {
    params.set("in_house", "true");
  } else if (status !== "all") {
    params.set("status", status);
  }

  const period = query.period ?? "30d";
  if (period === "custom") {
    if (query.dateFrom) params.set("date_from", query.dateFrom);
    if (query.dateTo) params.set("date_to", query.dateTo);
  } else if (period !== "all") {
    params.set("period", period);
  }

  if (query.q?.trim()) {
    params.set("q", query.q.trim());
  }

  if (query.includeSummary) {
    params.set("include_summary", "true");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function buildAnalyticsQueryString(query: Pick<BookingListQuery, "branchId" | "period" | "dateFrom" | "dateTo">): string {
  const params = new URLSearchParams();
  if (query.branchId) params.set("branch_id", query.branchId);
  const period = query.period ?? "7d";
  if (period === "custom") {
    if (query.dateFrom) params.set("date_from", query.dateFrom);
    if (query.dateTo) params.set("date_to", query.dateTo);
  } else if (period !== "all") {
    params.set("period", period);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
