"use client";

import { create } from "zustand";
import type { StayExtensionRequest } from "@/lib/stay-extension/types";

interface ExtensionState {
  requests: StayExtensionRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: (hotelId?: string) => Promise<void>;
  createRequest: (payload: {
    bookingReference: string;
    requestedCheckOut: string;
    paymentMethod?: "upi" | "card" | "netbanking";
    selectedAlternativeRoomId?: string;
    actorEmail?: string;
  }) => Promise<StayExtensionRequest | null>;
  patchRequest: (payload: {
    id: string;
    action: "approve" | "reject" | "waive" | "complete_payment" | "suggest_alternative";
    actor?: string;
    actorRole?: string;
    rejectionReason?: string;
    waivedAmount?: number;
    adminNote?: string;
    paymentTransactionId?: string;
  }) => Promise<StayExtensionRequest | null>;
}

export const useExtensionStore = create<ExtensionState>((set) => ({
  requests: [],
  loading: false,
  error: null,

  fetchRequests: async (hotelId) => {
    set({ loading: true, error: null });
    try {
      const qs = hotelId && hotelId !== "all" ? `?hotelId=${hotelId}` : "";
      const res = await fetch(`/api/stay-extensions${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load extensions");
      set({ requests: json.data ?? [], loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load extensions",
      });
    }
  },

  createRequest: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/stay-extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create extension");
      const created = json.data as StayExtensionRequest;
      set((s) => ({
        requests: [created, ...s.requests.filter((r) => r.id !== created.id)],
        loading: false,
      }));
      return created;
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to create extension",
      });
      return null;
    }
  },

  patchRequest: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/stay-extensions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update extension");
      const updated = json.data as StayExtensionRequest;
      set((s) => ({
        requests: s.requests.map((r) => (r.id === updated.id ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to update extension",
      });
      return null;
    }
  },
}));
