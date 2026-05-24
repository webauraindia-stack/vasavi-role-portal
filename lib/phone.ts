/** Normalize to 10-digit Indian mobile for Django API. */
export function toBackendPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}
