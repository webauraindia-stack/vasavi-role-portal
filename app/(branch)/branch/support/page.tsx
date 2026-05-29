"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { CreateSupportTicketDialog } from "@/components/support/create-support-ticket-dialog";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { createSupportTicket, listSupportTickets } from "@/lib/api/support";
import type { SupportTicket } from "@/lib/types";

export default function SupportPage() {
  const { hotelId } = useHotelScope();
  const toast = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!accessToken) {
      setTickets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void listSupportTickets(accessToken)
      .then((rows) => {
        if (!cancelled) setTickets(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          toastRef.current.error(
            err instanceof Error ? err.message : "Could not load support tickets."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const scopedTickets = useMemo(() => {
    const scoped =
      hotelId === "all"
        ? tickets
        : tickets.filter((t) => t.hotelId === hotelId || t.hotelId === "all");
    return [...scoped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tickets, hotelId]);

  const handleSubmit = async (ticket: SupportTicket) => {
    if (!accessToken) {
      toast.error("Not signed in.");
      return;
    }
    try {
      const created = await createSupportTicket(accessToken, {
        subject: ticket.subject,
        description: ticket.description,
        guest_name: ticket.guestName,
        category: ticket.category,
        booking_reference: ticket.bookingReference,
        priority: ticket.priority,
        hotel_id: ticket.hotelId === "all" ? null : ticket.hotelId,
      });
      setTickets((prev) => [created, ...prev]);
      toast.success("Ticket created", "Your report was saved to the platform.");
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create ticket.");
    }
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
              {loading
                ? "Loading…"
                : scopedTickets.length === 0
                  ? "No tickets yet"
                  : `${scopedTickets.length} ticket${scopedTickets.length === 1 ? "" : "s"}`}
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

        {!loading && scopedTickets.length === 0 ? (
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
            {scopedTickets.map((t) => (
              <li key={t.id} className="card-manager p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-charcoal text-sm sm:text-base">{t.subject}</h3>
                    {t.bookingReference && (
                      <p className="text-xs text-muted mt-1 font-mono break-all">
                        {t.bookingReference}
                      </p>
                    )}
                    {t.description && (
                      <p className="text-sm text-charcoal/80 mt-2 leading-relaxed line-clamp-3">
                        {t.description}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-2">
                      {t.guestName} · {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Badge className="capitalize border-charcoal/15 bg-white text-charcoal">
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge className="capitalize border-charcoal/15 bg-white text-muted">
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
        hotelId={hotelId === "all" ? "all" : hotelId}
        onClose={() => setDialogOpen(false)}
        onSubmit={(ticket) => void handleSubmit(ticket)}
      />
    </>
  );
}
