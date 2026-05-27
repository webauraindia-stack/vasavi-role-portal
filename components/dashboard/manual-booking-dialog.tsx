"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import {
  AlertCircle,
  BedDouble,
  CheckCircle2,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { validatePhoneField, toBackendPhone, isValidIndianMobile } from "@/lib/phone";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/rbac/can";
import {
  calculateManualBookingPricing,
  calculateManualBookingPricingFromPaise,
  checkRoomAvailableForDates,
  findAvailableRoomsForStay,
  guestTypeLabel,
  type ManualBookingInput,
} from "@/lib/booking/manual-booking";
import {
  searchStaffRooms,
  type StaffRoomSearchResult,
} from "@/lib/api/staff-operations";
import { useManagerStore } from "@/stores/manager-store";
import { useAuthStore } from "@/stores/auth-store";
import type { GuestType, PaymentStatus, RoomInventory } from "@/lib/types";
import { cn, formatCurrency, GUEST_TYPE_COLORS } from "@/lib/utils";

const GUEST_TYPES: GuestType[] = [
  "visitor",
  "vci_member",
  "kcgf_donor",
  "free_stay_eligible",
  "compensation_holder",
  "sponsorship_patron",
];

export function ManualBookingDialog({
  open,
  onClose,
  hotelId,
  hotelName,
  viewAll,
}: {
  open: boolean;
  onClose: () => void;
  hotelId: string;
  hotelName: string;
  viewAll: boolean;
}) {
  const bookings = useManagerStore((s) => s.bookings);
  const rooms = useManagerStore((s) => s.rooms);
  const branches = useManagerStore((s) => s.branches);
  const createManualBooking = useManagerStore((s) => s.createManualBooking);
  const accessToken = useAuthStore((s) => s.accessToken);

  const today = format(new Date(), "yyyy-MM-dd");
  const defaultOut = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [propertyId, setPropertyId] = useState(
    hotelId === "all" ? (branches[0]?.id ?? "") : hotelId
  );
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestType, setGuestType] = useState<GuestType>("visitor");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [roomId, setRoomId] = useState("");
  const [source, setSource] = useState<"walk_in" | "phone">("walk_in");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [checkInNow, setCheckInNow] = useState(true);
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<StaffRoomSearchResult[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const effectiveHotelId = hotelId === "all" ? propertyId : hotelId;
  const effectiveHotelName =
    branches.find((h) => h.id === effectiveHotelId)?.name ?? hotelName;

  const mapSearchToInventory = useCallback(
    (row: StaffRoomSearchResult): RoomInventory => ({
      id: row.id,
      hotelId: row.branch.id,
      number: row.room_number,
      name: `${row.room_type.name} · ${row.room_number}`,
      category: row.room_type.name,
      floor: 1,
      maxOccupancy: row.capacity,
      status: "available",
      isDonorExclusive: row.is_donor_exclusive,
    }),
    []
  );

  useEffect(() => {
    if (!accessToken || !checkIn || !checkOut || checkOut <= checkIn || !effectiveHotelId) {
      setApiSearchResults([]);
      return;
    }
    let cancelled = false;
    setLoadingRooms(true);
    void searchStaffRooms(accessToken, {
      check_in: checkIn,
      check_out: checkOut,
      guests: 1, // simplified
      branch_id: effectiveHotelId,
    })
      .then((rows) => {
        if (!cancelled) setApiSearchResults(rows);
      })
      .catch(() => {
        if (!cancelled) setApiSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRooms(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, checkIn, checkOut, effectiveHotelId]);

  const availableRooms = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return [];

    if (accessToken && apiSearchResults.length > 0) {
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      return apiSearchResults
        .filter((row) => row.is_available)
        .map((row) => {
          const room = mapSearchToInventory(row);
          return {
            room,
            pricing: calculateManualBookingPricingFromPaise(
              row.base_price_per_night,
              nights,
              guestType
            ),
          };
        });
    }

    return findAvailableRoomsForStay(
      effectiveHotelId,
      checkIn,
      checkOut,
      rooms,
      bookings
    );
  }, [
    accessToken,
    apiSearchResults,
    bookings,
    checkIn,
    checkOut,
    effectiveHotelId,
    guestType,
    mapSearchToInventory,
    rooms,
  ]);

  const effectiveRoomId = useMemo(() => {
    if (!roomId) return "";
    return availableRooms.some((a) => a.room.id === roomId) ? roomId : "";
  }, [availableRooms, roomId]);

  const selectedRoom = rooms.find((r) => r.id === effectiveRoomId);
  const selectedAvailability = selectedRoom
    ? checkRoomAvailableForDates(selectedRoom, checkIn, checkOut, bookings)
    : null;

  const pricing = useMemo(() => {
    if (!selectedRoom || !checkIn || !checkOut || checkOut <= checkIn) return null;
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    return calculateManualBookingPricing(selectedRoom, nights, guestType);
  }, [selectedRoom, checkIn, checkOut, guestType]);

  const handleSubmit = async () => {
    setError(null);
    if (!guestName.trim()) {
      setError("Guest name is required.");
      return;
    }
    const phoneValidation = validatePhoneField(guestPhone);
    if (phoneValidation) {
      setError(phoneValidation);
      return;
    }
    if (!effectiveRoomId) {
      setError("Select an available room.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Checkout must be after check-in.");
      return;
    }

    const input: ManualBookingInput = {
      hotelId: effectiveHotelId,
      hotelName: effectiveHotelName,
      guestName,
      guestPhone: toBackendPhone(guestPhone),
      guestType,
      roomId: effectiveRoomId,
      checkIn,
      checkOut,
      paymentStatus: guestType === "free_stay_eligible" ? "free_stay" : paymentStatus,
      bookingStatus: checkInNow ? "checked_in" : "confirmed",
      source,
      specialRequests,
    };

    setSubmitting(true);
    const result = await createManualBooking(input, accessToken ?? undefined);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Booking failed.");
      return;
    }

    setSuccessRef(result.booking?.reference ?? null);
  };

  const handleClose = () => {
    setPropertyId(hotelId === "all" ? "1" : hotelId);
    setGuestName("");
    setGuestPhone("");
    setGuestType("visitor");
    setCheckIn(today);
    setCheckOut(defaultOut);
    setRoomId("");
    setSource("walk_in");
    setPaymentStatus("unpaid");
    setCheckInNow(true);
    setSpecialRequests("");
    setError(null);
    setSuccessRef(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Can permission={["bookings.create", "rooms.view"]}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          aria-label="Close"
          onClick={handleClose}
        />
        <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-beige/60 bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-beige/40 bg-white px-5 py-4">
            <div>
              <h2 className="font-display text-xl text-charcoal flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-champagne" />
                Manual booking
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Create a reservation for walk-in or phone guests when rooms are available
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-surface text-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {successRef ? (
            <div className="p-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <p className="font-display text-lg text-charcoal">Booking confirmed</p>
              <p className="text-sm text-muted">
                Reference <span className="font-mono font-bold text-charcoal">{successRef}</span>
              </p>
              <Button onClick={handleClose}>Done</Button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {viewAll && hotelId === "all" && (
                <Field label="Property">
                  <select
                    value={propertyId}
                    onChange={(e) => {
                      setPropertyId(e.target.value);
                      setRoomId("");
                    }}
                    className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm"
                  >
                    {branches.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} · {h.city}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Guest name *">
                  <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </Field>
                <Field label="Phone *">
                  <PhoneInput
                    id="manual-booking-phone"
                    value={guestPhone}
                    onChange={setGuestPhone}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Guest type">
                  <select
                    value={guestType}
                    onChange={(e) => setGuestType(e.target.value as GuestType)}
                    className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm"
                  >
                    {GUEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {guestTypeLabel(t)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Booking source">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as "walk_in" | "phone")}
                    className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm"
                  >
                    <option value="walk_in">Walk-in (offline)</option>
                    <option value="phone">Phone booking</option>
                  </select>
                </Field>
                <Field label="Check-in">
                  <Input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </Field>
                <Field label="Check-out">
                  <Input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </Field>
              </div>

              <div className="rounded-lg border border-beige/50 bg-surface/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase text-muted">
                    Available rooms ({availableRooms.length})
                  </p>
                  {checkIn && checkOut && checkOut > checkIn && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                      {loadingRooms ? "Checking availability…" : "Live availability"}
                    </Badge>
                  )}
                </div>

                {checkOut <= checkIn ? (
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Select valid check-in and check-out dates.
                  </p>
                ) : availableRooms.length === 0 ? (
                  <p className="text-sm text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    No rooms available for these dates. Try different dates or check the Rooms page.
                  </p>
                ) : (
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {availableRooms.map(({ room, pricing: p }) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setRoomId(room.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                          effectiveRoomId === room.id
                            ? "border-champagne bg-champagne/10"
                            : "border-beige/50 hover:border-champagne/40"
                        )}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <BedDouble className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-charcoal">
                              Room {room.number} · {room.name}
                            </p>
                            <p className="text-xs text-muted">
                              Floor {room.floor} · {room.category} · up to {room.maxOccupancy} guests
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-charcoal shrink-0">
                          {formatCurrency(p.total)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedRoom && selectedAvailability && !selectedAvailability.available && (
                  <p className="text-sm text-rose-700">{selectedAvailability.reason}</p>
                )}
              </div>

              {pricing && (
                <div className="rounded-lg border border-beige/50 p-4 text-sm space-y-1.5">
                  <p className="text-xs font-bold uppercase text-muted mb-2">Price summary</p>
                  <PriceRow label={`${pricing.nights} night(s) × ${formatCurrency(pricing.nightlyRate)}`} value={pricing.subtotal} />
                  {pricing.tierDiscount > 0 && (
                    <PriceRow label="Tier discount" value={-pricing.tierDiscount} />
                  )}
                  <PriceRow label="GST (12%)" value={pricing.taxes} />
                  <div className="border-t border-beige/40 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.total)}</span>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Payment collection">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    disabled={guestType === "free_stay_eligible"}
                    className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm disabled:opacity-50"
                  >
                    <option value="unpaid">Pay at front desk (Unpaid)</option>
                    <option value="paid">Already paid in full (Cash/UPI)</option>
                  </select>
                </Field>
                <Field label="On arrival">
                  <label className="flex items-center gap-2 h-9 text-sm">
                    <input
                      type="checkbox"
                      checked={checkInNow}
                      onChange={(e) => setCheckInNow(e.target.checked)}
                      className="rounded border-beige"
                      disabled={paymentStatus !== "paid"} // Requires paid status
                    />
                    Check guest in immediately {paymentStatus !== "paid" && "(Requires payment)"}
                  </label>
                </Field>
              </div>

              <Field label="Special requests">
                <Input
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Early check-in, extra bedding, etc."
                />
              </Field>

              {guestType !== "visitor" && (
                <Badge className={cn("text-[10px]", GUEST_TYPE_COLORS[guestType])}>
                  {guestTypeLabel(guestType)} pricing applied
                </Badge>
              )}

              {error && (
                <p className="text-sm text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-beige/40">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  disabled={
                    submitting ||
                    !effectiveRoomId ||
                    availableRooms.length === 0 ||
                    !guestName.trim() ||
                    !isValidIndianMobile(guestPhone)
                  }
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Can>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase text-muted">{label}</span>
      {children}
    </label>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="font-mono font-bold text-charcoal">
        {value < 0 ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

export function ManualBookingTrigger({
  hotelId,
  hotelName,
  viewAll,
}: {
  hotelId: string;
  hotelName: string;
  viewAll: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  return (
    <Can permission={["bookings.create", "rooms.view"]}>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={() => {
          setFormKey((k) => k + 1);
          setOpen(true);
        }}
      >
        <UserPlus className="h-3.5 w-3.5" />
        New manual booking
      </Button>
      <ManualBookingDialog
        key={formKey}
        open={open}
        onClose={() => setOpen(false)}
        hotelId={hotelId}
        hotelName={hotelName}
        viewAll={viewAll}
      />
    </Can>
  );
}
