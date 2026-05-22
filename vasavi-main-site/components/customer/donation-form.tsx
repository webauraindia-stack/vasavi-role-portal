"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMMUNITY_SCHEMES,
  DONATION_PRESETS,
  PAYMENT_METHODS,
} from "@/lib/data/vasavi-community";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const schema = z.object({
  amount: z.number().min(5000, "Minimum donation is ₹5,000"),
  scheme: z.string().min(1, "Select a scheme"),
  paymentMethod: z.string().min(1, "Select payment method"),
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Name required"),
});

type DonationForm = z.infer<typeof schema>;

export function DonationForm() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<DonationForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 5000,
      scheme: "kcgf",
      paymentMethod: "UPI",
      email: "",
      name: "",
    },
  });

  const onSubmit = form.handleSubmit(() => {
    setSubmitted(true);
  });

  if (submitted) {
    return (
      <div className="card-surface p-6 sm:p-8 text-center max-w-lg mx-auto">
        <p className="font-display text-xl text-charcoal mb-2">Thank you for your generosity</p>
        <p className="text-sm text-muted mb-6">
          Your contribution supports Vasavi community schemes and HotelHub donor benefits.
          You will receive a receipt and Donor ID by email within 24 hours.
        </p>
        <Link href="/donor-portal/login">
          <Button>Log in to Donor Portal</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-surface p-5 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Label className="text-charcoal">Donation amount</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {DONATION_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedPreset(amount);
                form.setValue("amount", amount);
              }}
              className={cn(
                "rounded-xl border py-3 px-2 text-center min-h-11 transition-all shadow-warm",
                selectedPreset === amount
                  ? "border-champagne bg-champagne/10 text-champagne"
                  : "border-charcoal/10 bg-white hover:border-champagne/50"
              )}
            >
              <span className="font-display text-base sm:text-lg">{formatCurrency(amount)}</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Label htmlFor="custom-amount" className="text-muted text-xs">
            Or enter custom amount (₹)
          </Label>
          <Input
            id="custom-amount"
            type="number"
            min={5000}
            step={1000}
            className="mt-1"
            {...form.register("amount", { valueAsNumber: true })}
            onChange={(e) => {
              const v = Number(e.target.value);
              form.setValue("amount", v);
              setSelectedPreset(null);
            }}
          />
          {form.formState.errors.amount && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.amount.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Designate to scheme</Label>
        <Select
          value={form.watch("scheme")}
          onValueChange={(v) => form.setValue("scheme", v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select scheme" />
          </SelectTrigger>
          <SelectContent>
            {COMMUNITY_SCHEMES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.shortName} — {s.name.split("—")[0].trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="donor-name">Full name</Label>
          <Input id="donor-name" className="mt-1" {...form.register("name")} />
        </div>
        <div>
          <Label htmlFor="donor-email">Email</Label>
          <Input id="donor-email" type="email" className="mt-1" {...form.register("email")} />
        </div>
      </div>

      <div>
        <Label>Payment method</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => form.setValue("paymentMethod", method)}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-sm min-h-11 transition-colors",
                form.watch("paymentMethod") === method
                  ? "border-champagne bg-champagne/10 text-charcoal"
                  : "border-charcoal/10 hover:border-champagne/40"
              )}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Submit Donation
      </Button>

      <p className="text-center text-sm text-muted">
        Already a donor?{" "}
        <Link href="/donor-portal/login" className="text-champagne hover:underline">
          Log in to your portal
        </Link>
      </p>
    </form>
  );
}
