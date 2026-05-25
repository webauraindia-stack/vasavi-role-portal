import { ApiClientError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/api/parse-error";

const FRIENDLY_PATTERNS: { test: RegExp; message: string }[] = [
  {
    test: /cannot be cancel/i,
    message:
      "This booking cannot be cancelled at its current stage. Use the status menu to see what is allowed, or check the guest out if they have already arrived.",
  },
  {
    test: /cannot transition/i,
    message:
      "That status change is not allowed right now. Pick an action from the list for this booking’s current stage.",
  },
  {
    test: /cash payment has not been recorded/i,
    message:
      "Please record the guest’s payment at the desk before checking them in.",
  },
  {
    test: /cannot check in before/i,
    message:
      "Check-in is only available on or after the scheduled arrival date.",
  },
  {
    test: /reason is required/i,
    message: "Please enter a short reason before continuing.",
  },
  {
    test: /already paid|pending refund/i,
    message: "Payment for this booking has already been handled.",
  },
  {
    test: /not found/i,
    message: "This booking could not be found. Refresh the page and try again.",
  },
  {
    test: /permission|out of branch/i,
    message: "You do not have access to change bookings for this property.",
  },
];

function matchFriendly(raw: string): string | null {
  for (const { test, message } of FRIENDLY_PATTERNS) {
    if (test.test(raw)) return message;
  }
  return null;
}

/** Turn API / network errors into clear staff-facing copy. */
export function friendlyBookingError(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) {
    const raw = formatApiErrorMessage(
      { message: err.message, fields: err.fields },
      fallback
    );
    return matchFriendly(raw) ?? raw;
  }
  if (err instanceof Error && err.message.trim()) {
    const raw = err.message.trim();
    return matchFriendly(raw) ?? raw;
  }
  return fallback;
}
