"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HotelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-32 pb-16 text-center px-4">
      <h1 className="font-display text-3xl text-charcoal mb-4">Something went wrong</h1>
      <p className="text-muted mb-8 max-w-md mx-auto">
        We couldn&apos;t load this hotel. Please try again or browse our collection.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
