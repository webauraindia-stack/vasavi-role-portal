"use client";

import { useEffect, useRef } from "react";
import type { Hotel } from "@/types";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

interface HotelMapProps {
  hotels: Hotel[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function HotelMap({ hotels, selectedId, onSelect, className }: HotelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current || hotels.length === 0) return;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      mapboxgl.default.accessToken = token;
      const centerLng =
        hotels.reduce((s, h) => s + h.longitude, 0) / hotels.length;
      const centerLat =
        hotels.reduce((s, h) => s + h.latitude, 0) / hotels.length;

      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [centerLng, centerLat],
        zoom: 4.5,
        touchZoomRotate: true,
        touchPitch: true,
      });

      mapRef.current = map;

      hotels.forEach((hotel) => {
        const el = document.createElement("button");
        el.className = cn(
          "w-3 h-3 rounded-full bg-champagne border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow-warm",
          selectedId === hotel.id && "ring-2 ring-charcoal scale-125"
        );
        el.setAttribute("aria-label", hotel.name);

        new mapboxgl.default.Marker({ element: el })
          .setLngLat([hotel.longitude, hotel.latitude])
          .addTo(map);

        el.addEventListener("click", () => onSelect?.(hotel.id));
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token, hotels, onSelect, selectedId]);

  if (!token) {
    return (
      <div
        className={cn(
          "h-[60dvh] lg:h-[400px] rounded-xl border border-charcoal/10 flex items-center justify-center bg-surface p-8 text-center",
          className
        )}
      >
        <p className="text-muted text-sm max-w-md">
          Map view requires a Mapbox token. Set{" "}
          <code className="text-champagne">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your
          environment to enable the interactive hotel map.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-[60dvh] lg:h-[400px] rounded-xl overflow-hidden border border-charcoal/10",
        className
      )}
      role="application"
      aria-label="Hotel locations map"
    />
  );
}
