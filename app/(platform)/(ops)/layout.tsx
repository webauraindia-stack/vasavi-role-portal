import { OperationsShell } from "@/components/layout/operations-shell";

export default function PlatformOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperationsShell>{children}</OperationsShell>;
}
