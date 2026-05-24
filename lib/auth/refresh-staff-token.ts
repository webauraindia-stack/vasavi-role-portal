import { parseApiErrorBody } from "@/lib/api/parse-error";
import type { ApiResponse } from "@/lib/api/types";
import { SessionExpiredError } from "@/lib/auth/session-expired";
import { accessTokenExpiresAt } from "@/lib/auth/token-lifetime";

type RefreshPayload = {
  access: string;
  access_expires_in?: number;
};

let inFlightRefresh: Promise<{ access: string; expiresAt: number }> | null = null;

/**
 * Exchange the httpOnly `vasavi_staff_refresh` cookie for a new access token.
 * Uses raw fetch (never apiFetch) to avoid refresh recursion on 401.
 */
export async function refreshStaffAccessToken(): Promise<{
  access: string;
  expiresAt: number;
}> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    const response = await fetch("/api/backend/staff/token/refresh/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: "{}",
      cache: "no-store",
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new SessionExpiredError();
    }

    if (!response.ok) {
      const parsed = parseApiErrorBody(payload);
      throw new SessionExpiredError(
        parsed?.message ?? "Your session has expired. Please sign in again."
      );
    }

    const envelope = payload as ApiResponse<RefreshPayload>;
    if (envelope.success === false || !envelope.data?.access) {
      throw new SessionExpiredError("Could not refresh session.");
    }

    const issuedAt = Date.now();
    const expiresAt =
      typeof envelope.data.access_expires_in === "number"
        ? issuedAt + envelope.data.access_expires_in * 1000
        : accessTokenExpiresAt(issuedAt);

    return { access: envelope.data.access, expiresAt };
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}
