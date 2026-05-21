"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useManagerStore } from "@/stores/manager-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useManagerStore((s) => s.login);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      router.push("/dashboard");
    } else {
      setError("Invalid PIN. Demo: 1234 or vasavi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-champagne/20 to-surface p-4">
      <div className="w-full max-w-md card-manager p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-champagne/10 text-champagne">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl">Vasavi Hotel Manager</h1>
          <p className="text-sm text-muted">
            Secure operations portal for temple-town guest houses · Vasavi Clubs
            International
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">
              Manager PIN
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                className="pl-9"
                autoComplete="current-password"
              />
            </div>
          </div>
          {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}
          <Button type="submit" className="w-full">
            Sign in to dashboard
          </Button>
        </form>

        <p className="text-[10px] text-center text-muted leading-relaxed">
          Demo credentials: PIN <strong>1234</strong> or <strong>vasavi</strong>
          <br />
          Separate from public site (vasavi-main-site on port 3000)
        </p>
      </div>
    </div>
  );
}
