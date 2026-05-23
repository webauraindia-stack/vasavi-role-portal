"use client";

import Link from "next/link";
import {
  Building2,
  Mail,
  Shield,
  ShieldCheck,
  User,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useAuthUser } from "@/stores/auth-store";
import { useHotelScope } from "@/hooks/use-hotel-scope";
import { navForUser } from "@/lib/rbac";
import {
  formatPermissionList,
  getAccountTypeLabel,
  getPortalAccessSummary,
  getRoleBadgeClass,
} from "@/lib/portal-profile";
import { isHotelScopedAdmin } from "@/lib/hotel-scope";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthUser();
  const logout = useAuthStore((s) => s.logout);
  const { hotelLabel, locked, viewAll } = useHotelScope();

  if (!user) return null;

  const accountType = getAccountTypeLabel(user);
  const navItems = navForUser(user.permissions);
  const permissionLabels = formatPermissionList(user.permissions);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-beige/40 bg-surface px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Account
          </p>
          <h1 className="font-display text-3xl text-charcoal mt-1">Your profile</h1>
          <p className="text-sm text-muted mt-2">
            Role, portal access, and property scope for this session
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <section className="card-manager p-6">
          <div className="flex flex-wrap items-start gap-5">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold ${
                user.role === "super_admin"
                  ? "bg-champagne text-white"
                  : "bg-sidebar text-champagne-dark"
              }`}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-charcoal">{user.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={getRoleBadgeClass(user)}>{accountType}</Badge>
                <Badge className="uppercase text-[10px] border border-beige/60 bg-white text-muted">
                  {user.role === "super_admin" ? "Platform role" : "Admin role"}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="card-manager p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-champagne" />
            <h2 className="font-display text-lg font-bold">About this portal</h2>
          </div>
          <p className="text-sm text-charcoal leading-relaxed">
            <strong>Vasavi Management Portal</strong> is the unified back-office for
            Vasavi community hotels. One login supports different admin types — each
            person only sees the modules and data their role allows.
          </p>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-surface p-3 border border-beige/40">
              <dt className="text-[10px] font-bold uppercase text-muted">Your account type</dt>
              <dd className="mt-1 font-semibold text-charcoal">{accountType}</dd>
            </div>
            <div className="rounded-lg bg-surface p-3 border border-beige/40">
              <dt className="text-[10px] font-bold uppercase text-muted">System role</dt>
              <dd className="mt-1 font-semibold text-charcoal capitalize">
                {user.role.replace("_", " ")}
              </dd>
            </div>
            <div className="rounded-lg bg-surface p-3 border border-beige/40 sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase text-muted">What you can do here</dt>
              <dd className="mt-1 text-charcoal">{getPortalAccessSummary(user)}</dd>
            </div>
          </dl>

          {user.role === "super_admin" && (
            <div className="rounded-lg border border-champagne/30 bg-champagne/5 p-4 text-sm">
              <p className="font-bold text-champagne-dark">Super Admin</p>
              <p className="mt-1 text-charcoal/90">
                You manage the entire Vasavi platform: all hotels, donor records, admin
                accounts, and platform settings. You can switch between properties in the
                header.
              </p>
            </div>
          )}

          {isHotelScopedAdmin(user) && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-sm">
              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Hotel Admin (single property)
              </p>
              <p className="mt-1 text-emerald-950/90">
                You only see bookings, rooms, guests, donors, and reports for{" "}
                <strong>{user.hotelName}</strong>. Other hotels are not visible in this
                portal.
              </p>
              <p className="mt-2 text-xs font-semibold text-emerald-800">{hotelLabel}</p>
            </div>
          )}

          {user.role === "admin" && !isHotelScopedAdmin(user) && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/80 p-4 text-sm">
              <p className="font-bold text-violet-900 flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Platform Admin (specialist)
              </p>
              <p className="mt-1 text-violet-950/90">
                You work across the platform in your assigned area (donations, CMS,
                finance, etc.) — not tied to a single hotel unless noted below.
              </p>
            </div>
          )}
        </section>

        {(locked || viewAll) && (
          <section className="card-manager p-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-muted" />
              <h2 className="font-display text-lg font-bold">Property scope</h2>
            </div>
            <p className="text-sm text-muted">
              {viewAll
                ? "You can view and switch between all Vasavi properties."
                : `Data is limited to: ${hotelLabel}`}
            </p>
          </section>
        )}

        <section className="card-manager p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="h-5 w-5 text-muted" />
            <h2 className="font-display text-lg font-bold">Your modules</h2>
            <span className="text-xs text-muted">({navItems.length} in sidebar)</span>
          </div>
          {navItems.length === 0 ? (
            <p className="text-sm text-muted">No modules assigned to this account.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-beige/40 px-3 py-2 text-sm font-semibold text-charcoal hover:border-champagne/40 hover:bg-champagne/5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-manager p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-muted" />
            <h2 className="font-display text-lg font-bold">Permissions</h2>
            <span className="text-xs text-muted">({user.permissions.length})</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {permissionLabels.map((label) => (
              <li
                key={label}
                className="rounded-full border border-beige/50 bg-surface px-2.5 py-1 text-[11px] font-medium text-charcoal"
              >
                {label}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={navForUser(user.permissions)[0]?.href ?? "/dashboard"}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-beige bg-white px-4 text-sm font-bold text-charcoal hover:bg-surface"
          >
            Back to workspace
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 border-rose-200 text-rose-800 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
