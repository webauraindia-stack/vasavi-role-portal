"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useBookingStore } from "@/stores/booking-store";
import { useSearchStore } from "@/stores/search-store";
import { parseSearchDate } from "@/lib/parse-search-params";
import { GlobalSearchBar } from "@/components/shared/global-search-bar";
import {
  SearchFilters,
  SEARCH_PRICE_MAX,
  SEARCH_PRICE_MIN,
} from "@/components/customer/search-filters";
import { SearchSkeleton } from "@/components/customer/skeletons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Room, RoomCategory } from "@/types";
import { Crown } from "lucide-react";

async function fetchRooms(params: URLSearchParams): Promise<Room[]> {
  const res = await fetch(`/api/rooms/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { openBooking } = useBookingStore();
  const { checkIn: storeCheckIn, checkOut: storeCheckOut, guests: storeGuests } =
    useSearchStore();

  const [priceRange, setPriceRange] = useState<[number, number]>([
    SEARCH_PRICE_MIN,
    SEARCH_PRICE_MAX,
  ]);
  const [roomTypes, setRoomTypes] = useState<RoomCategory[]>([]);
  const [donorExclusive, setDonorExclusive] = useState(false);

  const handlePriceChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
  }, []);

  const handleClearFilters = () => {
    setRoomTypes([]);
    setPriceRange([SEARCH_PRICE_MIN, SEARCH_PRICE_MAX]);
    setDonorExclusive(false);
  };

  const hotelId = searchParams.get("hotel") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  const bookingCheckIn =
    parseSearchDate(checkIn) ?? storeCheckIn ?? undefined;
  const bookingCheckOut =
    parseSearchDate(checkOut) ?? storeCheckOut ?? undefined;

  const handleBookRoom = useCallback(
    (room: Room) => {
      openBooking(room, bookingCheckIn, bookingCheckOut, {
        adults: Number(searchParams.get("adults")) || storeGuests.adults,
        children: Number(searchParams.get("children")) || storeGuests.children,
        rooms: Number(searchParams.get("rooms")) || storeGuests.rooms,
      });
    },
    [
      openBooking,
      bookingCheckIn,
      bookingCheckOut,
      searchParams,
      storeGuests.adults,
      storeGuests.children,
      storeGuests.rooms,
    ]
  );

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (hotelId) p.set("hotels", hotelId);
    if (roomTypes.length) p.set("roomTypes", roomTypes.join(","));
    p.set("priceMin", String(priceRange[0]));
    p.set("priceMax", String(priceRange[1]));
    if (donorExclusive) p.set("donorExclusive", "true");
    return p;
  }, [hotelId, roomTypes, priceRange, donorExclusive]);

  const { data: rooms, isLoading, isFetching, error } = useQuery({
    queryKey: ["rooms-search", queryParams.toString()],
    queryFn: () => fetchRooms(queryParams),
  });

  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h1 className="font-display text-2xl md:text-4xl text-charcoal mb-2 font-bold">Search Rooms</h1>
        {(checkIn || checkOut) && (
          <p className="text-charcoal/80 text-base font-semibold mb-6">
            {checkIn && `Check-in: ${checkIn}`}
            {checkOut && ` · Check-out: ${checkOut}`}
          </p>
        )}

        <div className="mb-6">
          <GlobalSearchBar variant="compact" />
        </div>

        <SearchFilters
          filters={{
            roomTypes,
            priceRange: priceRange as [number, number],
            donorExclusive,
          }}
          onRoomTypesChange={setRoomTypes}
          onPriceRangeChange={handlePriceChange}
          onDonorExclusiveChange={setDonorExclusive}
          onClear={handleClearFilters}
          resultCount={!isLoading && !isFetching && rooms ? rooms.length : undefined}
          isApplying={isFetching && !isLoading}
        />

        <div
          className={cn(
            "mt-6 transition-opacity duration-200",
            isFetching && rooms && "opacity-60"
          )}
        >
          {isLoading && <SearchSkeleton />}
          {error && (
            <p className="text-red-600 text-center py-8">Failed to load results.</p>
          )}
          {rooms && rooms.length > 0 && (
            <div
              className={cn(
                "grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4",
                rooms.length % 2 === 1 && "max-lg:justify-items-stretch"
              )}
            >
              {rooms.map((room, index) => {
                const isLoneLast =
                  rooms.length % 2 === 1 && index === rooms.length - 1;

                return (
                  <article
                    key={room.id}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white transition-all hover:border-champagne/30 hover:shadow-warm-md lg:flex-row lg:items-stretch",
                      isLoneLast &&
                        "max-lg:col-span-2 max-lg:w-[calc(50%-0.375rem)] max-lg:max-w-[calc(50%-0.375rem)] max-lg:justify-self-center"
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-52 xl:w-60 lg:min-h-[10.5rem]">
                      <Image
                        src={room.images[0]}
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 50vw, 240px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-2.5 lg:flex-row lg:items-center lg:gap-6 lg:p-5">
                      <div className="min-w-0 flex-1 space-y-0.5 lg:space-y-1.5">
                        <p className="line-clamp-2 text-xs font-bold uppercase leading-tight tracking-wide text-champagne sm:text-sm">
                          {room.hotelName}
                        </p>
                        <h3 className="font-display text-sm font-bold leading-snug text-charcoal sm:text-base lg:text-lg">
                          <span className="line-clamp-2 lg:line-clamp-1">{room.name}</span>
                          {room.isDonorExclusive && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded bg-champagne-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white sm:text-xs">
                              <Crown className="h-3 w-3" />
                              Donor
                            </span>
                          )}
                        </h3>
                        <p className="text-xs font-semibold text-charcoal/75 sm:text-sm">
                          {room.category} · {room.bedType}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-col gap-1.5 lg:mt-0 lg:shrink-0 lg:items-end lg:gap-3 lg:border-l lg:border-charcoal/10 lg:pl-6">
                        <p className="font-display text-base font-black tabular-nums text-charcoal sm:text-lg lg:text-2xl">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(room.pricePerNight)}
                          <span className="text-xs font-semibold text-charcoal/70 sm:text-sm">
                            /night
                          </span>
                        </p>
                        <Button
                          size="sm"
                          disabled={room.isFullyBooked}
                          onClick={() => handleBookRoom(room)}
                          className="h-10 w-full text-sm lg:h-11 lg:min-w-[9.5rem] lg:px-6"
                        >
                          {room.isFullyBooked ? "Sold Out" : "Book Now"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {rooms && rooms.length === 0 && (
            <div className="text-center py-16 card-surface">
              <p className="text-charcoal font-display text-lg mb-2">No rooms found</p>
              <p className="text-muted text-sm mb-4">Try adjusting your filters</p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
