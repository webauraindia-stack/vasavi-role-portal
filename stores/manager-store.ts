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
  approveRefundRequestApi,
  cancelBookingApi,
  extendBookingStay,
  listBookings,
  mapManagerBooking,
  recordCashPaymentApi,
  refundBookingPaymentApi,
  updateBookingStatusApi,
} from "@/lib/api/bookings";
import { createStaffManualBooking } from "@/lib/api/staff-operations";
import {
  listRoomInventory,
  mapRoomToInventory,
  recomputeRoomDisplayStatuses,
} from "@/lib/api/properties";
import { updateRoomOperationalStatusApi } from "@/lib/api/staff-rooms";
import {
  listDonors,
  mapListDonorToPlatform,
  type BackendDonorListItem,
} from "@/lib/api/donors";

// ---------------------------------------------------------------------------
// In-flight dedup guard
// ---------------------------------------------------------------------------

let refreshInFlight: Promise<void> | null = null;

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------

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

  /** Update booking status: optimistic with server rollback on error. */
  updateBookingStatus: (
    id: string,
    status: ManagerBooking["bookingStatus"],
    accessToken: string,
    reason?: string
  ) => Promise<{ ok: boolean; error?: string }>;

  /** Record cash payment for a booking. */
  recordCashPayment: (
    bookingId: string,
    accessToken: string,
    opts?: { notes?: string; paymentReference?: string }
  ) => Promise<{ ok: boolean; error?: string }>;

  /** Cancel a booking (staff portal). */
  cancelBooking: (
    bookingId: string,
    accessToken: string,
    reason: string
  ) => Promise<{ ok: boolean; error?: string }>;

  /** Process a full or partial cash refund. */
  refundBookingPayment: (
    bookingId: string,
    accessToken: string,
    params: { reason: string; refundAmountPaise?: number; refundReference?: string }
  ) => Promise<{ ok: boolean; error?: string }>;

  /** Approve or reject a guest refund request. */
  approveRefundRequest: (
    bookingId: string,
    accessToken: string,
    params: {
      action: "approve" | "reject";
      reason?: string;
      refundAmountPaise?: number;
      refundReference?: string;
    }
  ) => Promise<{ ok: boolean; error?: string }>;

  /** Extend stay checkout date. */
  extendBookingCheckout: (
    bookingId: string,
    accessToken: string,
    newCheckOut: string
  ) => Promise<{ ok: boolean; error?: string }>;

  assignRoom: (bookingId: string, roomNumber: string) => void;
  /** Persist operational status to the API (available / blocked / maintenance). */
  updateRoomOperationalStatus: (
    roomId: string,
    operationalStatus: "available" | "blocked" | "maintenance",
    accessToken: string
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Refresh displayed occupied/available from current bookings (local only). */
  syncRoomDisplayStatuses: () => void;
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
    input: ManualBookingInput,
    accessToken?: string
  ) => Promise<{ success: boolean; error?: string; booking?: ManagerBooking }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _replaceBooking(bookings: ManagerBooking[], id: string, booking: ManagerBooking) {
  return bookings.map((b) => (b.id === id ? booking : b));
}

