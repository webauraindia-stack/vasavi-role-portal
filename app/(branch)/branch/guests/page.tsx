"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Phone, User } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { useAuthStore, useAuthUser } from "@/stores/auth-store";
import { useManagerStore, getStoreBookings } from "@/stores/manager-store";
import { formatDate } from "@/lib/utils";
import { PageContent } from "@/components/layout/page-content";

type GuestRow = {
  key: string;
  name: string;
  phone: string;
  lastStay: string;
  bookingCount: number;
};

export default function GuestsPage() {
  const { hotelId, locked } = useHotelScope();
  const { bookings, refreshFromApi } = useManagerStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthUser();

  useEffect(() => {
    if (accessToken) void refreshFromApi(accessToken, user);
  }, [accessToken, refreshFromApi, user]);

  const scopedBookings = useMemo(
    () => getStoreBookings(hotelId, bookings),
    [bookings, hotelId]
  );

  const guests = useMemo(() => {
    const map = new Map<string, GuestRow>();
    for (const b of scopedBookings) {
      const phone = (b.guestPhone || "").trim();
      const name = (b.guestName || "Guest").trim();
      const key = phone || name.toLowerCase();
      if (!key) continue;
      const existing = map.get(key);
      const checkOut = b.checkOut;
      if (!existing) {
        map.set(key, {
          key,
          name,
          phone: phone || "—",
          lastStay: checkOut,
          bookingCount: 1,
        });
      } else {
        existing.bookingCount += 1;
        if (checkOut > existing.lastStay) {
          existing.lastStay = checkOut;
          existing.name = name || existing.name;
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastStay.localeCompare(a.lastStay));
  }, [scopedBookings]);

  return (
    <>
      <DashboardHeader
        title="Guests"
        subtitle="Guests derived from branch bookings — name, phone, and last stay"
        hidePropertyBar={locked}
      />
      <PageContent tight className="space-y-4">
        {guests.length === 0 ? (
          <div className="card-manager p-8 text-center text-sm text-muted">
            No guest records yet for this scope. Guests appear after bookings are created.
          </div>
        ) : (
          <div className="card-manager overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-surface/80 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-bold">Guest</th>
                  <th className="px-4 py-3 font-bold">Phone</th>
                  <th className="px-4 py-3 font-bold">Bookings</th>
                  <th className="px-4 py-3 font-bold">Last checkout</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.key} className="border-b border-charcoal/5 hover:bg-surface/40">
                    <td className="px-4 py-3 font-semibold text-charcoal">
                      <span className="inline-flex items-center gap-2">
                        <User className="h-4 w-4 text-champagne shrink-0" />
                        {g.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {g.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3">{g.bookingCount}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(g.lastStay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
        <p className="text-xs text-muted">
          Open{" "}
          <Link href="/branch/bookings" className="text-champagne font-semibold hover:underline">
            Bookings
          </Link>{" "}
          for full reservation detail.
        </p>
      </PageContent>
    </>
  );
}
