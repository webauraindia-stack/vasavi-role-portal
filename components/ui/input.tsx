import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-beige/60 bg-white px-3 text-sm font-medium focus:border-champagne focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
