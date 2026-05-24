"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/stores/auth-store";
import { branchRoomsHref } from "@/lib/rbac";

/** Legacy route — rooms are managed per branch. */
export default function RoomsRedirectPage() {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin" && user.hotelId) {
      router.replace(branchRoomsHref(user.hotelId));
      return;
    }
    router.replace("/admin/branches");
  }, [user, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
      Redirecting to branch rooms…
    </div>
  );
}
