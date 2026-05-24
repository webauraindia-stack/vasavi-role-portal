import { NextResponse } from "next/server";
import {
  calculateExtensionPricing,
  checkRoomAvailabilityForExtension,
} from "@/lib/stay-extension/engine";
import { resolveAccessToken } from "@/lib/api/server-backend";
import { getBookingByReference, listBookings } from "@/lib/api/bookings";
import { listRoomInventory } from "@/lib/api/properties";
import { managerBookingToExtensionContext } from "@/lib/stay-extension/booking-context";

export async function GET(request: Request) {
  const token = await resolveAccessToken(request);
  if (!token) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookingReference = searchParams.get("bookingReference");
  const requestedCheckOut = searchParams.get("requestedCheckOut");

  if (!bookingReference || !requestedCheckOut) {
    return NextResponse.json(
      { error: "bookingReference and requestedCheckOut are required" },
      { status: 400 }
    );
  }

  try {
    const booking = await getBookingByReference(token, bookingReference);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const allBookings = await listBookings(token);
    const rooms = await listRoomInventory(token, allBookings);

    const extensionBooking = managerBookingToExtensionContext(booking);

    const availability = checkRoomAvailabilityForExtension(
      extensionBooking,
      requestedCheckOut,
      allBookings,
      rooms
    );
    const pricing =
      availability.available || availability.alternatives.length
        ? calculateExtensionPricing(extensionBooking, requestedCheckOut)
        : null;

    return NextResponse.json({
      data: {
        available: availability.available,
        status: availability.status,
        conflictReason: availability.conflictReason,
        alternatives: availability.alternatives,
        pricing,
        originalCheckOut: booking.checkOut,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Availability check failed" },
      { status: 500 }
    );
  }
}
