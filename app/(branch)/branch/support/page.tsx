"use client";

import { useMemo, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { CreateSupportTicketDialog } from "@/components/support/create-support-ticket-dialog";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { SupportTicket } from "@/lib/types";

export default function SupportPage() {
  const { hotelId } = useHotelScope();
  const toast = useToast();
  const [mockTickets, setMockTickets] = useState<SupportTicket[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const scopedHotelId = hotelId === "all" ? "all" : hotelId;

  const tickets = useMemo(() => {
    const scoped =
      hotelId === "all"
        ? mockTickets
        : mockTickets.filter((t) => t.hotelId === hotelId || t.hotelId === "all");
    return [...scoped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [mockTickets, hotelId]);

  const handleSubmit = (ticket: SupportTicket) => {
    setMockTickets((prev) => [ticket, ...prev]);
    toast.success(
      "Ticket created (mock)",
      "Your report is saved locally. No backend call was made."
    );
  };

  return (
    <>
      <DashboardHeader
        title="Support"
        subtitle="Log platform issues — bookings, payments, rooms, donor benefits, and guest requests"
      />

      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              Your tickets
            </h2>
            <p className="text-sm text-charcoal/80 mt-0.5">
              {tickets.length === 0
                ? "No tickets yet"
                : `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create ticket
          </Button>
        </div>

        {tickets.length === 0 ? (
          <div className="card-manager p-8 sm:p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-champagne/10 text-champagne">
              <Ticket className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-base font-bold text-charcoal">No tickets yet</p>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Create a ticket when your branch hits a platform issue — booking sync, payments,
                rooms, or donor benefits.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create ticket
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li key={t.id} className="card-manager p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-charcoal text-sm sm:text-base">{t.subject}</h3>
                    {t.bookingReference && (
                      <p className="text-xs text-muted mt-1 font-mono break-all">
                        {t.bookingReference}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-1">{t.guestName}</p>
                    {t.description && (
                      <p className="text-sm text-charcoal/80 mt-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                    <p className="text-[10px] text-muted mt-2">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-1.5 sm:items-end shrink-0">
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
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateSupportTicketDialog
        open={dialogOpen}
        hotelId={scopedHotelId}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
