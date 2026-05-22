"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Crown, Users } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { useBookingStore } from "@/stores/booking-store";
import { formatCurrency } from "@/lib/utils";
import { canAccessDonorRoom } from "@/lib/donor-engine";
import { useSession } from "next-auth/react";
import type { Hotel, Room, Review, DateAvailability } from "@/types";
import type { DonorTier } from "@/types";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

export function HotelGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative h-[40dvh] md:h-[50vh] rounded-xl overflow-hidden group bg-surface">
      <Image
        src={images[index]}
        alt={`${name} — image ${index + 1}`}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <button
        onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-warm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5 text-charcoal" />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % images.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-warm md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5 text-charcoal" />
      </button>

      <span className="absolute top-3 right-3 rounded-full bg-charcoal/70 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
        {index + 1} / {images.length}
      </span>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === index ? "bg-champagne-dark w-5" : "bg-white/60"
            )}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function RoomList({
  rooms,
  hotel,
}: {
  rooms: Room[];
  hotel: Hotel;
}) {
  const { data: session } = useSession();
  const tier = (session?.user as { tier?: DonorTier })?.tier ?? null;
  const { openBooking, setDates } = useBookingStore();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();

  const standardRooms = rooms.filter((r) => !r.isDonorExclusive);
  const donorRooms = rooms.filter((r) => r.isDonorExclusive);

  const handleBook = (room: Room) => {
    if (checkIn && checkOut) setDates(checkIn, checkOut);
    openBooking(room, checkIn, checkOut);
  };

  return (
    <div className="space-y-8">
      <div className="card-surface p-4">
        <h3 className="font-display text-lg mb-3 text-charcoal">Select Dates</h3>
        <DayPicker
          mode="range"
          selected={{ from: checkIn, to: checkOut }}
          onSelect={(range) => {
            setCheckIn(range?.from);
            setCheckOut(range?.to);
          }}
          disabled={{ before: new Date() }}
          numberOfMonths={typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2}
          className="mx-auto"
        />
      </div>

      <RoomSection title="Rooms & Suites" rooms={standardRooms} onBook={handleBook} tier={tier} />
      {donorRooms.length > 0 && (
        <RoomSection
          title="Donor-Exclusive Rooms"
          rooms={donorRooms}
          onBook={handleBook}
          tier={tier}
          donor
        />
      )}
    </div>
  );
}

function RoomSection({
  title,
  rooms,
  onBook,
  tier,
  donor,
}: {
  title: string;
  rooms: Room[];
  onBook: (room: Room) => void;
  tier: DonorTier;
  donor?: boolean;
}) {
  return (
    <div>
      <h3 className="font-display text-xl md:text-2xl text-charcoal mb-4 flex items-center gap-2">
        {donor && <Crown className="h-5 w-5 text-champagne-dark" />}
        {title}
      </h3>
      <div className="space-y-4">
        {rooms.map((room) => {
          const canBook =
            !room.isFullyBooked &&
            (!room.isDonorExclusive ||
              canAccessDonorRoom(tier, room.donorTierRequired));
          return (
            <div
              key={room.id}
              className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-charcoal/10 bg-white shadow-warm hover:border-champagne-dark/30 transition-colors"
            >
              <div className="relative h-40 md:h-32 md:w-48 shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={room.images[0]}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display text-lg text-charcoal">{room.name}</h4>
                    <p className="text-sm text-muted">{room.category} · {room.bedType}</p>
                  </div>
                  <p className="font-semibold text-champagne-dark shrink-0">
                    {formatCurrency(room.pricePerNight)}
                    <span className="text-xs text-muted font-normal">/night</span>
                  </p>
                </div>
                <p className="text-sm text-muted mt-2 line-clamp-2">{room.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> Max {room.maxOccupancy}
                  </span>
                  <span>{room.sizeSqFt} sq ft</span>
                  {room.isDonorExclusive && (
                    <Badge variant="donor">Donor Exclusive</Badge>
                  )}
                </div>
                <Button
                  className="mt-3 w-full md:w-auto"
                  disabled={!canBook}
                  onClick={() => onBook(room)}
                >
                  {room.isFullyBooked
                    ? "Sold Out"
                    : room.isDonorExclusive && !canAccessDonorRoom(tier, room.donorTierRequired)
                      ? "Donor Access Required"
                      : "Book Now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {amenities.map((a) => (
        <Badge key={a} variant="secondary" className="justify-center py-2">
          {a}
        </Badge>
      ))}
    </div>
  );
}

export function AvailabilityCalendar({
  availability,
}: {
  availability: DateAvailability[];
}) {
  const statusColors = {
    available: "bg-green-500/60",
    limited: "bg-amber-500/60",
    booked: "bg-red-500/40",
  };

  return (
    <div className="card-surface p-4">
      <h3 className="font-display text-lg mb-4 text-charcoal">Availability</h3>
      <div className="flex flex-wrap gap-1">
        {availability.slice(0, 60).map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.status}`}
            className={`w-3 h-3 rounded-sm ${statusColors[d.status]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500/60" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-500/60" /> Limited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500/40" /> Booked
        </span>
      </div>
    </div>
  );
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const review = reviews[index];

  if (!review) return null;

  return (
    <div className="card-surface p-6">
      <h3 className="font-display text-lg mb-4 text-charcoal">Guest Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <blockquote className="text-charcoal/80 italic md:col-span-2">
          &ldquo;{review.text}&rdquo;
        </blockquote>
        <div>
          <p className="font-medium text-charcoal">{review.guestName}</p>
          <p className="text-sm text-muted">
            {review.city} · {review.roomType}
          </p>
        </div>
        <div className="flex md:justify-end">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
          aria-label="Previous review"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted self-center">
          {index + 1} / {reviews.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIndex((i) => (i + 1) % reviews.length)}
          aria-label="Next review"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** @deprecated Use ReviewsList */
export const ReviewsCarousel = ReviewsList;
