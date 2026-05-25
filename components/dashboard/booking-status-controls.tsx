"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingStatusConfirmDialog } from "@/components/dashboard/booking-status-confirm-dialog";
import { getAvailableStatusActions, type StatusAction } from "@/lib/booking/status-workflow";
import type { ManagerBooking } from "@/lib/types";

export function BookingStatusControls({
  booking,
  disabled,
  onStatusChange,
  onRequestCancel,
}: {
  booking: ManagerBooking;
  disabled?: boolean;
  onStatusChange: (
    status: ManagerBooking["bookingStatus"],
    reason?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  onRequestCancel: () => void;
}) {
  const actions = useMemo(() => getAvailableStatusActions(booking), [booking]);
  const [selected, setSelected] = useState("");
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedAction = actions.find((a) => a.status === selected);

  if (actions.length === 0) {
    return null;
  }

  const applyUpdate = async (action: StatusAction, reason?: string) => {
    setBusy(true);
    const res = await onStatusChange(action.status, reason);
    setBusy(false);
    if (res.ok) {
      setSelected("");
      setConfirmOpen(false);
      setPendingAction(null);
    }
    return res;
  };

  return (
    <>
      <BookingStatusConfirmDialog
        open={confirmOpen}
        booking={booking}
        action={pendingAction}
        isLoading={busy || disabled}
        onClose={() => {
          if (busy) return;
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async (reason) => {
          if (!pendingAction) return;
          await applyUpdate(pendingAction, reason);
        }}
      />

      <div className="flex items-center gap-1.5">
          <select
            value={selected}
            disabled={disabled || busy}
            onChange={(e) => setSelected(e.target.value)}
            className="h-8 max-w-[160px] rounded-lg border border-beige/60 bg-white px-2 text-[10px] font-medium text-charcoal"
            aria-label="Choose next action for this booking"
          >
            <option value="">Next step…</option>
            {actions.map((a) => (
              <option key={`${a.status}-${a.label}`} value={a.status}>
                {a.label}
              </option>
            ))}
          </select>
          <Button
            variant="gold"
            size="sm"
            disabled={disabled || busy || !selectedAction}
            className="text-[10px] px-2.5 h-8"
            onClick={() => {
              if (!selectedAction) return;
              if (selectedAction.kind === "cancel") {
                onRequestCancel();
                return;
              }
              setPendingAction(selectedAction);
              setConfirmOpen(true);
            }}
          >
            {busy ? "…" : "Apply"}
          </Button>
      </div>
    </>
  );
}
