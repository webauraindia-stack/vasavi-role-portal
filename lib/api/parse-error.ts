import type { ApiErrorBody } from "@/lib/api/types";

/** Collect all user-facing strings from a Vasavi ``error.fields`` map. */
export function flattenApiErrorFields(
  fields?: Record<string, string[]>
): string[] {
  if (!fields) return [];
  const out: string[] = [];
  for (const messages of Object.values(fields)) {
    for (const msg of messages) {
      if (msg?.trim()) out.push(msg.trim());
    }
  }
  return out;
}

/** Prefer field messages, then ``error.message``, then *fallback*. */
export function formatApiErrorMessage(
  error: Pick<ApiErrorBody, "message" | "fields">,
  fallback = "Request failed."
): string {
  const fromFields = flattenApiErrorFields(error.fields);
  if (fromFields.length > 0) {
    return fromFields.join(" ");
  }
  const msg = error.message?.trim();
  if (msg && msg !== "Validation failed.") {
    return msg;
  }
  return fallback;
}

/** Extract error body from a Vasavi API JSON payload. */
export function parseApiErrorBody(data: unknown): ApiErrorBody | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (record.success !== false || !record.error || typeof record.error !== "object") {
    return null;
  }
  const err = record.error as Record<string, unknown>;
  const code = typeof err.code === "string" ? err.code : "SERVER_ERROR";
  const message = typeof err.message === "string" ? err.message : "Request failed.";
  let fields: Record<string, string[]> | undefined;
  if (err.fields && typeof err.fields === "object" && !Array.isArray(err.fields)) {
    fields = {};
    for (const [key, value] of Object.entries(err.fields)) {
      if (Array.isArray(value)) {
        fields[key] = value.map(String);
      } else if (value != null) {
        fields[key] = [String(value)];
      }
    }
  }
  return { code, message, fields };
}
