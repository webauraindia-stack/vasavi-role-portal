"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PortalShell>{children}</PortalShell>
    </ToastProvider>
  );
}
