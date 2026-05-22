"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Map } from "lucide-react";
import { HOTELS } from "@/lib/data/hotels";
import { HotelCard } from "@/components/customer/hotel-card";
import { HotelMap } from "@/components/customer/hotel-map";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AmenityTag } from "@/types";
import { cn } from "@/lib/utils";

const CITIES = Array.from(new Set(HOTELS.map((h) => h.city))).sort();
const ALL_AMENITIES = Array.from(
  new Set(HOTELS.flatMap((h) => h.amenities))
) as AmenityTag[];

const PRICE_MIN = 800;
const PRICE_MAX = 5000;

export function HotelGrid() {
  const [city, setCity] = useState<string>("all");
  const [amenities, setAmenities] = useState<AmenityTag[]>([]);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [donorOnly, setDonorOnly] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [highlightId, setHighlightId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    return HOTELS.filter((h) => {
      if (city !== "all" && h.city !== city) return false;
      if (donorOnly && !h.hasDonorRooms) return false;
      if (h.startingPrice < priceRange[0] || h.startingPrice > priceRange[1])
        return false;
      if (amenities.length > 0 && !amenities.every((a) => h.amenities.includes(a)))
        return false;
      return true;
    });
  }, [city, amenities, priceRange, donorOnly]);

  const toggleAmenity = (a: AmenityTag) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  return (
    <section id="hotels" className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-2 md:mb-3 font-bold">
            Explore recommended community stays
          </h2>
          <p className="text-base md:text-lg text-charcoal/85 max-w-xl mx-auto font-semibold leading-relaxed px-2">
            Compare simple, highly trusted temple guest houses and premium boutique hotels curated for Vysya families and spiritual pilgrims.
          </p>
        </div>

        {/* Mobile filter pills */}
        <div className="lg:hidden -mx-4 px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <FilterPill
              active={city === "all" && !donorOnly}
              onClick={() => {
                setCity("all");
                setDonorOnly(false);
              }}
            >
              All
            </FilterPill>
            {CITIES.map((c) => (
              <FilterPill key={c} active={city === c} onClick={() => setCity(c)}>
                {c}
              </FilterPill>
            ))}
            <FilterPill active={donorOnly} onClick={() => setDonorOnly(!donorOnly)}>
              Donor Rooms
            </FilterPill>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block lg:w-64 shrink-0 space-y-6">
            <FilterBlock title="City">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBlock>

            <FilterBlock title="Price per night">
              <Slider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={500}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-4"
              />
              <p className="text-sm font-semibold text-charcoal/80 mt-2">
                ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              </p>
            </FilterBlock>

            <FilterBlock title="Amenities">
              <div className="flex flex-wrap gap-2">
                {ALL_AMENITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={cn(
                      "text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors min-h-9",
                      amenities.includes(a)
                        ? "border-champagne bg-champagne/15 text-champagne-dark"
                        : "border-charcoal/15 text-muted hover:border-charcoal/30"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </FilterBlock>

            <div className="flex items-center justify-between">
              <Label htmlFor="donor-toggle" className="text-charcoal">
                Donor rooms only
              </Label>
              <Switch
                id="donor-toggle"
                checked={donorOnly}
                onCheckedChange={setDonorOnly}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-sm text-muted">
                {filtered.length} hotel{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="hidden lg:flex gap-1 rounded-lg border border-charcoal/10 p-1 bg-surface">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("map")}
                  aria-label="Map view"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    className={highlightId === hotel.id ? "ring-2 ring-champagne" : ""}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-muted py-12 col-span-full">
                    No hotels match your filters. Try adjusting your criteria.
                  </p>
                )}
              </div>
            ) : (
              <HotelMap
                hotels={filtered}
                selectedId={highlightId}
                onSelect={setHighlightId}
                className="h-[60dvh] lg:h-[500px]"
              />
            )}
          </div>
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-warm-lg lg:hidden"
        onClick={() => setView(view === "map" ? "grid" : "map")}
        aria-label={view === "map" ? "Show grid" : "Show map"}
      >
        {view === "map" ? <LayoutGrid className="h-5 w-5" /> : <Map className="h-5 w-5" />}
      </Button>

      {view === "map" && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-30 bg-white lg:hidden">
          <HotelMap
            hotels={filtered}
            selectedId={highlightId}
            onSelect={setHighlightId}
            className="h-full rounded-none border-0"
          />
        </div>
      )}
    </section>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors min-h-10",
        active
          ? "bg-charcoal text-white border-charcoal"
          : "bg-white text-charcoal border-charcoal/15 hover:border-charcoal/30"
      )}
    >
      {children}
    </button>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal mb-3">{title}</h3>
      {children}
    </div>
  );
}
