import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ManagerBooking,
  ManagerNotification,
  RoomInventory,
} from "@/lib/types";
import {
  buildManualBooking,
  shouldMarkRoomOccupied,
  type ManualBookingInput,
} from "@/lib/booking/manual-booking";
import {
  DEFAULT_HOTEL_ID,
  INCOMING_BOOKING_TEMPLATE,
  MANAGER_HOTELS,
  MOCK_ACTIVITIES,
  MOCK_BOOKINGS,
  MOCK_DONORS,
  MOCK_MEMBERS,
  MOCK_NOTIFICATIONS,
  MOCK_REVENUE,
  MOCK_ROOMS,
  MOCK_TICKETS,
} from "@/lib/data/mock-data";

interface ManagerState {
  hotelId: string;
  managerName: string;
  bookings: ManagerBooking[];
  rooms: RoomInventory[];
  notifications: ManagerNotification[];
  liveFeedEnabled: boolean;

  setHotelId: (id: string) => void;
  updateBookingStatus: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  assignRoom: (bookingId: string, roomNumber: string) => void;
  setRoomStatus: (roomId: string, status: RoomInventory["status"], meta?: Partial<RoomInventory>) => void;
  extendRoomHold: (roomId: string, untilDate: string) => void;
  extendRoomStay: (roomId: string, newCheckOut: string) => void;
  applyStayExtension: (payload: {
    bookingId: string;
    newCheckOut: string;
    roomNumber?: string;
    extraAmount?: number;
    guestName: string;
    reference: string;
    hotelId: string;
  }) => void;
  pushExtensionNotification: (payload: {
    hotelId: string;
    guestName: string;
    reference: string;
    status: string;
  }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  simulateIncomingBooking: () => void;
  createManualBooking: (
    input: ManualBookingInput
  ) => { success: boolean; error?: string; booking?: ManagerBooking };
  toggleLiveFeed: () => void;
}

let liveInterval: ReturnType<typeof setInterval> | null = null;

export const useManagerStore = create<ManagerState>()(
  persist(
    (set, get) => ({
      hotelId: DEFAULT_HOTEL_ID,
      managerName: "Ramesh Kumar",
      bookings: MOCK_BOOKINGS,
      rooms: MOCK_ROOMS,
      notifications: MOCK_NOTIFICATIONS,
      liveFeedEnabled: false,

      setHotelId: (hotelId) => set({ hotelId }),

      updateBookingStatus: (id, bookingStatus) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, bookingStatus } : b
          ),
        }),

