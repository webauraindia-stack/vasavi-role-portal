"use client";

import { Input } from "@/components/ui/input";
import {
  PERIOD_PRESET_OPTIONS,
  type BookingListQuery,
  type BookingPeriodPreset,
} from "@/lib/booking-filters";
import { cn } from "@/lib/utils";

type PeriodFilterValue = Pick<BookingListQuery, "period" | "dateFrom" | "dateTo">;

export function PeriodFilter({
  value,
  onChange,
  className,
}: {
  value: PeriodFilterValue;
  onChange: (next: PeriodFilterValue) => void;
  className?: string;
}) {
  const period = value.period ?? "30d";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <select
        value={period}
        onChange={(e) =>
          onChange({
            ...value,
            period: e.target.value as BookingPeriodPreset,
          })
        }
        className="h-9 rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal"
        aria-label="Date range preset"
      >
        {PERIOD_PRESET_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {period === "custom" && (
        <>
          <Input
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
            className="h-9 w-[9.5rem] text-xs"
            aria-label="From date"
          />
          <span className="text-xs text-muted font-semibold">to</span>
          <Input
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
            className="h-9 w-[9.5rem] text-xs"
            aria-label="To date"
          />
        </>
      )}
    </div>
  );
}
