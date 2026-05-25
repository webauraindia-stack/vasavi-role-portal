"use client";

import { BranchRoomsPanel } from "@/components/admin/branch-rooms-panel";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAuthUser } from "@/stores/auth-store";

export default function BranchPropertyPage() {
  const user = useAuthUser();
  const branchId = user?.hotelId;

  if (!branchId) {
    return (
      <div className="p-6 text-sm text-muted">
        Your account is not linked to a property. Contact your administrator.
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Rooms"
        subtitle={user?.hotelName ?? "Your property"}
        hidePropertyBar
      />
      <div className="p-6">
        <BranchRoomsPanel branchId={branchId} branchName={user?.hotelName} minimal />
      </div>
    </>
  );
}
