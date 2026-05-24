import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CommunityActivity,
  DonorProfile,
  ManagerBooking,
  ManagerHotel,
  ManagerNotification,
  MemberProfile,
  RoomInventory,
  SupportTicket,
} from "@/lib/types";
import {
  buildManualBooking,
  shouldMarkRoomOccupied,
  type ManualBookingInput,
} from "@/lib/booking/manual-booking";
import { notificationsFromBookings } from "@/lib/analytics/notifications";
import { listManagerHotels } from "@/lib/api/branches";
import {
  createBooking,
  listBookings,
  mapManagerBooking,
  recordCashPaymentApi,
  updateBookingStatusApi,
} from "@/lib/api/bookings";
import { listRoomInventory } from "@/lib/api/properties";
import {
  listDonors,
  mapListDonorToPlatform,
  type BackendDonorListItem,
} from "@/lib/api/donors";
import { useAuthStore } from "@/stores/auth-store";

let refreshInFlight: Promise<void> | null = null;

interface ManagerState {
  hotelId: string;
  branches: ManagerHotel[];
  bookings: ManagerBooking[];
  rooms: RoomInventory[];
  donors: BackendDonorListItem[];
  notifications: ManagerNotification[];
  dataLoaded: boolean;
  dataError: string | null;
  isRefreshing: boolean;

  setHotelId: (id: string) => void;
  refreshFromApi: (accessToken: string) => Promise<void>;
  updateBookingStatus: (id: string, status: ManagerBooking["bookingStatus"]) => void;
  recordCashPayment: (bookingId: string, notes?: string) => Promise<{ ok: boolean; error?: string }>;
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
  createManualBooking: (
    input: ManualBookingInput
  ) => Promise<{ success: boolean; error?: string; booking?: ManagerBooking }>;
}

export const useManagerStore = create<ManagerState>()(
  persist(
    (set, get) => ({
      hotelId: "all",
      branches: [],
      bookings: [],
      rooms: [],
      donors: [],
      notifications: [],
      dataLoaded: false,
      dataError: null,
      isRefreshing: false,

      setHotelId: (hotelId) => set({ hotelId }),

      refreshFromApi: async (accessToken) => {
        if (refreshInFlight) {
          await refreshInFlight;
          return;
        }

        refreshInFlight = (async () => {
          set({ isRefreshing: true, dataError: null });
          try {
            const [branches, bookings] = await Promise.all([
              listManagerHotels(accessToken),
              listBookings(accessToken),
            ]);

            let donors: BackendDonorListItem[] = [];
            try {
              donors = await listDonors(accessToken);
            } catch {
              donors = [];
            }

            const branchFilter =
              get().hotelId !== "all" ? get().hotelId : undefined;
            const rooms = await listRoomInventory(
              accessToken,
              bookings,
              branchFilter
            );

            const notifications = notificationsFromBookings(bookings);

            set({
              branches,
              bookings,
              rooms,
              donors,
              notifications,
              dataLoaded: true,
              dataError: null,
              isRefreshing: false,
            });
          } catch (err) {
            set({
              dataError: err instanceof Error ? err.message : "Could not load data.",
              dataLoaded: true,
              isRefreshing: false,
            });
          }
        })();

        try {
          await refreshInFlight;
        } finally {
          refreshInFlight = null;
        }
      },

      updateBookingStatus: (id, bookingStatus) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, bookingStatus } : b
          ),
        });
        const token = useAuthStore.getState().accessToken;
        if (token) {
          const backendStatus =
            bookingStatus === "checked_in"
              ? "checked_in"
              : bookingStatus === "checked_out"
                ? "checked_out"
                : bookingStatus === "cancelled"
                  ? "cancelled"
                  : bookingStatus === "confirmed"
                    ? "confirmed"
                    : "pending";
          void updateBookingStatusApi(
            token,
            id,
            backendStatus,
            bookingStatus === "cancelled" ? "Cancelled from portal" : undefined
          )
            .then(() => get().refreshFromApi(token))
            .catch(() => {
              /* optimistic UI kept */
            });
        }
      },

      recordCashPayment: async (bookingId, notes) => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          return { ok: false, error: "Not signed in." };
        }
        try {
          const updated = await recordCashPaymentApi(token, bookingId, notes);
          const mapped = mapManagerBooking(updated);
          set({
            bookings: get().bookings.map((b) => (b.id === bookingId ? mapped : b)),
          });
          await get().refreshFromApi(token);
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : "Could not record cash payment.",
          };
        }
      },

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

      applyStayExtension: (payload) => {
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== payload.bookingId) return b;
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(payload.newCheckOut);
            const nights = Math.max(
              1,
              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            );
            return {
              ...b,
              checkOut: payload.newCheckOut,
              roomNumber: payload.roomNumber ?? b.roomNumber,
              nights,
              total: b.total + (payload.extraAmount ?? 0),
            };
          }),
          notifications: [
            {
              id: `n-ext-${Date.now()}`,
              type: "stay_extension",
              title: "Stay extension completed",
              message: `${payload.guestName} (${payload.reference}) checkout updated to ${payload.newCheckOut}.`,
              time: new Date().toISOString(),
              read: false,
              priority: "medium",
              hotelId: payload.hotelId,
            },
            ...get().notifications,
          ],
        });
        const token = useAuthStore.getState().accessToken;
        if (token) {
          void get().refreshFromApi(token);
        }
      },

      pushExtensionNotification: (payload) =>
        set({
          notifications: [
            {
              id: `n-ext-req-${Date.now()}`,
              type: "stay_extension",
              title: "Stay extension request",
              message: `${payload.guestName} (${payload.reference}) — status: ${payload.status.replace(/_/g, " ")}`,
              time: new Date().toISOString(),
              read: false,
              priority: statusIncludesPending(payload.status) ? "high" : "medium",
              hotelId: payload.hotelId,
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

      createManualBooking: async (input) => {
        const token = useAuthStore.getState().accessToken;
        const room = get().rooms.find((r) => r.id === input.roomId);
        if (!room) {
          return { success: false, error: "Selected room not found." };
        }

        if (token) {
          try {
            const created = await createBooking(token, {
              room_id: room.id,
              check_in_date: input.checkIn,
              check_out_date: input.checkOut,
              guest_count: 2,
              guest_name: input.guestName,
              guest_phone: input.guestPhone,
              notes: input.specialRequests,
            });
            await get().refreshFromApi(token);
            return { success: true, booking: created };
          } catch (err) {
            return {
              success: false,
              error: err instanceof Error ? err.message : "Could not create booking.",
            };
          }
        }

        const { booking, error } = buildManualBooking(input, room, get().bookings);
        if (!booking || error) {
          return { success: false, error: error ?? "Could not create booking." };
        }

        const markOccupied = shouldMarkRoomOccupied(booking.bookingStatus, booking.checkIn);
        set({
          bookings: [booking, ...get().bookings],
          rooms: markOccupied
            ? get().rooms.map((r) =>
                r.id === room.id ? { ...r, status: "occupied" as const } : r
              )
            : get().rooms,
        });
        return { success: true, booking };
      },
    }),
    { name: "vasavi-manager-data", partialize: (s) => ({ hotelId: s.hotelId }) }
  )
);

