import { addDays, isBefore, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

/** Start of today — use for DayPicker `disabled.before` (avoids time-of-day quirks). */
export function todayStart(): Date {
  return startOfDay(new Date());
}

/**
 * RDP v9 (min=0) sets from and to to the same day on the first click.
 * Treat that as check-in only; range is complete only when checkout is a later day.
 */
export function normalizeRangeSelection(selected: DateRange | undefined): {
  range: DateRange | undefined;
  complete: boolean;
} {
  if (!selected?.from) {
    return { range: selected, complete: false };
  }

  const from = selected.from;
  const to = selected.to;

  if (!to || startOfDay(to).getTime() === startOfDay(from).getTime()) {
    return { range: { from, to: undefined }, complete: false };
  }

  let checkOut = to;
  if (isBefore(startOfDay(checkOut), startOfDay(from))) {
    checkOut = addDays(from, 1);
  }

  return { range: { from, to: checkOut }, complete: true };
}

/** Ensure URL / stored dates always span at least one night. */
export function normalizeStayDates(
  checkIn: Date,
  checkOut: Date | null | undefined
): { checkIn: Date; checkOut: Date } {
  let out = checkOut ?? checkIn;
  if (
    isBefore(startOfDay(out), startOfDay(checkIn)) ||
    startOfDay(out).getTime() === startOfDay(checkIn).getTime()
  ) {
    out = addDays(checkIn, 1);
  }
  return { checkIn, checkOut: out };
}
