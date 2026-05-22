import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-charcoal/10 bg-surface px-3 py-2 text-base font-semibold text-charcoal placeholder:text-muted placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
