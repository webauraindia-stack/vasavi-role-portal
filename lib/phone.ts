/** Normalize to 10-digit Indian mobile for Django API. */
export function toBackendPhone(input: string): string {
  const digits = sanitizePhoneInput(input);
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export const PHONE_VALIDATION_MESSAGE =
  "Enter a valid 10-digit mobile number (must start with 6, 7, 8, or 9).";

/** 10-digit Indian mobile (6–9 leading digit). */
export function isValidIndianMobile(phone: string): boolean {
  const digits = sanitizePhoneInput(phone);
  return /^[6-9]\d{9}$/.test(digits);
}

export function validatePhoneField(
  phone: string,
  options?: { required?: boolean }
): string | null {
  const { required = true } = options ?? {};
  const digits = sanitizePhoneInput(phone);
  if (!digits) {
    return required ? PHONE_VALIDATION_MESSAGE : null;
  }
  if (!isValidIndianMobile(digits)) {
    return PHONE_VALIDATION_MESSAGE;
  }
  return null;
}
