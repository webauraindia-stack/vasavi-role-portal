import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";
import type {
  AlternativeRoomOffer,
  ExtensionBookingContext,
  ExtensionPricing,
  ExtensionRoomContext,
  StayExtensionAuditEntry,
  StayExtensionRequest,
} from "./types";
import type { ManagerBooking } from "@/lib/types";

const TAX_RATE = 0.12;
const AUTO_APPROVE_MAX = 15000;

export function canExtendBooking(booking: ExtensionBookingContext): boolean {
  return (
    booking.bookingStatus === "confirmed" ||
    booking.bookingStatus === "checked_in"
  );
}

export function nightlyRateFromBooking(booking: ExtensionBookingContext): number {
  if (booking.nights <= 0) return booking.subtotal;
  return Math.round(booking.subtotal / booking.nights);
}

export function checkRoomAvailabilityForExtension(
  booking: ExtensionBookingContext,
  newCheckOut: string,
  allBookings: ManagerBooking[],
  rooms: ExtensionRoomContext[]
): {
  available: boolean;
  status: StayExtensionRequest["availabilityStatus"];
  conflictReason?: string;
  alternatives: AlternativeRoomOffer[];
} {
  const roomNumber = booking.roomNumber;
  const room = rooms.find(
    (r) => r.hotelId === booking.hotelId && r.number === roomNumber
  );

  if (room?.status === "maintenance" || room?.status === "blocked") {
    return {
      available: false,
      status: "maintenance",
      conflictReason: `Room ${roomNumber} is ${room.status} during the extension period.`,
      alternatives: findAlternativeRooms(booking, newCheckOut, allBookings, rooms),
    };
  }

  const extensionStart = parseISO(booking.checkOut);
  const extensionEnd = parseISO(newCheckOut);
  if (extensionEnd <= extensionStart) {
    return {
      available: false,
      status: "conflict",
      conflictReason: "New checkout must be after your current checkout date.",
      alternatives: [],
    };
  }

  const extensionDays = eachDayOfInterval({
    start: extensionStart,
    end: extensionEnd,
  }).slice(1);

  const conflicts = allBookings.filter((b) => {
    if (b.id === booking.id || b.hotelId !== booking.hotelId) return false;
    if (b.roomNumber !== roomNumber) return false;
    if (b.bookingStatus === "cancelled" || b.bookingStatus === "checked_out") {
      return false;
    }
    const bIn = parseISO(b.checkIn);
    const bOut = parseISO(b.checkOut);
    return extensionDays.some((day) => day >= bIn && day < bOut);
  });

  if (conflicts.length > 0) {
    const ref = conflicts[0]?.reference ?? "another guest";
    return {
      available: false,
      status: "conflict",
      conflictReason: `Room ${roomNumber} is reserved (${ref}) during your requested extension dates.`,
      alternatives: findAlternativeRooms(booking, newCheckOut, allBookings, rooms),
    };
  }

  return { available: true, status: "available", alternatives: [] };
}

function findAlternativeRooms(
  booking: ExtensionBookingContext,
  newCheckOut: string,
  allBookings: ManagerBooking[],
  rooms: ExtensionRoomContext[]
): AlternativeRoomOffer[] {
  const nightly = nightlyRateFromBooking(booking);
  const categoryRank: Record<string, number> = {
    Standard: 1,
    Deluxe: 2,
    Suite: 3,
    Penthouse: 4,
  };
  const minRank = categoryRank[booking.roomType.split(" ")[0] ?? "Standard"] ?? 1;

  return rooms
    .filter((r) => r.hotelId === booking.hotelId && r.number !== booking.roomNumber)
    .filter((r) => r.status === "available")
    .filter((r) => (categoryRank[r.category] ?? 1) >= minRank)
    .map((r) => {
      const altBooking = { ...booking, roomNumber: r.number };
      const check = checkRoomAvailabilityForExtension(
        altBooking,
        newCheckOut,
        allBookings,
        rooms
      );
      const altNightly = nightly + (r.category === "Suite" ? 800 : r.category === "Deluxe" ? 400 : 0);
      return {
        roomId: r.id,
        roomNumber: r.number,
        roomName: r.name,
        category: r.category,
        priceDifference: Math.max(0, (altNightly - nightly) * differenceInCalendarDays(parseISO(newCheckOut), parseISO(booking.checkOut))),
        available: check.available,
      };
    })
    .filter((a) => a.available)
    .slice(0, 3);
}

