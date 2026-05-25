"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "@/stores/auth-store";
import { BRANCH, PLATFORM } from "@/lib/routes";

/** Super-admin route group — branch admins are sent to /branch. */
export default function PlatformGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      router.replace(BRANCH.home);
    }
  }, [user, router, pathname]);

  if (user?.role === "admin") {
    return null;
  }

  return <>{children}</>;
}
