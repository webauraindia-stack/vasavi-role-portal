"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccountTypeLabel } from "@/lib/portal-profile";
import type { PortalUser } from "@/lib/rbac";

export function PortalTopBar({ user }: { user: PortalUser }) {
  const pathname = usePathname();
  const onProfile = pathname === "/profile";
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-end border-b border-beige/40 bg-white/90 px-4 backdrop-blur sm:px-6">
      <Link
        href="/profile"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold transition-colors",
          onProfile
            ? "border-champagne bg-champagne/10 text-charcoal"
            : "border-beige/60 bg-white text-charcoal hover:border-champagne/50 hover:bg-champagne/5"
        )}
        title="Your profile"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
            user.role === "super_admin"
              ? "bg-champagne text-white"
              : "bg-sidebar text-champagne-dark"
          )}
        >
          {initials || <User className="h-4 w-4" />}
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate">{user.name.split(" ")[0]}</span>
        <span className="hidden md:inline text-[10px] font-normal text-muted">
          · {getAccountTypeLabel(user)}
        </span>
      </Link>
    </div>
  );
}
