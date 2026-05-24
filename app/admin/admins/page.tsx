"use client";

import Link from "next/link";
import { ArrowRight, FileText, Heart, Shield, UserCog, Wallet } from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { ADMIN_PRESETS, PERMISSION_LABELS } from "@/lib/rbac";
import { useAuthUser } from "@/stores/auth-store";

const PLATFORM_MODULES = [
  {
    href: "/admin/donations",
    title: "Donations",
    description: "Donation programs, donor records, receipts",
    icon: Heart,
    preset: "donations",
  },
  {
    href: "/admin/cms",
    title: "CMS",
    description: "Homepage, news, gallery, pages, events",
    icon: FileText,
    preset: "cms",
  },
  {
    href: "/admin/finance",
    title: "Finance",
    description: "Transactions, revenue, refunds, payments",
    icon: Wallet,
    preset: "finance",
  },
  {
    href: "/admin/donors",
    title: "Donor management",
    description: "Full donor CRUD (included in Donations)",
    icon: Shield,
    preset: "donations",
  },
  {
    href: "/admin/admins",
    title: "Admin accounts",
    description: "Create admins and assign permissions",
    icon: UserCog,
    preset: null,
  },
];

export default function AdminsPage() {
  const user = useAuthUser();

  return (
    <PermissionGuard permission="admins.view">
      <div className="p-6 max-w-5xl">
        <h1 className="font-display text-2xl text-champagne">Admin management</h1>
        <p className="mt-1 text-sm text-muted">
          Super Admin controls platform modules from this portal. Staff accounts are
          provisioned in Django (phone OTP login) and branch assignments use the backend{" "}
          <code className="text-xs">branches/&lt;id&gt;/assign-admin/</code> API.
        </p>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Platform modules (Super Admin)
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="card-manager flex flex-col p-4 hover:border-champagne/40 transition-colors"
                >
                  <Icon className="h-6 w-6 text-champagne mb-2" />
                  <h3 className="font-bold text-charcoal">{m.title}</h3>
                  <p className="text-xs text-muted mt-1 flex-1">{m.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-champagne">
                    Open module <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card-manager p-5">
            <h2 className="font-semibold">Your session</h2>
            <p className="text-xs text-muted mt-1">Signed in via staff OTP (Django backend)</p>
            {user && (
              <ul className="mt-3 space-y-2 text-sm">
                <li className="rounded-lg bg-surface p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                  <p className="text-xs mt-1 capitalize">{user.role.replace("_", " ")}</p>
                  {user.hotelName && (
                    <p className="text-xs text-muted mt-1">Branch: {user.hotelName}</p>
                  )}
                </li>
              </ul>
            )}
          </div>

          <div className="card-manager p-5">
            <h2 className="font-semibold">Permission presets</h2>
            <p className="text-xs text-muted mt-1">
              Delegated admin roles map from backend permission strings
            </p>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              {Object.entries(ADMIN_PRESETS).map(([key, perms]) => (
                <li key={key} className="rounded-lg border border-beige/40 p-2">
                  <span className="font-bold text-charcoal capitalize">{key.replace("_", " ")}</span>
                  <span className="ml-2">
                    {perms.slice(0, 4).map((p) => PERMISSION_LABELS[p] ?? p).join(", ")}
                    {perms.length > 4 ? "…" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
