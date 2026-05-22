"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, cn } from "@/lib/utils";
import type { RoomCategory } from "@/types";

const ROOM_TYPES: RoomCategory[] = ["Standard", "Deluxe", "Suite", "Penthouse"];

export const SEARCH_PRICE_MIN = 800;
export const SEARCH_PRICE_MAX = 10000;

export interface SearchFiltersState {
  roomTypes: RoomCategory[];
  priceRange: [number, number];
  donorExclusive: boolean;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onRoomTypesChange: (types: RoomCategory[]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onDonorExclusiveChange: (value: boolean) => void;
  onClear: () => void;
  resultCount?: number;
  isApplying?: boolean;
}

type OpenPanel = "room" | "price" | null;

export function SearchFilters({
  filters,
  onRoomTypesChange,
  onPriceRangeChange,
  onDonorExclusiveChange,
  onClear,
  resultCount,
  isApplying = false,
}: SearchFiltersProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [priceDraft, setPriceDraft] = useState<[number, number]>(filters.priceRange);
  const containerRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => setOpenPanel(null), []);

  useEffect(() => {
    if (openPanel === "price") {
      setPriceDraft(filters.priceRange);
    }
  }, [openPanel, filters.priceRange]);

  useEffect(() => {
    if (!openPanel) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPanel(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  const activeCount =
    filters.roomTypes.length +
    (filters.donorExclusive ? 1 : 0) +
    (filters.priceRange[0] !== SEARCH_PRICE_MIN || filters.priceRange[1] !== SEARCH_PRICE_MAX
      ? 1
      : 0);

  const setRoomTypeChecked = (type: RoomCategory, checked: boolean) => {
    if (checked) {
      if (!filters.roomTypes.includes(type)) {
        onRoomTypesChange([...filters.roomTypes, type]);
      }
    } else {
      onRoomTypesChange(filters.roomTypes.filter((t) => t !== type));
    }
  };

  const roomLabel =
    filters.roomTypes.length === 0
      ? "Room type"
      : filters.roomTypes.length === 1
        ? filters.roomTypes[0]
        : `${filters.roomTypes.length} types`;

  const priceActive =
    filters.priceRange[0] !== SEARCH_PRICE_MIN || filters.priceRange[1] !== SEARCH_PRICE_MAX;

  const displayPriceRange = openPanel === "price" ? priceDraft : filters.priceRange;
  const priceLabel = `${formatCurrency(displayPriceRange[0])} – ${formatCurrency(displayPriceRange[1])}`;

  const applyPrice = () => {
    const [min, max] = priceDraft;
    onPriceRangeChange([Math.min(min, max), Math.max(min, max)]);
    closePanel();
  };

  const togglePanel = (panel: OpenPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-charcoal mr-0.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </span>

        {/* Room type */}
        <div className="relative">
          <FilterTrigger
            active={filters.roomTypes.length > 0}
            open={openPanel === "room"}
            onClick={() => togglePanel("room")}
            aria-expanded={openPanel === "room"}
            aria-haspopup="listbox"
          >
            {roomLabel}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", openPanel === "room" && "rotate-180")}
            />
          </FilterTrigger>

          {openPanel === "room" && (
            <FilterPanel>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Room type
              </p>
              <div className="space-y-1" role="listbox">
                {ROOM_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface cursor-pointer min-h-11"
                  >
                    <Checkbox
                      checked={filters.roomTypes.includes(type)}
                      onCheckedChange={(checked) => setRoomTypeChecked(type, checked === true)}
                    />
                    <span className="text-base font-semibold text-charcoal">{type}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-charcoal/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => onRoomTypesChange([])}
                >
                  Clear
                </Button>
                <Button type="button" size="sm" className="flex-1" onClick={closePanel}>
                  Done
                </Button>
              </div>
            </FilterPanel>
          )}
        </div>

        {/* Price */}
        <div className="relative">
          <FilterTrigger
            active={priceActive}
            open={openPanel === "price"}
            onClick={() => togglePanel("price")}
            aria-expanded={openPanel === "price"}
            aria-haspopup="dialog"
          >
            <span className="max-w-[9.5rem] sm:max-w-none truncate">{priceLabel}</span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", openPanel === "price" && "rotate-180")}
            />
          </FilterTrigger>

          {openPanel === "price" && (
            <FilterPanel className="w-[min(100vw-2rem,20rem)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Price per night
              </p>
              <Slider
                min={SEARCH_PRICE_MIN}
                max={SEARCH_PRICE_MAX}
                step={100}
                minStepsBetweenThumbs={0}
                value={priceDraft}
                onValueChange={(v) => setPriceDraft([v[0], v[1]])}
                className="my-4"
              />
              <p className="text-sm text-charcoal text-center font-medium tabular-nums">{priceLabel}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPriceDraft([SEARCH_PRICE_MIN, SEARCH_PRICE_MAX])}
                >
                  Reset
                </Button>
                <Button type="button" size="sm" className="flex-1" onClick={applyPrice}>
                  Apply
                </Button>
              </div>
            </FilterPanel>
          )}
        </div>

        {/* Donor */}
        <button
          type="button"
          aria-pressed={filters.donorExclusive}
          onClick={() => onDonorExclusiveChange(!filters.donorExclusive)}
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2.5 text-sm font-medium transition-all min-h-11",
            filters.donorExclusive
              ? "border-champagne bg-champagne/10 text-champagne-dark"
              : "border-charcoal/15 bg-white text-charcoal hover:border-champagne/40 shadow-warm"
          )}
        >
          Donor rooms
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onClear();
              closePanel();
            }}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-muted hover:text-champagne min-h-11 px-2"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-charcoal/80 flex items-center gap-2 min-h-5">
        {isApplying ? (
          <>
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
            Updating results…
          </>
        ) : resultCount !== undefined ? (
          <>
            {resultCount} room{resultCount !== 1 ? "s" : ""} found
          </>
        ) : null}
      </p>
    </div>
  );
}

function FilterTrigger({
  children,
  active,
  open,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  open?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-all min-h-11 bg-white shadow-warm",
        active
          ? "border-champagne bg-champagne/10 text-champagne-dark"
          : "border-charcoal/15 text-charcoal hover:border-champagne/40",
        open && "ring-2 ring-champagne/30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute left-0 top-[calc(100%+0.5rem)] z-[300] w-[min(100vw-2rem,18rem)] rounded-xl border border-charcoal/10 bg-white p-4 text-charcoal shadow-warm-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
