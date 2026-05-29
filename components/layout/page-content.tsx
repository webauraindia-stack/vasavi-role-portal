import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Standard responsive page padding for portal modules. */
export function PageContent({
  children,
  className,
  tight,
}: {
  children: ReactNode;
  className?: string;
  /** Slightly reduced vertical rhythm (bookings list, extensions). */
  tight?: boolean;
}) {
  return (
    <div
      className={cn(
        tight ? "page-content-tight" : "page-content",
        className
      )}
    >
      {children}
    </div>
  );
}
