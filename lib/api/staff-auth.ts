import { apiFetch } from "@/lib/api/client";
import { toBackendPhone } from "@/lib/phone";

export type StaffUser = {
  id: string;
  phone: string;
  name: string;
  role: "admin" | "super_admin";
  branch?: { id: string; name: string; city: string } | null;
  permissions: string[];
};

export type StaffLoginResult = {
  access: string;
  user: StaffUser;
};

export async function sendStaffOtp(phone: string) {
  return apiFetch<{ ok: boolean; cooldown_seconds?: number }>("staff/otp/send/", {
    method: "POST",
    body: JSON.stringify({ phone: toBackendPhone(phone) }),
  });
}

export async function verifyStaffOtp(phone: string, otp: string) {
  return apiFetch<StaffLoginResult>("staff/otp/verify/", {
    method: "POST",
    body: JSON.stringify({ phone: toBackendPhone(phone), otp }),
    idempotencyKey: crypto.randomUUID(),
  });
}

export async function refreshStaffToken() {
  return apiFetch<{ access: string }>("staff/token/refresh/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchStaffMe(accessToken: string) {
  return apiFetch<StaffUser>("staff/me/", {
    method: "GET",
    accessToken,
  });
}

export async function staffLogout() {
  return apiFetch<{ ok: boolean }>("staff/logout/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
