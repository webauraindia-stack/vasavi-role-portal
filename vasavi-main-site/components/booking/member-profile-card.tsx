"use client";

import Image from "next/image";
import { ShieldCheck, MapPin, Calendar, Heart } from "lucide-react";
import type { CommunityMemberProfile } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function MemberProfileCard({
  profile,
  compact,
}: {
  profile: CommunityMemberProfile;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-beige/50 overflow-hidden bg-white shadow-warm">
      <div className="relative h-20 bg-gradient-to-r from-champagne/20 via-amber-50 to-surface">
        <Image
          src={profile.coverImageUrl}
          alt=""
          fill
          className="object-cover opacity-40 mix-blend-multiply"
          sizes="600px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
      </div>

      <div className={cn("px-4 pb-4", compact ? "-mt-8" : "-mt-10")}>
        <div className="flex gap-3 items-end">
          <div className="relative w-16 h-16 rounded-2xl border-3 border-white shadow-warm overflow-hidden shrink-0 bg-surface">
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="pb-1 min-w-0">
            <p className="font-display font-bold text-charcoal leading-tight truncate">
              {profile.name}
            </p>
            <p className="text-[10px] font-bold text-champagne uppercase tracking-wider">
              {profile.categoryLabel}
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-champagne-dark shrink-0 ml-auto mb-1" />
        </div>

        {!compact && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <Info icon={MapPin} label="Club" value={profile.clubName} />
            <Info icon={Calendar} label="Member ID" value={profile.displayId} mono />
            <Info
              icon={Heart}
              label="Contribution"
              value={profile.contributionLevel}
              className="col-span-2"
            />
            <div className="col-span-2 flex gap-2 flex-wrap pt-1">
              {profile.freeStaysRemaining > 0 && (
                <BadgePill>{profile.freeStaysRemaining} free stays left</BadgePill>
              )}
              {profile.compensationWallet > 0 && (
                <BadgePill tone="emerald">
                  {formatCurrency(profile.compensationWallet)} wallet
                </BadgePill>
              )}
              <BadgePill tone="muted">
                {profile.bookingHistoryCount} past stays · since{" "}
                {formatDate(profile.memberSince)}
              </BadgePill>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  mono,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5 items-start", className)}>
      <Icon className="h-3.5 w-3.5 text-champagne shrink-0 mt-0.5" />
      <div>
        <p className="text-muted font-semibold uppercase text-[9px] tracking-wider">{label}</p>
        <p className={cn("font-semibold text-charcoal leading-snug", mono && "font-mono text-[10px]")}>
          {value}
        </p>
      </div>
    </div>
  );
}

function BadgePill({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "emerald" | "muted";
}) {
  const tones = {
    gold: "bg-amber-50 text-amber-900 border-amber-200/60",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    muted: "bg-surface text-muted border-beige/50",
  };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
