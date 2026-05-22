"use client";

import { PortalShell } from "@/components/layout/portal-shell";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
