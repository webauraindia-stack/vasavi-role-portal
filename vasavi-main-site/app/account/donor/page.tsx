"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTierInfo } from "@/lib/donor-engine";
import type { DonorTier } from "@/types";

export default function DonorBenefitsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isDonor = (session?.user as { isDonor?: boolean })?.isDonor;
  const tier = (session?.user as { tier?: DonorTier })?.tier ?? null;
  const tierInfo = getTierInfo(tier);

  useEffect(() => {
    if (session && !isDonor) {
      router.replace("/account/bookings");
    }
  }, [session, isDonor, router]);

  if (!isDonor || !tierInfo) {
    return (
      <div className="text-muted">Loading donor benefits...</div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl text-charcoal mb-6 flex items-center gap-2">
        <Crown className="h-5 w-5 text-champagne" />
        Donor Benefits
      </h2>

      <div className="card-surface rounded-xl p-6 border border-champagne/20 mb-6">
        <p className="text-sm text-muted mb-1">Your tier</p>
        <p className="font-display text-3xl text-champagne capitalize mb-2">
          {tierInfo.name}
        </p>
        <p className="text-charcoal/80">
          {tierInfo.discountPercent}% discount on all eligible bookings
        </p>
      </div>

      <h3 className="font-display text-lg text-charcoal mb-3">Included Benefits</h3>
      <ul className="space-y-2 mb-8">
        {tierInfo.benefits.map((b) => (
          <li key={b} className="text-muted flex gap-2 text-sm">
            <span className="text-champagne">✦</span> {b}
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link href="/search?donorExclusive=true">
          <Button>Book Donor Room</Button>
        </Link>
        <Link href="/donor-portal">
          <Button variant="outline">Donor Portal</Button>
        </Link>
      </div>
    </div>
  );
}
