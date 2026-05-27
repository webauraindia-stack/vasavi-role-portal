"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building } from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import {
  listBranches,
  createBranch,
  type BackendBranch,
} from "@/lib/api/branches";
import { useAuthStore } from "@/stores/auth-store";
import { PhoneInput } from "@/components/ui/phone-input";
import { validatePhoneField, toBackendPhone } from "@/lib/phone";

export default function BranchesAdminPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [branches, setBranches] = useState<BackendBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const rows = await listBranches(accessToken);
      setBranches(rows);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const validation = validatePhoneField(phone);
    if (validation) {
      setPhoneError(validation);
      return;
    }
    setPhoneError("");
    setSubmitting(true);
    setError("");
    try {
      await createBranch(accessToken, {
        name,
        city,
        address,
        phone: toBackendPhone(phone),
      });
      setShowForm(false);
      setName("");
      setCity("");
      setAddress("");
      setPhone("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create branch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PermissionGuard permission="admins.view">
      <PlatformModuleHeader
        badge="Super Admin"
        title="Branch management"
        description="Add and view all Vasavi branches."
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-admin" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4 inline" />
            {showForm ? "Cancel" : "New branch"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="admin-card space-y-3 text-sm">
            <h2 className="font-semibold text-admin">Create Branch</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="font-medium">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-medium">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="font-medium">Phone</label>
              <PhoneInput
                id="branch-phone"
                variant="admin"
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  if (phoneError) setPhoneError("");
                }}
                error={phoneError}
                required
              />
            </div>
            {error && <p className="text-red-700">{error}</p>}
            <button type="submit" className="btn-admin text-xs" disabled={submitting}>
              {submitting ? "Creating…" : "Create Branch"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-semibold text-admin">
              <Building className="h-5 w-5" /> All Branches
            </h2>
            {branches.length === 0 ? (
              <p className="text-sm text-slate-500">No branches found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {branches.map((b) => (
                  <Link
                    href={`/platform/branches/${b.id}?tab=rooms`}
                    key={b.id}
                    className="admin-card text-sm flex flex-col justify-between hover:border-champagne transition-colors"
                  >
                    <div>
                      <p className="font-bold text-lg text-charcoal">{b.name}</p>
                      <p className="text-slate-500 font-medium">{b.city}</p>
                      <p className="mt-2 text-slate-600 line-clamp-2">{b.address}</p>
                      <p className="mt-1 text-slate-500">{b.phone}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </PermissionGuard>
  );
}
