import type { GuestCount } from "@/types";

/** Parse yyyy-MM-dd without timezone shift */
export function parseSearchDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseGuestParams(params: {
  adults?: string | null;
  children?: string | null;
  rooms?: string | null;
}): Partial<GuestCount> {
  const adults = params.adults ? Number(params.adults) : undefined;
  const children = params.children ? Number(params.children) : undefined;
  const rooms = params.rooms ? Number(params.rooms) : undefined;

  return {
    ...(adults !== undefined && !Number.isNaN(adults) && adults >= 1
      ? { adults }
      : {}),
    ...(children !== undefined && !Number.isNaN(children) && children >= 0
      ? { children }
      : {}),
    ...(rooms !== undefined && !Number.isNaN(rooms) && rooms >= 1 ? { rooms } : {}),
  };
}
