"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/rbac/can";
import {
  createStaffRoom,
  listRoomTypes,
  uploadRoomImage,
  type RoomTypeOption,
} from "@/lib/api/staff-rooms";
import { useAuthStore } from "@/stores/auth-store";
import { useManagerStore } from "@/stores/manager-store";

export function AddRoomDialog({
  open,
  onClose,
  branchId,
  onRoomCreated,
}: {
  open: boolean;
  onClose: () => void;
  branchId: string;
  onRoomCreated?: () => void | Promise<void>;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const refreshFromApi = useManagerStore((s) => s.refreshFromApi);

  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [pricePerNight, setPricePerNight] = useState("");
  const [description, setDescription] = useState("");
  const [operationalStatus, setOperationalStatus] = useState<
    "available" | "blocked" | "maintenance"
  >("available");
  const [isActive, setIsActive] = useState(true);
  const [donorExclusive, setDonorExclusive] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTypes = useCallback(async () => {
    if (!accessToken) return;
    try {
      const types = await listRoomTypes(accessToken);
      setRoomTypes(types);
      if (types[0] && !roomTypeId) setRoomTypeId(types[0].id);
    } catch {
      setError("Could not load room categories.");
    }
  }, [accessToken, roomTypeId]);

  useEffect(() => {
    if (open) void loadTypes();
  }, [open, loadTypes]);

  const reset = () => {
    setRoomNumber("");
    setCapacity("2");
    setPricePerNight("");
    setDescription("");
    setOperationalStatus("available");
    setIsActive(true);
    setDonorExclusive(false);
    setPhotos([]);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      setError("Not signed in.");
      return;
    }
    if (!roomNumber.trim() || !roomTypeId) {
      setError("Room number and category are required.");
      return;
    }
    const cap = Number(capacity);
    const priceRupees = Number(pricePerNight);
    if (!Number.isFinite(cap) || cap < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    if (!Number.isFinite(priceRupees) || priceRupees < 0) {
      setError("Enter a valid nightly price in rupees.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createStaffRoom(accessToken, {
        branch_id: branchId,
        room_type_id: roomTypeId,
        room_number: roomNumber.trim(),
        capacity: cap,
        base_price_per_night: Math.round(priceRupees * 100),
        is_donor_exclusive: donorExclusive,
        is_active: isActive,
        operational_status: operationalStatus,
        description: description.trim(),
      });

      for (let i = 0; i < photos.length; i++) {
        await uploadRoomImage(accessToken, created.id, photos[i], {
          isPrimary: i === 0,
        });
      }

      if (onRoomCreated) {
        await onRoomCreated();
      } else {
        await refreshFromApi(accessToken, user);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Can permission={["rooms.create", "rooms.edit"]}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          aria-label="Close"
          onClick={handleClose}
        />
        <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-beige/60 bg-white shadow-xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-beige/40 bg-white px-5 py-4">
            <h2 className="font-display text-xl text-charcoal">Add room</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-surface text-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Room number *">
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101"
                />
              </Field>
              <Field label="Category *">
                <select
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm"
                >
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Capacity (guests) *">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </Field>
              <Field label="Price per night (₹) *">
                <Input
                  type="number"
                  min={0}
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="2500"
                />
              </Field>
              <Field label="Status">
                <select
                  value={operationalStatus}
                  onChange={(e) =>
                    setOperationalStatus(
                      e.target.value as "available" | "blocked" | "maintenance"
                    )
                  }
                  className="w-full h-9 rounded-lg border border-beige/60 px-3 text-sm"
                >
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Field>
              <Field label="Listing">
                <label className="flex items-center gap-2 h-9 text-sm">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-beige"
                  />
                  Active (visible for booking)
                </label>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-beige/60 px-3 py-2 text-sm"
                placeholder="Amenities, view, bed type…"
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={donorExclusive}
                onChange={(e) => setDonorExclusive(e.target.checked)}
                className="rounded border-beige"
              />
              Donor-exclusive room
            </label>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted">Photos</p>
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-beige/60 p-6 cursor-pointer hover:border-champagne/50">
                <ImagePlus className="h-8 w-8 text-muted" />
                <span className="text-xs text-muted">JPEG, PNG or WebP · up to 5 MB each</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setPhotos((prev) => [...prev, ...files].slice(0, 8));
                  }}
                />
              </label>
              {photos.length > 0 && (
                <ul className="text-xs text-muted space-y-1">
                  {photos.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        className="text-rose-700 font-bold shrink-0"
                        onClick={() =>
                          setPhotos((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="text-sm text-rose-700">{error}</p>}

            <div className="flex gap-2 pt-2 border-t border-beige/40">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Create room"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Can>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-bold uppercase text-muted">{label}</span>
      {children}
    </label>
  );
}

export function AddRoomTrigger({
  branchId,
  onRoomCreated,
}: {
  branchId: string;
  onRoomCreated?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Can permission={["rooms.create", "rooms.edit"]}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Add room
      </Button>
      <AddRoomDialog
        open={open}
        onClose={() => setOpen(false)}
        branchId={branchId}
        onRoomCreated={onRoomCreated}
      />
    </Can>
  );
}
