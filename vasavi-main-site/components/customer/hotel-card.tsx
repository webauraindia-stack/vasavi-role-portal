"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/star-rating";
import { formatCurrency } from "@/lib/utils";
import type { Hotel } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { unsplash, U } from "@/lib/data/hotel-images";

const FALLBACK_THUMB = unsplash(U.hotelExterior);

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

export function HotelCard({ hotel, className }: HotelCardProps) {
  const { t } = useTranslation();
  const [imgSrc, setImgSrc] = useState(hotel.thumbnail);

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden bg-white shadow-warm border border-champagne/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md hover:border-champagne/60 hover:gold-glow",
        className
      )}
    >
      <Link href={`/hotels/${hotel.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={imgSrc}
          alt={`${hotel.name} — ${hotel.city}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImgSrc(FALLBACK_THUMB)}
        />
        {/* Subtle white-to-transparent gradient over image for text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {hotel.hasDonorRooms && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-champagne-dark shadow-sm border border-champagne/20">
            <Crown className="h-3 w-3 text-champagne" />
            Donor Privilege
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 gap-2 bg-gradient-to-b from-white to-surface/30">
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="font-display text-base sm:text-lg font-bold text-charcoal leading-snug line-clamp-2 group-hover:text-champagne transition-colors">
            {hotel.name}
          </h3>
        </Link>
        <p className="text-sm text-charcoal/75 font-semibold flex items-center gap-1">
          {hotel.city}
        </p>

        <div className="flex flex-col gap-1.5 mt-auto pt-2">
          <div className="flex items-center justify-between">
            <StarRating rating={hotel.starRating} size="sm" />
            <span className="text-base font-bold text-charcoal">
              {formatCurrency(hotel.startingPrice)}<span className="text-xs text-charcoal/70 font-semibold">/night</span>
            </span>
          </div>

          <Link href={`/hotels/${hotel.slug}`} className="mt-2">
            <Button variant="outline" size="sm" className="w-full h-9 bg-white hover:bg-champagne/10 hover:text-champagne-dark border-champagne/30 transition-colors">
              Explore Stay
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
