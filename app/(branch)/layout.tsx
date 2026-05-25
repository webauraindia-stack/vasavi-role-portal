import { BranchShell } from "@/components/layout/branch-shell";

export default function BranchAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BranchShell>{children}</BranchShell>;
}
