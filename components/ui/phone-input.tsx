"use client";

import { cn } from "@/lib/utils";
import { sanitizePhoneInput, PHONE_VALIDATION_MESSAGE } from "@/lib/phone";
import { Input } from "@/components/ui/input";

export { PHONE_VALIDATION_MESSAGE };

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  /** Use native input styling (admin forms). Default uses portal Input. */
  variant?: "portal" | "admin";
  inputClassName?: string;
};

export function PhoneInput({
  id,
  value,
  onChange,
  required,
  disabled,
  placeholder = "9876543210",
  error,
  className,
  variant = "portal",
  inputClassName,
}: PhoneInputProps) {
  const borderClass = error ? "border-rose-400" : "border-beige/60";

  const field = (
    <div
      className={cn(
        "flex rounded-lg border overflow-hidden bg-white",
        borderClass,
        variant === "admin" && "mt-1",
        className
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center border-r px-3 text-sm text-muted",
          variant === "portal" ? "bg-surface border-beige/40" : "bg-slate-50 border-slate-200"
        )}
      >
        +91
      </span>
      {variant === "portal" ? (
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={value}
          onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={10}
          aria-invalid={error ? true : undefined}
          className={cn("border-0 focus-visible:ring-0 rounded-none", inputClassName)}
        />
      ) : (
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={value}
          onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={10}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-champagne/30",
            inputClassName
          )}
        />
      )}
    </div>
  );

  if (!error) return field;

  return (
    <div className="space-y-1">
      {field}
      <p className="text-xs text-rose-700 font-medium">{error}</p>
    </div>
  );
}
