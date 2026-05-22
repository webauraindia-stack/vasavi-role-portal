import { NextResponse } from "next/server";
import {
  calculateExtensionPricing,
  checkRoomAvailabilityForExtension,
} from "@/lib/stay-extension/engine";
import { MOCK_BOOKINGS, MOCK_ROOMS } from "@/lib/data/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingReference = searchParams.get("bookingReference");
  const requestedCheckOut = searchParams.get("requestedCheckOut");

  if (!bookingReference || !requestedCheckOut) {
    return NextResponse.json(
      { error: "bookingReference and requestedCheckOut are required" },
      { status: 400 }
    );
  }

  const booking = MOCK_BOOKINGS.find((b) => b.reference === bookingReference);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const availability = checkRoomAvailabilityForExtension(
    booking,
    requestedCheckOut,
    MOCK_BOOKINGS,
    MOCK_ROOMS
  );
  const pricing =
    availability.available || availability.alternatives.length
      ? calculateExtensionPricing(booking, requestedCheckOut)
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
}
