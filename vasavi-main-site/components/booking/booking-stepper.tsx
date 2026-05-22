"use client";

import { cn } from "@/lib/utils";
import type { BookingStep } from "@/stores/booking-store";
import {
  Calendar,
  User,
  ShieldCheck,
  Gift,
  HeartHandshake,
  CreditCard,
  Check,
  type LucideIcon,
} from "lucide-react";

const STEPS: { num: BookingStep; label: string; icon: LucideIcon }[] = [
  { num: 1, label: "Stay", icon: Calendar },
  { num: 2, label: "Guest", icon: User },
  { num: 3, label: "Member", icon: ShieldCheck },
  { num: 4, label: "Blessings", icon: Gift },
  { num: 5, label: "Seva", icon: HeartHandshake },
  { num: 6, label: "Pay", icon: CreditCard },
  { num: 7, label: "Done", icon: Check },
];

export function BookingStepper({ step }: { step: BookingStep }) {
  return (
    <div className="px-4 pb-3 shrink-0 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-0.5 min-w-max mx-auto">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const active = step === s.num;
          const done = step > s.num;
          return (
            <StepDot
              key={s.num}
              label={s.label}
              active={active}
              done={done}
              Icon={Icon}
            />
          );
        })}
      </div>
    </div>
  );
}

function StepDot({
  label,
  active,
  done,
  Icon,
}: {
  label: string;
  active: boolean;
  done: boolean;
  Icon: LucideIcon;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-1.5",
        active ? "opacity-100" : done ? "opacity-85" : "opacity-40"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
          active
            ? "border-champagne-dark bg-champagne/10 text-champagne shadow-warm"
            : done
            ? "border-champagne-dark/60 bg-champagne-dark/15 text-champagne-dark"
            : "border-beige bg-surface text-muted"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span
        className={cn(
          "text-[9px] font-bold uppercase tracking-wider hidden sm:block",
          active ? "text-champagne" : "text-muted"
        )}
      >
        {label}
      </span>
    </div>
  );
}
