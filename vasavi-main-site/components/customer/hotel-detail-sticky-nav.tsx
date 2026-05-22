"use client";

import { Button } from "@/components/ui/button";

interface HotelDetailStickyNavProps {
  hotelName: string;
}

export function HotelDetailStickyNav({ hotelName }: HotelDetailStickyNavProps) {
  const scrollToRooms = () => {
    document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile sticky bar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-charcoal/10 px-4 py-2 flex items-center justify-between gap-3 md:hidden">
        <p className="font-display text-sm text-charcoal truncate flex-1">{hotelName}</p>
        <Button size="sm" onClick={scrollToRooms} className="shrink-0">
          Book Now
        </Button>
      </div>

      {/* Desktop subnav */}
      <nav className="hidden md:block sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-charcoal/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex items-center gap-6 h-12 text-sm">
          {[
            { id: "overview", label: "Overview" },
            { id: "amenities", label: "Amenities" },
            { id: "rooms", label: "Rooms" },
            { id: "reviews", label: "Reviews" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-muted hover:text-champagne transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Button size="sm" className="ml-auto" onClick={scrollToRooms}>
            Book Now
          </Button>
        </div>
      </nav>
    </>
  );
}
