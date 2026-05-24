import type { ApiResponse } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";

function apiBase(): string {
  if (typeof window === "undefined") {
    return `${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/v1`;
  }
  return "/api/backend";
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string | null; idempotencyKey?: string } = {}
): Promise<T> {
  const { accessToken, idempotencyKey, headers: initHeaders, ...init } = options;
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

  const payload = (await res.json()) as ApiResponse<T>;
  if (isApiError(payload)) {
    throw new ApiClientError(payload.error.code, payload.error.message, res.status);
  }
  return payload.data;
}
