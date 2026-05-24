import { parseApiErrorBody } from "@/lib/api/parse-error";

/**
 * End staff session: blacklist refresh token and clear httpOnly cookie.
 * Works with Bearer token and/or refresh cookie alone.
 */
export async function signOutStaff(accessToken?: string | null): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Idempotency-Key": crypto.randomUUID(),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/backend/staff/logout/", {
    method: "POST",
    credentials: "include",
    headers,
    body: "{}",
    cache: "no-store",
  });

  if (response.ok) {
    return;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Could not sign out.");
  }

  const parsed = parseApiErrorBody(payload);
  throw new Error(parsed?.message ?? "Could not sign out.");
}
