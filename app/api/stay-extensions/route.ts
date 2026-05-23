import { NextResponse } from "next/server";
import {
  calculateExtensionPricing,
  checkRoomAvailabilityForExtension,
  shouldAutoApprove,
} from "@/lib/stay-extension/engine";
import {
  createExtension,
  listExtensions,
  saveExtension,
  appendAudit,
  getExtension,
} from "@/lib/stay-extension/server-store";
import type { StayExtensionRequest } from "@/lib/stay-extension/types";
import { MOCK_BOOKINGS, MOCK_ROOMS } from "@/lib/data/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId") ?? undefined;
  return NextResponse.json({ data: listExtensions(hotelId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      bookingReference,
      requestedCheckOut,
      paymentMethod,
      selectedAlternativeRoomId,
      actorEmail = "guest@vasavi.example",
    } = body as {
      bookingReference: string;
      requestedCheckOut: string;
      paymentMethod?: "upi" | "card" | "netbanking";
      selectedAlternativeRoomId?: string;
      actorEmail?: string;
    };

    const booking = MOCK_BOOKINGS.find((b) => b.reference === bookingReference);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let roomNumber = booking.roomNumber;
    if (selectedAlternativeRoomId) {
      const alt = MOCK_ROOMS.find((r) => r.id === selectedAlternativeRoomId);
      if (alt) roomNumber = alt.number;
    }

    const ctx = { ...booking, roomNumber };
    const availability = checkRoomAvailabilityForExtension(
      ctx,
      requestedCheckOut,
      MOCK_BOOKINGS,
      MOCK_ROOMS
    );

    const pricing =
      availability.available || selectedAlternativeRoomId
        ? calculateExtensionPricing(ctx, requestedCheckOut)
        : undefined;

    let status: StayExtensionRequest["status"] = "draft";
    if (!availability.available && !selectedAlternativeRoomId) {
      status = availability.alternatives.length
        ? "alternative_offered"
        : "rejected";
    } else if (pricing && shouldAutoApprove(pricing)) {
      status = "pending_payment";
    } else if (pricing) {
      status = "pending_approval";
    }

    const extension = createExtension({
      bookingReference: booking.reference,
      bookingId: booking.id,
      hotelId: booking.hotelId,
      hotelName: booking.hotelName,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      roomNumber,
      roomType: booking.roomType,
      originalCheckOut: booking.checkOut,
      requestedCheckOut,
      status,
      availabilityStatus: availability.status,
      conflictReason: availability.conflictReason,
      pricing,
      alternativeRooms: availability.alternatives,
      selectedAlternativeRoomId,
      paymentMethod,
      approvalSource: pricing && shouldAutoApprove(pricing) ? "auto" : undefined,
      notificationsSent: [
        `email:${booking.guestEmail}:extension_${status}`,
        `sms:${booking.guestPhone}:extension_${status}`,
      ],
    });

    appendAudit(extension.id, "extension_created", actorEmail, "guest");
    appendAudit(extension.id, "availability_checked", "system", "system", {
      available: availability.available,
    });

    return NextResponse.json({ data: getExtension(extension.id) ?? extension }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, actor = "admin@vasavi.org", actorRole = "admin", ...rest } =
      body as {
        id: string;
        action:
          | "approve"
          | "reject"
          | "waive"
          | "complete_payment"
          | "suggest_alternative";
        actor?: string;
        actorRole?: string;
        rejectionReason?: string;
        waivedAmount?: number;
        adminNote?: string;
        paymentTransactionId?: string;
      };

    const existing = listExtensions().find((r) => r.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let updated: StayExtensionRequest = { ...existing };

    if (action === "approve") {
      updated.status = updated.pricing?.totalDue
        ? "pending_payment"
        : "completed";
      updated.approvalSource = actorRole === "super_admin" ? "super_admin" : "admin";
      updated.approvedBy = actor;
      appendAudit(id, "approved", actor, actorRole);
    } else if (action === "reject") {
      updated.status = "rejected";
      updated.rejectionReason = rest.rejectionReason ?? "Not approved by hotel";
      appendAudit(id, "rejected", actor, actorRole);
    } else if (action === "waive") {
      const waived = rest.waivedAmount ?? updated.pricing?.totalDue ?? 0;
      const booking = MOCK_BOOKINGS.find((b) => b.id === updated.bookingId);
      if (booking && updated.pricing) {
        updated.pricing = calculateExtensionPricing(
          booking,
          updated.requestedCheckOut,
          waived
        );
      }
      updated.adminNote = rest.adminNote;
      updated.status = "completed";
      applyExtensionToBooking(updated);
      appendAudit(id, "waived_and_completed", actor, actorRole, { waived });
    } else if (action === "complete_payment") {
      const txn = rest.paymentTransactionId ?? `TXN-${Date.now()}`;
      updated.paymentTransactionId = txn;
      updated.status = "completed";
      applyExtensionToBooking(updated);
      appendAudit(id, "payment_completed", actor, actorRole, { txn });
    } else if (action === "suggest_alternative") {
      updated.status = "alternative_offered";
      updated.adminNote = rest.adminNote ?? "Hotel suggested an alternative room";
      appendAudit(id, "alternative_suggested", actor, actorRole);
    }

    if (updated.status === "completed") {
      updated.notificationsSent = [
        ...updated.notificationsSent,
        `email:${updated.guestEmail}:extension_completed`,
        `whatsapp:${updated.guestPhone}:extension_completed`,
      ];
    } else {
      updated.notificationsSent = [
        ...updated.notificationsSent,
        `email:${updated.guestEmail}:status_${updated.status}`,
      ];
    }
    updated = saveExtension(updated);

    const bookingUpdate = MOCK_BOOKINGS.find((b) => b.id === updated.bookingId);

    return NextResponse.json({
      data: updated,
      booking: bookingUpdate,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function applyExtensionToBooking(ext: StayExtensionRequest) {
  const idx = MOCK_BOOKINGS.findIndex((b) => b.id === ext.bookingId);
  if (idx < 0) return;
  const b = MOCK_BOOKINGS[idx];
  const extra = ext.pricing?.totalDue ?? 0;
  MOCK_BOOKINGS[idx] = {
    ...b,
    checkOut: ext.requestedCheckOut,
    roomNumber: ext.roomNumber ?? b.roomNumber,
    nights: Math.max(
      1,
      Math.ceil(
        (new Date(ext.requestedCheckOut).getTime() - new Date(b.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    ),
    total: b.total + extra,
    paymentStatus: extra > 0 && b.paymentStatus === "paid" ? "partial" : b.paymentStatus,
  };
}