function _extractError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

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

      // -----------------------------------------------------------------------
      // Data loading
      // -----------------------------------------------------------------------

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
            const rooms = await listRoomInventory(accessToken, bookings, branchFilter);
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
              dataError: _extractError(err, "Could not load data."),
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

      // -----------------------------------------------------------------------
      // Booking status transitions (optimistic + server rollback)
      // -----------------------------------------------------------------------

      updateBookingStatus: async (id, bookingStatus, accessToken, reason) => {
        const previous = get().bookings.find((b) => b.id === id);

        const optimisticBookings = get().bookings.map((b) =>
          b.id === id ? { ...b, bookingStatus } : b
        );
        set({
          bookings: optimisticBookings,
          rooms: recomputeRoomDisplayStatuses(get().rooms, optimisticBookings),
        });

        try {
          const updated = await updateBookingStatusApi(
            accessToken,
            id,
            bookingStatus,
            reason
          );
          const mapped = mapManagerBooking(updated);
          const nextBookings = _replaceBooking(get().bookings, id, mapped);
          set({
            bookings: nextBookings,
            rooms: recomputeRoomDisplayStatuses(get().rooms, nextBookings),
          });
          return { ok: true };
        } catch (err) {
          if (previous) {
            const rolledBack = _replaceBooking(get().bookings, id, previous);
            set({
              bookings: rolledBack,
              rooms: recomputeRoomDisplayStatuses(get().rooms, rolledBack),
            });
          }
          return { ok: false, error: _extractError(err, "Status update failed.") };
        }
      },

      // -----------------------------------------------------------------------
      // Cash payment
      // -----------------------------------------------------------------------

      recordCashPayment: async (bookingId, accessToken, opts) => {
        try {
          const updated = await recordCashPaymentApi(
            accessToken,
            bookingId,
            opts?.notes,
            opts?.paymentReference
          );
          const mapped = mapManagerBooking(updated);
          set({ bookings: _replaceBooking(get().bookings, bookingId, mapped) });
          return { ok: true };
        } catch (err) {
          return { ok: false, error: _extractError(err, "Could not record cash payment.") };
        }
      },

      // -----------------------------------------------------------------------
      // Cancellation
      // -----------------------------------------------------------------------

      cancelBooking: async (bookingId, accessToken, reason) => {
        const previous = get().bookings.find((b) => b.id === bookingId);
        try {
          const updated = await cancelBookingApi(accessToken, bookingId, reason);
          const mapped = mapManagerBooking(updated);
          set({ bookings: _replaceBooking(get().bookings, bookingId, mapped) });
          return { ok: true };
        } catch (err) {
          // Rollback
          if (previous) {
            set({ bookings: _replaceBooking(get().bookings, bookingId, previous) });
          }
          return { ok: false, error: _extractError(err, "Could not cancel booking.") };
        }
      },

      // -----------------------------------------------------------------------
      // Refunds
      // -----------------------------------------------------------------------

      refundBookingPayment: async (bookingId, accessToken, params) => {
        try {
          const updated = await refundBookingPaymentApi(accessToken, bookingId, params);
          const mapped = mapManagerBooking(updated);
          set({ bookings: _replaceBooking(get().bookings, bookingId, mapped) });
          return { ok: true };
        } catch (err) {
          return { ok: false, error: _extractError(err, "Could not process refund.") };
        }
      },

      approveRefundRequest: async (bookingId, accessToken, params) => {
        try {
          const updated = await approveRefundRequestApi(accessToken, bookingId, params);
          const mapped = mapManagerBooking(updated);
          set({ bookings: _replaceBooking(get().bookings, bookingId, mapped) });
          return { ok: true };
        } catch (err) {
          return { ok: false, error: _extractError(err, "Could not process refund request.") };
        }
      },

      // -----------------------------------------------------------------------
      // Stay extension
      // -----------------------------------------------------------------------

      extendBookingCheckout: async (bookingId, accessToken, newCheckOut) => {
        try {
          const mapped = await extendBookingStay(
            accessToken,
            bookingId,
            newCheckOut,
            "Checkout extended at front desk"
          );
          set({ bookings: _replaceBooking(get().bookings, bookingId, mapped) });
          return { ok: true };
        } catch (err) {
          return { ok: false, error: _extractError(err, "Could not extend stay.") };
        }
      },

      // -----------------------------------------------------------------------
      // Room management
      // -----------------------------------------------------------------------

      assignRoom: (bookingId, roomNumber) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === bookingId ? { ...b, roomNumber } : b
          ),
        }),

      updateRoomOperationalStatus: async (roomId, operationalStatus, accessToken) => {
        const previous = get().rooms.find((r) => r.id === roomId);
        if (!previous) {
          return { ok: false, error: "Room not found." };
        }

        const optimisticRooms = get().rooms.map((r) => {
          if (r.id !== roomId) return r;
          const next: RoomInventory = {
            ...r,
            operationalStatus,
          };
          next.status =
            operationalStatus === "available"
              ? recomputeRoomDisplayStatuses([next], get().bookings)[0]!.status
              : operationalStatus;
          return next;
        });

        set({ rooms: optimisticRooms });

        try {
          const updated = await updateRoomOperationalStatusApi(
            accessToken,
            roomId,
            operationalStatus
          );
          const mapped = mapRoomToInventory(updated, get().bookings);
          set({
            rooms: get().rooms.map((r) => (r.id === roomId ? mapped : r)),
          });
          return { ok: true };
        } catch (err) {
          if (previous) {
            set({
              rooms: get().rooms.map((r) => (r.id === roomId ? previous : r)),
            });
          }
          return {
            ok: false,
            error: _extractError(err, "Could not update room status."),
          };
        }
      },

      syncRoomDisplayStatuses: () => {
        const bookings = get().bookings;
        set({ rooms: recomputeRoomDisplayStatuses(get().rooms, bookings) });
      },

      extendRoomHold: (roomId, untilDate) =>
        set({
          rooms: get().rooms.map((r) => {
            if (r.id !== roomId) return r;
            if (r.status === "maintenance") return { ...r, maintenanceUntil: untilDate };
            if (r.status === "blocked") return { ...r, blockedUntil: untilDate };
            return r;
          }),
        }),

      extendRoomStay: (roomId, newCheckOut) =>
        set({
          bookings: get().bookings.map((b) => {
            const room = get().rooms.find((r) => r.id === roomId);
            if (!room || b.roomNumber !== room.number || b.hotelId !== room.hotelId) return b;
            if (b.bookingStatus !== "checked_in" && b.bookingStatus !== "confirmed") return b;
            const nights = Math.max(
              1,
              Math.ceil(
                (new Date(newCheckOut).getTime() - new Date(b.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );
            return { ...b, checkOut: newCheckOut, nights };
          }),
        }),

      applyStayExtension: (payload) => {
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== payload.bookingId) return b;
            const nights = Math.max(
              1,
              Math.ceil(
                (new Date(payload.newCheckOut).getTime() - new Date(b.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );
            return {
              ...b,
              checkOut: payload.newCheckOut,
              roomNumber: payload.roomNumber ?? b.roomNumber,
              nights,
              finalAmountPaise: b.finalAmountPaise + (payload.extraAmount ?? 0) * 100,
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

      // -----------------------------------------------------------------------
      // Manual booking creation (staff portal)
      // -----------------------------------------------------------------------

      createManualBooking: async (input, accessToken) => {
        const room = get().rooms.find((r) => r.id === input.roomId);
        if (!room) return { success: false, error: "Selected room not found." };

        if (accessToken) {
          try {
            const created = await createStaffManualBooking(accessToken, {
              room_id: room.id,
              check_in_date: input.checkIn,
              check_out_date: input.checkOut,
              guest_count: input.guestCount ?? 1,
              guest_name: input.guestName,
              guest_phone: input.guestPhone,
              notes: input.specialRequests,
              source: input.source,
              record_cash_payment: input.paymentStatus === "paid" || input.paymentStatus === "free_stay",
              check_in_immediately: input.bookingStatus === "checked_in",
            });
            const mapped = mapManagerBooking(created);
            // Optimistic insert; background refresh will correct any drift
            set({ bookings: [mapped, ...get().bookings] });
            void get().refreshFromApi(accessToken);
            return { success: true, booking: mapped };
          } catch (err) {
            return {
              success: false,
              error: _extractError(err, "Could not create booking."),
            };
          }
        }

        // Fallback: local-only (no token)
        const { booking, error } = buildManualBooking(input, room, get().bookings);
        if (!booking || error) return { success: false, error: error ?? "Could not create booking." };

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
    {
      name: "vasavi-manager-data",
      partialize: (s) => ({ hotelId: s.hotelId }),
    }
  )
);

// ---------------------------------------------------------------------------
// Selector helpers
// ---------------------------------------------------------------------------

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

  if (hotelId === "all") return platformDonors.map(mapPlatformDonorToManagerDonor);

  const hotelBookings = bookings.filter((b) => b.hotelId === hotelId);
  const phonesAtHotel = new Set(
    hotelBookings.filter((b) => b.guestType === "kcgf_donor").map((b) => b.guestPhone)
  );

  return platformDonors
    .filter((d) => phonesAtHotel.has(d.phone.replace(/\s/g, "")) || phonesAtHotel.has(d.phone))
    .map(mapPlatformDonorToManagerDonor);
}

function mapPlatformDonorToManagerDonor(
  d: ReturnType<typeof mapListDonorToPlatform>
): DonorProfile {
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
    .filter((b) => b.guestType === "kcgf_donor")
    .map((b) => ({
      id: b.id,
      memberId: b.reference,
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

