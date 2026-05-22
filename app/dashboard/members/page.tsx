"use client";

import { Users } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useManagerStore, getStoreMembers } from "@/stores/manager-store";

export default function MembersPage() {
  const { hotelId } = useHotelScope();
  const bookings = useManagerStore((s) => s.bookings);
  const members = getStoreMembers(hotelId, bookings);

  return (
    <>
      <DashboardHeader
        title="Members"
        subtitle="VCI & VKSP members with bookings at your property"
      />
      <div className="p-6">
        {members.length === 0 ? (
          <p className="text-sm text-muted">No members with bookings at this property yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="card-manager p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-champagne/10 flex items-center justify-center text-champagne">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-charcoal">{m.name}</h3>
                    <p className="text-[10px] font-mono text-muted">{m.memberId}</p>
                    <p className="text-xs text-muted mt-1">{m.clubName}</p>
                    <Badge className="mt-2 bg-violet-50 text-violet-800 border-violet-200">
                      {m.category}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted text-[9px] font-bold uppercase">Free stays</p>
                    <p className="font-bold">{m.freeStaysRemaining}</p>
                  </div>
                  <div>
                    <p className="text-muted text-[9px] font-bold uppercase">Wallet</p>
                    <p className="font-bold">{formatCurrency(m.compensationBalance)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted mt-2">{m.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
