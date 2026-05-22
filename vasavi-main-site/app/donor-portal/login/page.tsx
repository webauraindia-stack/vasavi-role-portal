"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDonorStore } from "@/stores/donor-store";

export default function DonorPortalLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useDonorStore();
  const [email, setEmail] = useState("");
  const [donorId, setDonorId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, donorId);
    if (ok) {
      router.push("/donor-portal");
    } else {
      setError("Invalid email or Donor ID.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md card-surface rounded-2xl p-8 border border-champagne/20">
        <div className="text-center mb-8">
          <Crown className="h-10 w-10 text-champagne mx-auto mb-3" />
          <h1 className="font-display text-2xl text-charcoal">Donor Portal</h1>
          <p className="text-sm text-muted mt-1">
            Verify your credentials to access benefits
          </p>
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
              placeholder="priya@example.com"
            />
          </div>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Enter Portal"}
          </Button>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Demo: priya@example.com / DH-2024-8842
        </p>

        <p className="text-sm text-center mt-4">
          <Link href="/login" className="text-champagne hover:underline">
            Guest login instead
          </Link>
        </p>
      </div>
    </div>
  );
}
