"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { validatePhoneField, toBackendPhone, isValidIndianMobile } from "@/lib/phone";
import { useAuthStore } from "@/stores/auth-store";
import { homePathForUser, resolveLegacyRedirect } from "@/lib/routes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loginWithOtp = useAuthStore((s) => s.loginWithOtp);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const validation = validatePhoneField(phone);
    if (validation) {
      setPhoneError(validation);
      return;
    }
    setPhoneError("");
    setLoading(true);
    const digits = toBackendPhone(phone);
    const result = await sendOtp(digits);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to send OTP");
      return;
    }
    setStep("otp");
    setInfo("OTP sent — check the Django server terminal (DEBUG mode).");
    setCooldown(60);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const digits = toBackendPhone(phone);
    const result = await loginWithOtp(digits, otp);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Invalid OTP");
      return;
    }
    const account = useAuthStore.getState().user;
    const from = searchParams.get("from");
    const legacyFrom = from ? resolveLegacyRedirect(from, account?.role) : null;
    const resolvedFrom = legacyFrom ?? from;
    const fallback = account ? homePathForUser(account) : "/login";
    const target =
      resolvedFrom &&
      resolvedFrom !== "/login" &&
      useAuthStore.getState().canAccess(resolvedFrom)
        ? resolvedFrom
        : fallback;
    router.push(target);
  };

  return (
    <>
      {step === "phone" ? (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider">
              Staff mobile
            </label>
            <PhoneInput
              id="staff-phone"
              value={phone}
              onChange={(v) => {
                setPhone(v);
                if (phoneError) setPhoneError("");
              }}
              error={phoneError}
              required
              className="mt-1"
            />
          </div>
          {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}
          {info && <p className="text-xs text-emerald-700">{info}</p>}
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading || !isValidIndianMobile(phone)}
          >
            <MessageCircle className="h-4 w-4" />
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted">
            Code sent to <strong>+91 {toBackendPhone(phone)}</strong>
          </p>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit OTP"
            className="text-center tracking-[0.3em] font-semibold"
            maxLength={6}
            required
          />
          {error && <p className="text-xs text-rose-700 font-semibold">{error}</p>}
          {info && <p className="text-xs text-emerald-700">{info}</p>}
          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Signing in…" : "Verify & sign in"}
          </Button>
          <div className="flex justify-between text-xs">
            <button
              type="button"
              className="text-muted hover:text-charcoal inline-flex items-center gap-1"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
            >
              <ArrowLeft className="h-3 w-3" /> Change number
            </button>
            <button
              type="button"
              className="text-champagne-dark disabled:opacity-50"
              disabled={cooldown > 0 || loading}
              onClick={() => void handleSend({ preventDefault: () => {} } as React.FormEvent)}
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
            </button>
          </div>
        </form>
      )}
    </>
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
          <h1 className="font-display text-2xl">Vasavi Staff Portal</h1>
          <p className="text-sm text-muted">
            Sign in with your registered staff mobile number
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <div className="rounded-lg bg-surface border border-beige/50 p-3 text-[10px] text-muted leading-relaxed">
          <p className="font-bold text-charcoal mb-1">Test accounts</p>
          <p>Super admin: <strong>9876543212</strong></p>
          <p>Branch admin: <strong>9876543210</strong></p>
          <p className="mt-2">OTP is printed in the Django runserver console.</p>
        </div>
      </div>
    </div>
  );
}
