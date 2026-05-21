"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Crown, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin-store";

const NAV = [
  { href: "/admin/donors", label: "Donor profiles", icon: Crown },
  { href: "/admin/donors/analytics", label: "Analytics & reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAdminStore((s) => s.logout);

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-admin text-white min-h-screen">
      <div className="border-b border-white/10 p-5">
        <Shield className="h-8 w-8 text-accent" />
        <p className="mt-2 font-bold">Super Admin</p>
        <p className="text-xs text-white/60">Vasavi Central Control</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-white/15 font-medium"
                : "text-white/75 hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => logout()}
        className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
