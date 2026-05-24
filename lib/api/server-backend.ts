import type { ApiResponse } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { isJwtExpired } from "@/lib/auth/jwt";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export function bearerFromRequest(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

type ApiEnvelope<T> = { success: boolean; data?: T };

async function refreshAccessFromCookies(cookie: string): Promise<string | null> {
  for (const path of ["staff/token/refresh/", "accounts/token/refresh/"] as const) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/${path}`, {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: "{}",
        cache: "no-store",
      });
      if (!res.ok) continue;
      const payload = (await res.json()) as ApiEnvelope<{ access: string }>;
      if (payload.success && payload.data?.access) {
        return payload.data.access;
      }
    } catch {
      /* try next refresh endpoint */
    }
  }
  return null;
}

/** Non-expired bearer, or a fresh access token from refresh cookies. */
export async function resolveAccessToken(request: Request): Promise<string | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const bearer = bearerFromRequest(request);

  if (bearer && !isJwtExpired(bearer)) {
    return bearer;
  }

  if (cookie) {
    const refreshed = await refreshAccessFromCookies(cookie);
    if (refreshed) return refreshed;
  }

  return null;
}

export async function serverBackendFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {}
): Promise<T> {
  const { accessToken, headers: initHeaders, ...init } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let normalized = path.startsWith("/") ? path.slice(1) : path;
  const qIndex = normalized.indexOf("?");
  const pathname = qIndex >= 0 ? normalized.slice(0, qIndex) : normalized;
  const query = qIndex >= 0 ? normalized.slice(qIndex) : "";
  const pathnameWithSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  normalized = `${pathnameWithSlash}${query}`;

  const res = await fetch(`${BACKEND_URL}/api/v1/${normalized}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = (await res.json()) as ApiResponse<T>;
  if (isApiError(payload)) {
    throw new Error(payload.error.message);
  }
  return payload.data;
}
