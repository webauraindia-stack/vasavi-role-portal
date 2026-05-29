"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortalProfileActions } from "@/components/layout/portal-profile-actions";
import type { PortalUser } from "@/lib/rbac";

const MobileNavContext = createContext<{ close: () => void }>({ close: () => {} });

export function useMobileNavClose() {
  return useContext(MobileNavContext).close;
}

export function PortalShellFrame({
  sidebar,
  user,
  mobileTitle = "Vasavi Portal",
  children,
}: {
  sidebar: ReactNode;
  user: PortalUser;
  mobileTitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <MobileNavContext.Provider value={{ close: () => setNavOpen(false) }}>
    <div className="flex min-h-[100dvh] w-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] transform transition-transform duration-200 ease-out lg:hidden",
          navOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        aria-hidden={!navOpen}
      >
        <div
          className={cn(
            "h-full shadow-2xl",
            navOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          {sidebar}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile app bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-beige/40 bg-white/95 px-4 backdrop-blur safe-top lg:hidden">
          <button
            type="button"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-beige/60 bg-white text-charcoal hover:bg-beige/30"
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-charcoal">
              {mobileTitle}
            </p>
            {user.role === "admin" && user.hotelName && (
              <p className="truncate text-[10px] text-muted">{user.hotelName}</p>
            )}
          </div>
          <PortalProfileActions user={user} compact />
        </header>

        {/* Desktop profile strip */}
        <div className="hidden lg:block">
          <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-end border-b border-beige/40 bg-white/90 px-4 backdrop-blur sm:px-6">
            <PortalProfileActions user={user} />
          </div>
        </div>

        <main className="min-w-0 flex-1 bg-surface">{children}</main>
      </div>
    </div>
    </MobileNavContext.Provider>
  );
}
