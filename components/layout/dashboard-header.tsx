"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useManagerStore } from "@/stores/manager-store";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardHeader({
  title,
  subtitle,
  hidePropertyBar = false,
  actions,
}: {
  title: string;
  subtitle?: string;
  hidePropertyBar?: boolean;
  actions?: React.ReactNode;
}) {
  const { hotelId, viewAll, setHotelId, branches } = useHotelScope();
  const user = useAuthStore((s) => s.user);
  const withAccessToken = useAuthStore((s) => s.withAccessToken);
  const isRefreshing = useManagerStore((s) => s.isRefreshing);
  const dataError = useManagerStore((s) => s.dataError);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);

  return (
    <header className="sticky top-0 z-20 border-b border-beige/40 bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:top-0">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl text-charcoal sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted sm:line-clamp-none sm:text-sm">
              {subtitle}
            </p>
          )}
          {dataError && <p className="mt-1 text-xs text-red-700">{dataError}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!hidePropertyBar && viewAll && setHotelId && (
            <select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              className="h-9 min-w-0 max-w-full flex-1 basis-[10rem] rounded-lg border border-beige/60 bg-white px-3 text-xs font-bold text-charcoal sm:max-w-none sm:flex-none"
            >
              <option value="all">All properties</option>
              {branches.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.city} — {h.name}
                </option>
              ))}
            </select>
          )}

          {actions}

          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={isRefreshing}
            onClick={() =>
              void withAccessToken((token) => refreshFromApi(token, user)).catch(() => {})
            }
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
