"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { defaultLandingPath } from "@/lib/rbac";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("super@vasavi.org");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      const from = searchParams.get("from");
      const account = useAuthStore.getState().user;
      const fallback = account ? defaultLandingPath(account.permissions) : "/dashboard";
      const target =
        from && from !== "/login" && useAuthStore.getState().canAccess(from)
          ? from
          : fallback;
      router.push(target);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted uppercase tracking-wider">
          Email
        </label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted uppercase tracking-wider">
          Password
        </label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9"
            required
          />
        </div>
      </div>
      {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-champagne/20 to-surface p-4">
      <div className="w-full max-w-md card-manager p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-champagne/10 text-champagne">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl">Vasavi Management Portal</h1>
          <p className="text-sm text-muted">
            Super Admin portal — hotel ops, donations, CMS, finance & admin accounts
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <div className="rounded-lg bg-surface border border-beige/50 p-3 text-[10px] text-muted space-y-2 leading-relaxed">
          <p className="font-bold text-charcoal">Demo accounts</p>
          <div>
            <p className="font-semibold text-charcoal">Super Admin (full platform)</p>
            <p>super@vasavi.org / superadmin123</p>
          </div>
          <div>
            <p className="font-semibold text-charcoal">Hotel Admin (one property)</p>
            <p>hotel@vasavi.org / admin123</p>
          </div>
          <div>
            <p className="font-semibold text-charcoal">Platform modules (Super Admin)</p>
            <p>Donations: donor@vasavi.org / admin123</p>
            <p>CMS: cms@vasavi.org / admin123</p>
            <p>Finance: finance@vasavi.org / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
