"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account/bookings";
  const [mode, setMode] = useState<"guest" | "donor">("guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [donorId, setDonorId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(mode, {
      email,
      ...(mode === "guest" ? { password } : { donorId }),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-charcoal/10 shadow-warm-md">
        <h1 className="font-display text-3xl text-charcoal text-center mb-2">Welcome Back</h1>
        <p className="text-sm text-muted text-center mb-8">
          Sign in to manage bookings and donor benefits
        </p>

        <div className="flex rounded-lg border border-charcoal/10 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("guest")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === "guest" ? "bg-champagne text-white" : "text-muted"
            }`}
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => setMode("donor")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === "donor" ? "bg-champagne text-white" : "text-muted"
            }`}
          >
            Donor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder={mode === "guest" ? "guest@hotelhub.com" : "priya@example.com"}
            />
          </div>

          {mode === "guest" ? (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="donorId">Donor ID</Label>
              <Input
                id="donorId"
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                required
                className="mt-1"
                placeholder="DH-2024-8842"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Demo: guest@hotelhub.com / guest123 · Donor: priya@example.com / DH-2024-8842
        </p>

        <p className="text-sm text-center mt-4 text-muted">
          <Link href="/donor-portal/login" className="text-champagne-dark hover:underline">
            Donor Portal Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 text-center text-muted">Loading...</div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
