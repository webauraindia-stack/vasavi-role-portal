import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ManagerBooking,
  ManagerNotification,
  RoomInventory,
} from "@/lib/types";
import {
  DEFAULT_HOTEL_ID,
  INCOMING_BOOKING_TEMPLATE,
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
  isAuthenticated: boolean;
  managerName: string;
  bookings: ManagerBooking[];
  rooms: RoomInventory[];
  notifications: ManagerNotification[];
  liveFeedEnabled: boolean;

  login: (pin: string) => boolean;
  logout: () => void;
  setHotelId: (id: string) => void;
  updateBookingStatus: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  assignRoom: (bookingId: string, roomNumber: string) => void;
  setRoomStatus: (roomId: string, status: RoomInventory["status"], meta?: Partial<RoomInventory>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  simulateIncomingBooking: () => void;
  toggleLiveFeed: () => void;
}

let liveInterval: ReturnType<typeof setInterval> | null = null;

export const useManagerStore = create<ManagerState>()(
  persist(
    (set, get) => ({
      hotelId: DEFAULT_HOTEL_ID,
      isAuthenticated: false,
      managerName: "Ramesh Kumar",
      bookings: MOCK_BOOKINGS,
      rooms: MOCK_ROOMS,
      notifications: MOCK_NOTIFICATIONS,
      liveFeedEnabled: false,

      login: (pin) => {
        if (pin === "1234" || pin === "vasavi") {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        if (liveInterval) clearInterval(liveInterval);
        liveInterval = null;
        set({ isAuthenticated: false, liveFeedEnabled: false });
      },

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
          rooms: get().rooms.map((r) =>
            r.id === roomId ? { ...r, status, ...meta } : r
          ),
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
        const ref = `VH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        const booking: ManagerBooking = {
          ...INCOMING_BOOKING_TEMPLATE,
          id: `bk-live-${Date.now()}`,
          reference: ref,
          qrCode: ref,
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
        };
        set({
          bookings: [booking, ...get().bookings],
          notifications: [notification, ...get().notifications],
        });
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
    { name: "vasavi-manager", partialize: (s) => ({ isAuthenticated: s.isAuthenticated, hotelId: s.hotelId }) }
  )
);

/** Hotel managers see only donors with bookings or history at their property */
export function getStoreDonors(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return MOCK_DONORS;
  const refsAtHotel = new Set(
    bookings.filter((b) => b.hotelId === hotelId).map((b) => b.reference)
  );
  const memberIdsAtHotel = new Set(
    bookings
      .filter((b) => b.hotelId === hotelId && b.memberId)
      .map((b) => b.memberId!)
  );
  return MOCK_DONORS.filter(
    (d) =>
      memberIdsAtHotel.has(d.donorId) ||
      d.hotelBookingHistory.some((h) => refsAtHotel.has(h.bookingRef)) ||
      (d.hotelId === hotelId && d.hotelBookingHistory.length > 0)
  );
}

export function getStoreBookings(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return bookings;
  return bookings.filter((b) => b.hotelId === hotelId);
}

export { MOCK_DONORS, MOCK_MEMBERS, MOCK_TICKETS, MOCK_ACTIVITIES, MOCK_REVENUE };
