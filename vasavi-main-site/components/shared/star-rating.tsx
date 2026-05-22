"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const iconClass = sizeMap[size];

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            className={cn(
              iconClass,
              filled || half
                ? "fill-champagne text-champagne"
                : "fill-transparent text-charcoal/20"
            )}
          />
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-sm text-muted">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
