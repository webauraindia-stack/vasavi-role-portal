"use client";

import { Sparkles, Utensils, Heart } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { formatDate } from "@/lib/utils";
import { MOCK_ACTIVITIES } from "@/stores/manager-store";

const ICONS = {
  satsang: Sparkles,
  annadanam: Utensils,
  festival: Heart,
  seva: Heart,
};

export default function ActivitiesPage() {
  return (
    <>
      <DashboardHeader
        title="Community activities"
        subtitle="Satsang, annadanam, festivals, and seva aligned with Vasavi Clubs International"
      />
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_ACTIVITIES.map((a) => {
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
    </>
  );
}
