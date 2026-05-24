"use client";

import { create } from "zustand";
import type { StayExtensionRequest } from "@/lib/stay-extension/types";
import { refreshStaffToken } from "@/lib/api/staff-auth";
import { isJwtExpired } from "@/lib/auth/jwt";
import { useAuthStore } from "@/stores/auth-store";

async function validStaffAccessToken(): Promise<string | null> {
  let token = useAuthStore.getState().accessToken;
  if (token && !isJwtExpired(token)) return token;

  try {
    const refreshed = await refreshStaffToken();
    useAuthStore.setState({ accessToken: refreshed.access });
    return refreshed.access;
  } catch {
    return token && !isJwtExpired(token, 0) ? token : null;
  }
}

async function extensionFetchInit(init?: RequestInit): Promise<RequestInit> {
  const token = await validStaffAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return { ...init, credentials: "include", headers };
}

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
      const res = await fetch(`/api/stay-extensions${qs}`, await extensionFetchInit());
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
      const res = await fetch(
        "/api/stay-extensions",
        await extensionFetchInit({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
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
      const res = await fetch(
        "/api/stay-extensions",
        await extensionFetchInit({
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      );
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
