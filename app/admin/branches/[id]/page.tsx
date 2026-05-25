"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BedDouble, Building2, UserCog, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PlatformModuleHeader } from "@/components/platform/platform-module-header";
import { BranchRoomsPanel } from "@/components/admin/branch-rooms-panel";
import {
  listStaffAdmins,
  createStaffAdmin,
  assignAdminToBranch,
  type StaffAdmin,
} from "@/lib/api/staff-admins";
import { listBranches, type BackendBranch } from "@/lib/api/branches";
import { fetchStaffMe } from "@/lib/api/staff-auth";
import { useAuthStore, useAuthUser } from "@/stores/auth-store";
import { PLATFORM } from "@/lib/routes";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type BranchTab = "overview" | "rooms" | "staff";

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = Array.isArray(params.id) ? params.id[0] : params.id;
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthUser();

  const canManageAdmins = user ? hasPermission(user.permissions, "admins.view") : false;
  const canViewRooms = user ? hasPermission(user.permissions, "rooms.view") : false;
  const isOwnBranch =
    user?.role === "admin" && user.hotelId && user.hotelId === branchId;

  const activeTab = useMemo((): BranchTab => {
    const tab = searchParams.get("tab");
    if (tab === "rooms" && canViewRooms) return "rooms";
    if (tab === "staff" && canManageAdmins) return "staff";
    if (canViewRooms && isOwnBranch) return "rooms";
    if (canManageAdmins) return "overview";
    return "rooms";
  }, [searchParams, canViewRooms, canManageAdmins, isOwnBranch]);

  const [branch, setBranch] = useState<BackendBranch | null>(null);
  const [branchAdmins, setBranchAdmins] = useState<StaffAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !branchId) return;
    if (canManageAdmins) return;
    if (canViewRooms && isOwnBranch) return;
    setAccessDenied(true);
  }, [user, branchId, canManageAdmins, canViewRooms, isOwnBranch]);

  const load = useCallback(async () => {
    if (!accessToken || !branchId) return;
    setLoading(true);
    try {
      if (isOwnBranch && user?.hotelId === branchId) {
        const me = await fetchStaffMe(accessToken);
        if (me.branch) {
          setBranch({
            id: me.branch.id,
            name: me.branch.name,
            city: me.branch.city,
            address: me.branch.address ?? "",
            phone: me.branch.phone ?? "",
            is_active: true,
          });
        }
      } else {
        const allBranches = await listBranches(accessToken);
        const currentBranch = allBranches.find((b) => b.id === branchId);
        if (currentBranch) setBranch(currentBranch);
      }

      if (canManageAdmins) {
        const allAdmins = await listStaffAdmins(accessToken);
        setBranchAdmins(allAdmins.filter((a) => a.branch?.id === branchId));
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, branchId, canManageAdmins, isOwnBranch, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user || !branchId) return;
    if (user.role === "admin" && user.hotelId && user.hotelId !== branchId) {
      router.replace(`/platform/branches/${user.hotelId}`);
    }
  }, [user, branchId, router]);

  function setTab(tab: BranchTab) {
    const url = new URL(window.location.href);
    if (tab === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !branchId) return;
    setSubmitting(true);
    setError("");
    try {
      const newAdmin = await createStaffAdmin(accessToken, { name, phone, email });
      await assignAdminToBranch(accessToken, branchId, newAdmin.id);
      setShowForm(false);
      setName("");
      setPhone("");
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not invite staff to branch.");
    } finally {
      setSubmitting(false);
    }
  }

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-red-800 font-medium">
          You do not have access to this branch.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-champagne font-bold">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading || !branch || !branchId) {
    return (
      <div className="p-6 text-sm text-muted">
        {loading ? "Loading…" : "Branch not found."}
      </div>
    );
  }

  if (isOwnBranch && canViewRooms) {
    return (
      <div className="p-6">
        <BranchRoomsPanel branchId={branchId} minimal />
      </div>
    );
  }

  return (
    <>
      <PlatformModuleHeader
        badge="Super Admin"
        title={branch.name}
        description="Branch configuration, staff, and room inventory."
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Link
          href={PLATFORM.branches}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to branches
        </Link>

        <div className="flex flex-wrap gap-1 border-b border-beige/50">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setTab("overview")}
            icon={Building2}
            label="Overview"
          />
          {canViewRooms && (
            <TabButton
              active={activeTab === "rooms"}
              onClick={() => setTab("rooms")}
              icon={BedDouble}
              label="Rooms"
            />
          )}
          {canManageAdmins && (
            <TabButton
              active={activeTab === "staff"}
              onClick={() => setTab("staff")}
              icon={UserCog}
              label="Staff admins"
            />
          )}
        </div>

        {activeTab === "overview" && (
          <div className="card-manager p-6">
            <h1 className="text-2xl font-bold text-charcoal">{branch.name}</h1>
            <p className="mt-1 text-slate-500">{branch.city}</p>
            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <span className="font-semibold text-muted">Address:</span>{" "}
                {branch.address || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-muted">Phone:</span>{" "}
                {branch.phone || "N/A"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "rooms" && canViewRooms && (
          <BranchRoomsPanel branchId={branch.id} branchName={branch.name} />
        )}

        {activeTab === "staff" && canManageAdmins && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-admin">
                <UserCog className="h-5 w-5 text-champagne" /> Branch staff admins
              </h2>
              <button
                type="button"
                className="btn-admin flex items-center gap-2"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus className="h-4 w-4" />
                {showForm ? "Cancel invite" : "Invite staff"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleInvite}
                className="admin-card space-y-3 text-sm border-champagne bg-champagne/5"
              >
                <h3 className="font-semibold text-admin flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Invite & assign to {branch.name}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="font-medium">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">Phone number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-medium">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  />
                </div>
                {error && <p className="text-red-700 font-medium">{error}</p>}
                <button type="submit" className="btn-admin text-xs" disabled={submitting}>
                  {submitting ? "Inviting…" : "Invite staff"}
                </button>
              </form>
            )}

            {branchAdmins.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No staff assigned to this branch yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {branchAdmins.map((a) => (
                  <div key={a.id} className="card-manager p-4">
                    <p className="font-bold text-charcoal">{a.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{a.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Building2;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
        active
          ? "border-champagne text-charcoal"
          : "border-transparent text-muted hover:text-charcoal"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
