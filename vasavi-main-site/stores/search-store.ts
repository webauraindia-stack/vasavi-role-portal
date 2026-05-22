import { create } from "zustand";
import type { GuestCount, SearchFilters } from "@/types";

interface SearchState {
  hotelId: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestCount;
  filters: SearchFilters;

  setHotel: (id: string | null) => void;
  setDates: (checkIn: Date | null, checkOut: Date | null) => void;
  setGuests: (guests: Partial<GuestCount>) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  hotels: [],
  roomTypes: [],
  priceMin: 2000,
  priceMax: 15000,
  guests: { adults: 2, children: 0, rooms: 1 },
  amenities: [],
  donorExclusive: false,
};

export const useSearchStore = create<SearchState>((set, get) => ({
  hotelId: null,
  checkIn: null,
  checkOut: null,
  guests: { adults: 2, children: 0, rooms: 1 },
  filters: defaultFilters,

  setHotel: (hotelId) => set({ hotelId }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setGuests: (guests) =>
    set({ guests: { ...get().guests, ...guests } }),
  setFilters: (filters) =>
    set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({ filters: defaultFilters }),
}));