export function calculateExtensionPricing(
  booking: ExtensionBookingContext,
  newCheckOut: string,
  waivedAmount = 0
): ExtensionPricing {
  const extraNights = Math.max(
    0,
    differenceInCalendarDays(parseISO(newCheckOut), parseISO(booking.checkOut))
  );
  const nightlyRate = nightlyRateFromBooking(booking);
  const subtotal = nightlyRate * extraNights;
  const tierDiscount = Math.round(subtotal * 0.1);
  const taxable = subtotal - tierDiscount - waivedAmount;
  const taxes = Math.round(Math.max(0, taxable) * TAX_RATE);
  const totalDue = Math.max(0, taxable + taxes);

  return {
    extraNights,
    nightlyRate,
    subtotal,
    tierDiscount,
    taxes,
    waivedAmount,
    totalDue,
    currency: "INR",
  };
}

export function shouldAutoApprove(pricing: ExtensionPricing): boolean {
  return pricing.totalDue <= AUTO_APPROVE_MAX;
}

export function auditEntry(
  action: string,
  actor: string,
  actorRole: string,
  metadata?: Record<string, string | number | boolean>
): StayExtensionAuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    actor,
    actorRole,
    at: new Date().toISOString(),
    metadata,
  };
}

export function buildExtensionRequest(
  booking: ExtensionBookingContext,
  newCheckOut: string,
  actor: string
): Omit<StayExtensionRequest, "id" | "createdAt" | "updatedAt"> {
  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
  return {
    bookingReference: booking.reference,
    bookingId: booking.id,
    hotelId: booking.hotelId,
    hotelName: booking.hotelName,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    roomNumber: booking.roomNumber,
    roomType: booking.roomType,
    originalCheckOut: booking.checkOut,
    requestedCheckOut: newCheckOut,
    status: "draft",
    availabilityStatus: "unknown",
    notificationsSent: [],
    auditLog: [
      auditEntry("extension_initiated", actor, "guest", {
        newCheckOut,
      }),
    ],
    createdAt: now,
    updatedAt: now,
  } as Omit<StayExtensionRequest, "id" | "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };
}

export function computeAnalytics(
  requests: StayExtensionRequest[]
): import("./types").ExtensionAnalytics {
  const completed = requests.filter((r) => r.status === "completed");
  const rejected = requests.filter((r) => r.status === "rejected");
  const pending = requests.filter((r) =>
    ["pending_approval", "pending_payment", "alternative_offered"].includes(r.status)
  );
  const failedConflict = requests.filter(
    (r) => r.status === "rejected" && r.availabilityStatus === "conflict"
  );

  const revenue = completed.reduce((s, r) => s + (r.pricing?.totalDue ?? 0), 0);
  const hotelMap = new Map<string, { hotelName: string; count: number; revenue: number }>();

  for (const r of requests) {
    const cur = hotelMap.get(r.hotelId) ?? {
      hotelName: r.hotelName,
      count: 0,
      revenue: 0,
    };
    cur.count += 1;
    if (r.status === "completed") cur.revenue += r.pricing?.totalDue ?? 0;
    hotelMap.set(r.hotelId, cur);
  }

  const total = requests.length;
  return {
    totalRequests: total,
    completed: completed.length,
    pending: pending.length,
    rejected: rejected.length,
    failedConflict: failedConflict.length,
    additionalRevenue: revenue,
    approvalRate: total ? Math.round((completed.length / total) * 100) : 0,
    byHotel: [...hotelMap.entries()].map(([hotelId, v]) => ({
      hotelId,
      hotelName: v.hotelName,
      count: v.count,
      revenue: v.revenue,
    })),
    byStatus: requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
