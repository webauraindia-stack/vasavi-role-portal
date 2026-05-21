"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { MOCK_TICKETS } from "@/stores/manager-store";
import { formatDateTime } from "@/lib/utils";

export default function SupportPage() {
  return (
    <>
      <DashboardHeader
        title="Support tickets"
        subtitle="Guest requests, prasadam, checkout, and operational issues"
      />
      <div className="p-6 space-y-3 max-w-2xl">
        {MOCK_TICKETS.map((t) => (
          <div key={t.id} className="card-manager p-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-charcoal">{t.subject}</h3>
                <p className="text-xs text-muted mt-1">{t.guestName}</p>
                <p className="text-[10px] text-muted">{formatDateTime(t.createdAt)}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge
                  className={
                    t.status === "open"
                      ? "bg-amber-100 text-amber-800"
                      : t.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }
                >
                  {t.status.replace("_", " ")}
                </Badge>
                <Badge
                  className={
                    t.priority === "high"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-slate-50 text-slate-600"
                  }
                >
                  {t.priority}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
