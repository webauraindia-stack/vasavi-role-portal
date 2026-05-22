"use client";

import Link from "next/link";
import { ArrowRight, FileText, Heart, Shield, UserCog, Wallet } from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { ADMIN_PRESETS, PERMISSION_LABELS } from "@/lib/rbac";
import { DEMO_ACCOUNTS } from "@/lib/rbac/users";
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
          Super Admin controls all platform modules — Donations, CMS, Finance, and hotel
          operations — from this portal.
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
            <h2 className="font-semibold">Delegated admin accounts</h2>
            <p className="text-xs text-muted mt-1">
              Specialist logins for Donations, CMS, and Finance (managed by Super Admin)
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(DEMO_ACCOUNTS)
                .filter(([, a]) => a.user.role === "admin")
                .map(([email, a]) => (
                  <li key={email} className="rounded-lg bg-surface p-3">
                    <p className="font-medium">{a.user.name}</p>
                    <p className="text-xs text-muted">{email}</p>
                    <p className="text-xs mt-1">{a.user.permissions.length} permissions</p>
                  </li>
                ))}
            </ul>
          </div>
          <div className="card-manager p-5">
            <h2 className="font-semibold">Permission presets</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(ADMIN_PRESETS).map(([key, perms]) => (
                <li key={key} className="border-b border-beige/30 pb-2">
                  <span className="font-medium capitalize">{key.replace("_", " ")}</span>
                  <span className="text-muted"> — {perms.length} permissions</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {user?.role === "super_admin" && (
          <div className="mt-6 card-manager p-5">
            <h2 className="font-semibold">
              All permissions ({Object.keys(PERMISSION_LABELS).length})
            </h2>
            <p className="text-xs text-muted mt-1">
              {user.name} has unrestricted access to Donations, CMS, Finance, hotels, and
              settings.
            </p>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
