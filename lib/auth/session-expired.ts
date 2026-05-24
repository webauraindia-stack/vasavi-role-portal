import { ApiClientError } from "@/lib/api/client";

/** Refresh cookie missing or invalid — redirect to login without surfacing raw API errors. */
export class SessionExpiredError extends Error {
  readonly code = "SESSION_EXPIRED";

  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status === 401 || error.code === "AUTH_FAILED";
  }
  return error instanceof SessionExpiredError;
}

export function isSessionExpiredError(error: unknown): error is SessionExpiredError {
  return error instanceof SessionExpiredError;
}
