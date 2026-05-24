"use client";

import { Sparkles, Utensils, Heart } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { formatDate } from "@/lib/utils";
import { getStoreActivities } from "@/stores/manager-store";

const ICONS = {
  satsang: Sparkles,
  annadanam: Utensils,
  festival: Heart,
  seva: Heart,
};

export default function ActivitiesPage() {
  const { hotelId } = useHotelScope();
  const activities = getStoreActivities();

  return (
    <>
      <DashboardHeader
        title="Community activities"
        subtitle="Satsang, annadanam, festivals, and seva at your property"
      />
      <div className="p-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted">
            No community activities in the API yet — events will appear here when wired.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => {
              const Icon = ICONS[a.type] ?? Sparkles;
              return (
                <div key={a.id} className="card-manager p-5">
                  <Icon className="h-6 w-6 text-champagne mb-3" />
                  <h3 className="font-display text-base font-bold">{a.title}</h3>
                  <p className="text-xs text-muted mt-2 capitalize">{a.type}</p>
                  <p className="text-sm font-semibold mt-2">{formatDate(a.date)}</p>
                  <p className="text-xs text-muted mt-1">{a.attendees} expected attendees</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
