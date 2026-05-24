import { formatApiErrorMessage, parseApiErrorBody } from "@/lib/api/parse-error";
import type { ApiResponse } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { isJwtExpired } from "@/lib/auth/jwt";
import { refreshStaffAccessToken } from "@/lib/auth/refresh-staff-token";
import { SessionExpiredError } from "@/lib/auth/session-expired";
import { shouldRefreshAccessToken } from "@/lib/auth/token-lifetime";

async function authStore() {
  const { useAuthStore } = await import("@/stores/auth-store");
  return useAuthStore.getState();
}

function apiBase(): string {
  if (typeof window === "undefined") {
    return `${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/v1`;
  }
  return "/api/backend";
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    status: number,
    fields?: Record<string, string[]>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

function throwApiClientError(
  body: { code: string; message: string; fields?: Record<string, string[]> },
  status: number,
  fallback: string
): never {
  throw new ApiClientError(
    body.code,
    formatApiErrorMessage(body, fallback),
    status,
    body.fields
  );
}

type ApiFetchOptions = RequestInit & {
  accessToken?: string | null;
  idempotencyKey?: string;
  /** Internal: prevent infinite retry on 401. */
  _authRetried?: boolean;
  /** Skip automatic token refresh (refresh endpoint itself). */
  skipAuthRefresh?: boolean;
};

function isAuthExemptPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return (
    normalized.includes("token/refresh") ||
    normalized.includes("otp/send") ||
    normalized.includes("otp/verify") ||
    normalized.includes("logout")
  );
}

async function resolveAccessToken(
  accessToken: string | null | undefined,
  skipAuthRefresh: boolean
): Promise<string | null | undefined> {
  if (!accessToken || skipAuthRefresh) {
    return accessToken;
  }

  const store = await authStore();
  const expiresAt = store.accessTokenExpires;

  if (
    isJwtExpired(accessToken) ||
    shouldRefreshAccessToken(expiresAt)
  ) {
    try {
      return await store.refreshIfNeeded({ silent: true });
    } catch {
      return null;
    }
  }

  return accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    accessToken: initialToken,
    idempotencyKey,
    headers: initHeaders,
    _authRetried = false,
    skipAuthRefresh = false,
    ...init
  } = options;

  const authExempt = skipAuthRefresh || isAuthExemptPath(path);
  const accessToken = await resolveAccessToken(initialToken, authExempt);
  const headers = new Headers(initHeaders);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (idempotencyKey) headers.set("X-Idempotency-Key", idempotencyKey);

  let normalized = path.startsWith("/") ? path.slice(1) : path;
  const qIndex = normalized.indexOf("?");
  const pathname = qIndex >= 0 ? normalized.slice(0, qIndex) : normalized;
  const query = qIndex >= 0 ? normalized.slice(qIndex) : "";
  const pathnameWithSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  normalized = `${pathnameWithSlash}${query}`;
  const res = await fetch(`${apiBase()}/${normalized}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new ApiClientError("SERVER_ERROR", "Invalid response from server.", res.status);
  }

  if (!res.ok) {
    const parsed = parseApiErrorBody(payload);
    const isAuthFailure =
      res.status === 401 &&
      accessToken &&
      !authExempt &&
      !_authRetried &&
      (parsed?.code === "AUTH_FAILED" || parsed?.code === "AUTH_REQUIRED");

    if (isAuthFailure) {
      try {
        const { access, expiresAt } = await refreshStaffAccessToken();
        (await authStore()).applyAccessToken(access, expiresAt);
        return apiFetch<T>(path, {
          ...options,
          accessToken: access,
          _authRetried: true,
        });
      } catch {
        (await authStore()).clearSessionSilently();
        throw new SessionExpiredError();
      }
    }

    if (parsed) {
      throwApiClientError(parsed, res.status, res.statusText || "Request failed.");
    }
    throw new ApiClientError(
      "SERVER_ERROR",
      res.statusText || "Request failed.",
      res.status
    );
  }

  const envelope = payload as ApiResponse<T>;
  if (isApiError(envelope)) {
    throwApiClientError(envelope.error, res.status, "Request failed.");
  }
  return envelope.data;
}
