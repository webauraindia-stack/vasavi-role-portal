/** Common platform issues branch staff report (mock support — no API yet). */
export const SUPPORT_QUERY_CATEGORIES = [
  { value: "booking_sync", label: "Booking not visible / sync delay" },
  { value: "check_in_out", label: "Check-in or checkout issue" },
  { value: "payment_cash", label: "Payment or cash recording" },
  { value: "refund_cancel", label: "Refund or cancellation" },
  { value: "room_assignment", label: "Room assignment or availability" },
  { value: "stay_extension", label: "Stay extension request" },
  { value: "donor_benefit", label: "Donor / KCGF benefit or coupon" },
  { value: "guest_login", label: "Guest login / OTP / profile" },
  { value: "guest_request", label: "Guest request (prasadam, housekeeping)" },
  { value: "other", label: "Other platform issue" },
] as const;

export type SupportQueryCategory = (typeof SUPPORT_QUERY_CATEGORIES)[number]["value"];

export function categoryLabel(value: SupportQueryCategory): string {
  return SUPPORT_QUERY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
