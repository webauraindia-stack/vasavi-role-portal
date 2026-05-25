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
import { resolveAccessToken } from "@/lib/api/server-backend";
import {
  extendBookingStay,
  getBookingByReference,
  listBookings,
} from "@/lib/api/bookings";
import { listRoomInventory } from "@/lib/api/properties";
import { managerBookingToExtensionContext } from "@/lib/stay-extension/booking-context";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId") ?? undefined;
  return NextResponse.json({ data: listExtensions(hotelId) });
}

export async function POST(request: Request) {
  const token = await resolveAccessToken(request);

  try {
    const body = await request.json();
    const {
      bookingReference,
      requestedCheckOut,
      paymentMethod,
      selectedAlternativeRoomId,
      actorEmail = "guest@vasavi.local",
    } = body as {
      bookingReference: string;
      requestedCheckOut: string;
      paymentMethod?: "upi" | "card" | "netbanking";
      selectedAlternativeRoomId?: string;
      actorEmail?: string;
    };

    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    }

    const booking = await getBookingByReference(token, bookingReference);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const allBookings = await listBookings(token, booking.hotelId || undefined);
    const rooms = await listRoomInventory(
      token,
      allBookings,
      booking.hotelId || undefined
    );

    let roomNumber = booking.roomNumber;
    if (selectedAlternativeRoomId) {
      const alt = rooms.find((r) => r.id === selectedAlternativeRoomId);
      if (alt) roomNumber = alt.number;
    }

    const ctx = { ...managerBookingToExtensionContext(booking), roomNumber };
    const availability = checkRoomAvailabilityForExtension(
      ctx,
      requestedCheckOut,
      allBookings,
      rooms
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
      guestEmail: ctx.guestEmail,
      guestPhone: ctx.guestPhone,
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
        `email:${ctx.guestEmail}:extension_${status}`,
        `sms:${ctx.guestPhone}:extension_${status}`,
      ],
    });

    appendAudit(extension.id, "extension_created", actorEmail, "guest");
    appendAudit(extension.id, "availability_checked", "system", "system", {
      available: availability.available,
    });

    return NextResponse.json({ data: getExtension(extension.id) ?? extension }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const token = await resolveAccessToken(request);

  try {
    const body = await request.json();
    const { id, action, actor = "admin@vasavi.local", actorRole = "admin", ...rest } =
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
      if (token) {
        const booking = await getBookingByReference(token, updated.bookingReference);
        if (booking && updated.pricing) {
          updated.pricing = calculateExtensionPricing(
            managerBookingToExtensionContext(booking),
            updated.requestedCheckOut,
            waived
          );
        }
      }
      updated.adminNote = rest.adminNote;
      updated.status = "completed";
      if (token) {
        await applyExtensionToBackend(token, updated);
      }
      appendAudit(id, "waived_and_completed", actor, actorRole, { waived });
    } else if (action === "complete_payment") {
      const txn = rest.paymentTransactionId ?? `TXN-${Date.now()}`;
      updated.paymentTransactionId = txn;
      updated.status = "completed";
      if (token) {
        await applyExtensionToBackend(token, updated);
      }
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

    let bookingPayload = null;
    if (token) {
      bookingPayload = await getBookingByReference(token, updated.bookingReference);
    }

    return NextResponse.json({
      data: updated,
      booking: bookingPayload,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}

async function applyExtensionToBackend(
  token: string,
  ext: StayExtensionRequest
) {
  await extendBookingStay(
    token,
    ext.bookingId,
    ext.requestedCheckOut,
    ext.adminNote ?? "Stay extension applied from portal"
  );
}
