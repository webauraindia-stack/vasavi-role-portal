import type { StayExtensionRequest } from "./types";
import { auditEntry } from "./engine";
import type { ExtensionBookingContext } from "./types";

const globalStore = globalThis as unknown as {
  stayExtensions?: StayExtensionRequest[];
};

function getStore(): StayExtensionRequest[] {
  if (!globalStore.stayExtensions) {
    globalStore.stayExtensions = [];
  }
  return globalStore.stayExtensions;
}

function seedDemoExtensions(): StayExtensionRequest[] {
  const now = new Date().toISOString();
  return [
    {
      id: "ext-demo-001",
      bookingReference: "VH-4D6E8F",
      bookingId: "bk-005",
      hotelId: "1",
      hotelName: "Sri Vasavi Nityannadana Residency",
      guestName: "Priya Sharma",
      guestEmail: "priya@example.com",
      guestPhone: "+91 90123 45678",
      roomNumber: "101",
      roomType: "Standard Non-AC",
      originalCheckOut: "2026-05-23",
      requestedCheckOut: "2026-05-25",
      status: "pending_approval",
      availabilityStatus: "available",
      pricing: {
        extraNights: 2,
        nightlyRate: 2500,
        subtotal: 5000,
        tierDiscount: 500,
        taxes: 540,
        waivedAmount: 0,
        totalDue: 5040,
        currency: "INR",
      },
      notificationsSent: ["email:priya@example.com:extension_pending_approval"],
      auditLog: [
        {
          id: "audit-seed-1",
          action: "extension_created",
          actor: "priya@example.com",
          actorRole: "guest",
          at: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function listExtensions(hotelId?: string): StayExtensionRequest[] {
  const all = [...getStore()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  if (!hotelId || hotelId === "all") return all;
  return all.filter((r) => r.hotelId === hotelId);
}

export function getExtension(id: string): StayExtensionRequest | undefined {
  return getStore().find((r) => r.id === id);
}

export function saveExtension(
  request: StayExtensionRequest
): StayExtensionRequest {
  const store = getStore();
  const idx = store.findIndex((r) => r.id === request.id);
  const next = { ...request, updatedAt: new Date().toISOString() };
  if (idx >= 0) store[idx] = next;
  else store.unshift(next);
  return next;
}

export function createExtension(
  partial: Omit<StayExtensionRequest, "id" | "createdAt" | "updatedAt" | "auditLog"> & {
    auditLog?: StayExtensionRequest["auditLog"];
  }
): StayExtensionRequest {
  const now = new Date().toISOString();
  const request: StayExtensionRequest = {
    ...partial,
    id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    auditLog: partial.auditLog ?? [
      auditEntry("extension_created", partial.guestEmail, "guest"),
    ],
    notificationsSent: partial.notificationsSent ?? [],
    createdAt: now,
    updatedAt: now,
  };
  return saveExtension(request);
}

export function appendAudit(
  id: string,
  action: string,
  actor: string,
  actorRole: string,
  metadata?: Record<string, string | number | boolean>
): StayExtensionRequest | undefined {
  const existing = getExtension(id);
  if (!existing) return undefined;
  return saveExtension({
    ...existing,
    auditLog: [...existing.auditLog, auditEntry(action, actor, actorRole, metadata)],
  });
}

export function findByReference(reference: string): StayExtensionRequest[] {
  return getStore().filter((r) => r.bookingReference === reference);
}

export function bookingContextFromPartial(
  booking: ExtensionBookingContext
): ExtensionBookingContext {
  return booking;
}
