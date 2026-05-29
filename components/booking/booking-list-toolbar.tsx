"use client";

import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PeriodFilter } from "@/components/booking/period-filter";
import {
  BOOKING_STATUS_OPTIONS,
  type BookingListQuery,
  type BookingStatusFilter,
} from "@/lib/booking-filters";

export function BookingListToolbar({
  filters,
  onApply,
  onExport,
  loading,
}: {
  filters: BookingListQuery;
  onApply: (next: BookingListQuery) => void;
  onExport: () => void;
  loading?: boolean;
}) {
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  useEffect(() => {
    setSearchDraft(filters.q ?? "");
  }, [filters.q]);

  const commit = (patch: Partial<BookingListQuery>) => {
    onApply({ ...filters, ...patch, q: searchDraft });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit({});
              }}
              placeholder="Search guest, reference, room, phone…"
              className="pl-9 h-9"
            />
          </div>
          <PeriodFilter
            value={filters}
            onChange={(periodPart) => onApply({ ...filters, ...periodPart, q: searchDraft })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <select
            value={filters.status ?? "all"}
            onChange={(e) =>
              onApply({
                ...filters,
                status: e.target.value as BookingStatusFilter,
                q: searchDraft,
              })
            }
            className="col-span-2 h-9 w-full min-w-0 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal sm:col-span-1 sm:min-w-[10rem] sm:w-auto"
            aria-label="Booking status filter"
          >
            {BOOKING_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button type="button" size="sm" onClick={() => commit({})} disabled={loading}>
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onExport}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
