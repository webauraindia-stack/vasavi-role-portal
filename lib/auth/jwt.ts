/** Buffer before JWT expiry — match backend 15m access token. */
const REFRESH_BUFFER_MS = 60 * 1000;

export function getJwtExpiryMs(accessToken: string): number | null {
  try {
    const segment = accessToken.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64").toString("utf8")
        : atob(base64);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(
  accessToken: string,
  bufferMs: number = REFRESH_BUFFER_MS
): boolean {
  const expMs = getJwtExpiryMs(accessToken);
  if (!expMs) return false;
  return Date.now() >= expMs - bufferMs;
}