      assignRoom: (bookingId, roomNumber) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === bookingId ? { ...b, roomNumber } : b
          ),
        }),

      setRoomStatus: (roomId, status, meta) =>
        set({
          rooms: get().rooms.map((r) => {
            if (r.id !== roomId) return r;
            const next = { ...r, status, ...meta };
            if (status === "available") {
              delete next.blockedReason;
              delete next.blockedUntil;
              delete next.maintenanceUntil;
            }
            if (status === "blocked" && !next.blockedUntil) {
              const d = new Date();
              d.setDate(d.getDate() + 3);
              next.blockedUntil = d.toISOString().slice(0, 10);
            }
            if (status === "maintenance" && !next.maintenanceUntil) {
              const d = new Date();
              d.setDate(d.getDate() + 7);
              next.maintenanceUntil = d.toISOString().slice(0, 10);
            }
            return next;
          }),
        }),

      extendRoomHold: (roomId, untilDate) =>
        set({
          rooms: get().rooms.map((r) => {
            if (r.id !== roomId) return r;
            if (r.status === "maintenance") {
              return { ...r, maintenanceUntil: untilDate };
            }
            if (r.status === "blocked") {
              return { ...r, blockedUntil: untilDate };
            }
            return r;
          }),
        }),

      extendRoomStay: (roomId, newCheckOut) =>
        set({
          bookings: get().bookings.map((b) => {
            const room = get().rooms.find((r) => r.id === roomId);
            if (!room || b.roomNumber !== room.number || b.hotelId !== room.hotelId) {
              return b;
            }
            if (b.bookingStatus !== "checked_in" && b.bookingStatus !== "confirmed") {
              return b;
            }
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(newCheckOut);
            const nights = Math.max(
              1,
              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            );
            return { ...b, checkOut: newCheckOut, nights };
          }),
        }),

      applyStayExtension: ({
        bookingId,
        newCheckOut,
        roomNumber,
        extraAmount = 0,
        guestName,
        reference,
        hotelId,
      }) =>
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== bookingId) return b;
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(newCheckOut);
            const nights = Math.max(
              1,
              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            );
            return {
              ...b,
              checkOut: newCheckOut,
              roomNumber: roomNumber ?? b.roomNumber,
              nights,
              total: b.total + extraAmount,
              paymentStatus:
                extraAmount > 0 && b.paymentStatus === "paid" ? "partial" : b.paymentStatus,
            };
          }),
          notifications: [
            {
              id: `n-ext-${Date.now()}`,
              type: "stay_extension",
              title: "Stay extension completed",
              message: `${guestName} (${reference}) checkout updated to ${newCheckOut}.`,
              time: new Date().toISOString(),
              read: false,
              priority: "medium",
              hotelId,
            },
            ...get().notifications,
          ],
        }),

      pushExtensionNotification: ({ hotelId, guestName, reference, status }) =>
        set({
          notifications: [
            {
              id: `n-ext-req-${Date.now()}`,
              type: "stay_extension",
              title: "Stay extension request",
              message: `${guestName} (${reference}) — status: ${status.replace(/_/g, " ")}`,
              time: new Date().toISOString(),
              read: false,
              priority: status.includes("pending") ? "high" : "medium",
              hotelId,
            },
            ...get().notifications,
          ],
        }),

      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }),

      markAllNotificationsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        }),

      simulateIncomingBooking: () => {
        const { hotelId } = get();
        const effectiveId = hotelId === "all" ? DEFAULT_HOTEL_ID : hotelId;
        const property = MANAGER_HOTELS.find((h) => h.id === effectiveId) ?? MANAGER_HOTELS[0];
        const ref = `VH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        const booking: ManagerBooking = {
          ...INCOMING_BOOKING_TEMPLATE,
          id: `bk-live-${Date.now()}`,
          reference: ref,
          qrCode: ref,
          hotelId: property.id,
          hotelName: property.name,
          createdAt: new Date().toISOString(),
        };
        const notification: ManagerNotification = {
          id: `n-live-${Date.now()}`,
          type: "new_booking",
          title: "Live booking from website",
          message: `${booking.guestName} — ${booking.roomType}, ${booking.nights} night(s).`,
          time: new Date().toISOString(),
          read: false,
          priority: "high",
          hotelId: property.id,
        };
        set({
          bookings: [booking, ...get().bookings],
          notifications: [notification, ...get().notifications],
        });
      },

      createManualBooking: (input) => {
        const room = get().rooms.find((r) => r.id === input.roomId);
        if (!room) {
          return { success: false, error: "Selected room not found." };
        }

        const { booking, error } = buildManualBooking(input, room, get().bookings);
        if (!booking || error) {
          return { success: false, error: error ?? "Could not create booking." };
        }

        const notification: ManagerNotification = {
          id: `n-manual-${Date.now()}`,
          type: "new_booking",
          title: input.source === "phone" ? "Phone booking created" : "Walk-in booking created",
          message: `${booking.guestName} — Room ${room.number}, ${booking.nights} night(s). Ref ${booking.reference}.`,
          time: new Date().toISOString(),
          read: false,
          priority: "high",
          hotelId: input.hotelId,
        };

        const markOccupied = shouldMarkRoomOccupied(booking.bookingStatus, booking.checkIn);

        set({
          bookings: [booking, ...get().bookings],
          notifications: [notification, ...get().notifications],
          rooms: markOccupied
            ? get().rooms.map((r) =>
                r.id === room.id ? { ...r, status: "occupied" as const } : r
              )
            : get().rooms,
        });

        return { success: true, booking };
      },

      toggleLiveFeed: () => {
        const next = !get().liveFeedEnabled;
        set({ liveFeedEnabled: next });
        if (liveInterval) {
          clearInterval(liveInterval);
          liveInterval = null;
        }
        if (next && typeof window !== "undefined") {
          liveInterval = setInterval(() => {
            if (Math.random() > 0.7) get().simulateIncomingBooking();
          }, 45000);
        }
      },
    }),
    { name: "vasavi-manager-data", partialize: (s) => ({ hotelId: s.hotelId }) }
  )
);

/** Hotel managers see only donors with bookings or history at their property */
export function getStoreDonors(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return MOCK_DONORS;

  const hotelBookings = bookings.filter((b) => b.hotelId === hotelId);
  const refsAtHotel = new Set(hotelBookings.map((b) => b.reference));
  const memberIdsAtHotel = new Set(
    hotelBookings.filter((b) => b.memberId).map((b) => b.memberId!)
  );

  return MOCK_DONORS.filter(
    (d) =>
      memberIdsAtHotel.has(d.donorId) ||
      d.hotelBookingHistory.some((h) => refsAtHotel.has(h.bookingRef)) ||
      (d.hotelId === hotelId && d.hotelBookingHistory.length > 0)
  ).map((d) => ({
    ...d,
    hotelBookingHistory: d.hotelBookingHistory.filter((h) =>
      refsAtHotel.has(h.bookingRef)
    ),
    usageHistory: d.usageHistory.filter((u) => refsAtHotel.has(u.bookingRef)),
  }));
}

export function getStoreBookings(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return bookings;
  return bookings.filter((b) => b.hotelId === hotelId);
}

export function getStoreRooms(hotelId: string, rooms: RoomInventory[]) {
  if (hotelId === "all") return rooms;
  return rooms.filter((r) => r.hotelId === hotelId);
}

export function getStoreMembers(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return MOCK_MEMBERS;
  const memberIds = new Set(
    bookings.filter((b) => b.hotelId === hotelId && b.memberId).map((b) => b.memberId!)
  );
  return MOCK_MEMBERS.filter((m) => memberIds.has(m.memberId));
}

export function getStoreTickets(hotelId: string) {
  if (hotelId === "all") return MOCK_TICKETS;
  return MOCK_TICKETS.filter((t) => t.hotelId === hotelId);
}

export function getStoreActivities(hotelId: string) {
  if (hotelId === "all") return MOCK_ACTIVITIES;
  return MOCK_ACTIVITIES.filter((a) => a.hotelId === hotelId);
}

export function getStoreNotifications(
  hotelId: string,
  notifications: ManagerNotification[]
) {
  if (hotelId === "all") return notifications;
  return notifications.filter((n) => n.hotelId === hotelId);
}

export { MOCK_DONORS, MOCK_MEMBERS, MOCK_TICKETS, MOCK_ACTIVITIES, MOCK_REVENUE };
