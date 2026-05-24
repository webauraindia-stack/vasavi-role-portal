/** Must match backend SIMPLE_JWT.ACCESS_TOKEN_LIFETIME (15 minutes). */
export const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

/** Refresh this long before access token expiry. */
export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

/** Background refresh interval while the portal tab is active. */
export const PROACTIVE_REFRESH_INTERVAL_MS = 13 * 60 * 1000;

export function accessTokenExpiresAt(issuedAtMs: number = Date.now()): number {
  return issuedAtMs + ACCESS_TOKEN_LIFETIME_MS;
}

export function shouldRefreshAccessToken(expiresAtMs: number | undefined | null): boolean {
  if (!expiresAtMs) return true;
  return Date.now() >= expiresAtMs - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}