function statusIncludesPending(status: string): boolean {
  return status.includes("pending");
}

export function getStoreBookings(hotelId: string, bookings: ManagerBooking[]) {
  if (hotelId === "all") return bookings;
  return bookings.filter((b) => b.hotelId === hotelId);
}

export function getStoreRooms(hotelId: string, rooms: RoomInventory[]) {
  if (hotelId === "all") return rooms;
  return rooms.filter((r) => r.hotelId === hotelId);
}

export function getStoreDonors(hotelId: string, bookings: ManagerBooking[]) {
  const store = useManagerStore.getState();
  const platformDonors = store.donors.map(mapListDonorToPlatform);

  if (hotelId === "all") {
    return platformDonors.map(mapPlatformDonorToManagerDonor);
  }

  const hotelBookings = bookings.filter((b) => b.hotelId === hotelId);
  const phonesAtHotel = new Set(
    hotelBookings.filter((b) => b.guestType === "kcgf_donor").map((b) => b.guestPhone)
  );

  return platformDonors
    .filter((d) => phonesAtHotel.has(d.phone.replace(/\s/g, "")) || phonesAtHotel.has(d.phone))
    .map(mapPlatformDonorToManagerDonor);
}

function mapPlatformDonorToManagerDonor(d: ReturnType<typeof mapListDonorToPlatform>): DonorProfile {
  return {
    id: d.id,
    donorId: d.donorId,
    name: d.name,
    email: d.email,
    phone: d.phone,
    avatarUrl: d.profilePhoto,
    tier: d.membershipLevel,
    donationCategory: d.donationCategory,
    sponsorshipTypes: d.sponsorshipTypes,
    totalDonation: d.totalContribution,
    annadanamContribution: 0,
    sponsoredRooms: [],
    freeStaysRemaining: d.freeStayAllocation,
    compensationBalance: d.compensationAllocation,
    freeStayEligible: d.freeStayAllocation > 0,
    donorSponsored: false,
    activeCoupons: 0,
    hotelId: "",
    remainingEligibility: "",
    usageHistory: [],
    hotelBookingHistory: [],
  };
}

export function getStoreMembers(hotelId: string, bookings: ManagerBooking[]): MemberProfile[] {
  const scoped =
    hotelId === "all" ? bookings : bookings.filter((b) => b.hotelId === hotelId);
  const seen = new Set<string>();

  return scoped
    .filter((b) => b.memberId || b.guestType === "kcgf_donor")
    .map((b) => ({
      id: b.memberId ?? b.id,
      memberId: b.memberId ?? b.reference,
      name: b.guestName,
      clubName: "Vasavi Community",
      category: b.guestTypeLabel,
      phone: b.guestPhone,
      freeStaysRemaining: 0,
      compensationBalance: 0,
      status: "active" as const,
    }))
    .filter((m) => {
      if (seen.has(m.memberId)) return false;
      seen.add(m.memberId);
      return true;
    });
}

export function getStoreTickets(): SupportTicket[] {
  return [];
}

export function getStoreActivities(): CommunityActivity[] {
  return [];
}

export function getStoreNotifications(
  hotelId: string,
  notifications: ManagerNotification[]
) {
  if (hotelId === "all") return notifications;
  return notifications.filter((n) => n.hotelId === hotelId);
}

export { revenueFromBookings } from "@/lib/analytics/revenue";
