"use client";

import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  restoring: "Restoring your session…",
  refreshing: "Refreshing secure session…",
};

/** Subtle top indicator during silent token restore/refresh. */
export function SessionStatusBar() {
  const sessionPhase = useAuthStore((s) => s.sessionPhase);
  const label = LABELS[sessionPhase];

  if (!label) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2",
        "bg-champagne/95 text-charcoal text-xs font-semibold py-1.5 shadow-sm",
        "animate-in slide-in-from-top duration-200"
      )}
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin text-champagne-dark" aria-hidden />
      {label}
    </div>
  );
}
