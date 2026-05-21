"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useAdminStore } from "@/stores/admin-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(pin)) {
      setError("Invalid Super Admin PIN");
      return;
    }
    router.push("/admin/donors");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <form onSubmit={handleSubmit} className="admin-card w-full max-w-md">
        <div className="mb-6 text-center">
          <Shield className="mx-auto h-12 w-12 text-[var(--color-admin)]" />
          <h1 className="mt-3 text-xl font-bold text-[var(--color-admin)]">
            Vasavi Super Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Donor management, benefits, and platform control
          </p>
        </div>
        <label className="block text-sm font-medium">Admin PIN</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-admin mt-4 w-full py-2.5">
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-slate-400">Demo: admin123 or vasavi</p>
        <Link href="/login" className="mt-3 block text-center text-xs text-slate-500 hover:underline">
          Hotel manager login
        </Link>
      </form>
    </div>
  );
}
