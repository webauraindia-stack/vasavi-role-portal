"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import { DayPicker, type DateRange } from "react-day-picker";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { normalizeRangeSelection, todayStart } from "@/lib/date-range-selection";
import { cn } from "@/lib/utils";

export interface DateRangePickerFieldProps {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined, complete: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerClassName?: string;
  numberOfMonths?: number;
  align?: "start" | "center" | "end";
}

export function DateRangePickerField({
  range,
  onRangeChange,
  open,
  onOpenChange,
  triggerClassName,
  numberOfMonths = 1,
  align = "start",
}: DateRangePickerFieldProps) {
  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : range?.from
        ? `${format(range.from, "MMM d")} – Checkout`
        : "Check-in / Check-out";

  const handleSelect = useCallback(
    (selected: DateRange | undefined) => {
      const { range: next, complete } = normalizeRangeSelection(selected);
      onRangeChange(next, complete);
    },
    [onRangeChange]
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(triggerClassName)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Select check-in and check-out dates"
        >
          <Calendar className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
          <span className="truncate text-left flex-1">{dateLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[400] w-auto max-w-[calc(100vw-2rem)] p-4 border-charcoal/10 shadow-warm-lg"
        align={align}
        sideOffset={8}
        collisionPadding={16}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={{ before: todayStart() }}
          numberOfMonths={numberOfMonths}
          defaultMonth={range?.from ?? todayStart()}
          className="rdp-root mx-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
