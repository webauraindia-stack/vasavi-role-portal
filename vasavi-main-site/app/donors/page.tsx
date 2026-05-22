import type { Metadata } from "next";
import Link from "next/link";
import { Crown, GraduationCap, Users, Briefcase } from "lucide-react";
import { TIER_THRESHOLDS } from "@/lib/donor-engine";
import {
  COMMUNITY_SCHEMES,
  DONOR_PROGRAM_INTRO,
  HOW_TO_JOIN_STEPS,
  FOUNDER,
  VCI_CONTACT,
} from "@/lib/data/vasavi-community";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchemeCard } from "@/components/customer/scheme-card";
import { DonationForm } from "@/components/customer/donation-form";

export const metadata: Metadata = {
  title: "Donor Program — KCGF & Community Schemes",
  description:
    "Support Vasavi community schemes (KCGF, VKSP, Sreyobhilashi) through HotelHub and unlock exclusive hotel stays and tiered discounts.",
};

const perks = [
  {
    icon: GraduationCap,
    title: "KCGF Education Corpus",
    description:
      "Strengthen the K.C. Gupta Fellow fund for student aid, notebooks, and scholarships.",
  },
  {
    icon: Users,
    title: "VKSP Family Welfare",
    description:
      "Support Vasavi Kutumba Suraksha Padhakam for members and their families.",
  },
  {
    icon: Briefcase,
    title: "Self Employment & Sreyobhilashi",
    description:
      "Fund interest-free loans and donation-driven enterprise for backward families.",
  },
  {
    icon: Crown,
    title: "Exclusive Hotel Stays",
    description:
      "Access donor-only rooms, 10–50% discounts, and priority service at all eleven hotels.",
  },
];

export default function DonorsPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      {/* Hero */}
      <section className="relative py-14 md:py-20 overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-gradient-to-br from-champagne/10 via-white to-white" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <Badge variant="donor" className="mb-4">
            <Crown className="h-3 w-3 mr-1" />
            Vasavi Community Donors
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl text-charcoal mb-4">
            {DONOR_PROGRAM_INTRO.headline}
          </h1>
          {DONOR_PROGRAM_INTRO.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm md:text-base text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
              {p}
            </p>
          ))}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/donor-portal/login">
              <Button size="lg">Access Donor Portal</Button>
            </Link>
            <a
              href={VCI_CONTACT.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                Visit Vasavi Clubs International
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-champagne mb-2">
          In the spirit of {FOUNDER.honorific}
        </p>
        <p className="text-sm text-muted leading-relaxed">
          The first Vasavi Club was founded on {FOUNDER.date} in {FOUNDER.place} with{" "}
          {FOUNDER.foundingMembers} members. HotelHub continues this tradition of community,
          service, and fellowship through hospitality.
        </p>
        <Link href="/founder" className="text-sm text-champagne hover:underline mt-3 inline-block">
          Read our founder&apos;s story →
        </Link>
      </section>

      {/* Community schemes */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal text-center mb-2">
            Community Schemes
          </h2>
          <p className="text-sm text-muted text-center max-w-xl mx-auto mb-10">
            Aligned with{" "}
            <a
              href={VCI_CONTACT.website}
              className="text-champagne hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vasavi Clubs International
            </a>{" "}
            — your donations support education, welfare, and self-employment across the Vasavi
            community.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {COMMUNITY_SCHEMES.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/schemes">
              <Button variant="outline">View all scheme details</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {perks.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card-surface p-6 text-center">
              <Icon className="h-8 w-8 text-champagne mx-auto mb-4" />
              <h3 className="font-display text-lg text-charcoal mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_TO_JOIN_STEPS.map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-champagne text-white font-display text-xl flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-display text-lg text-charcoal mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donor tiers (KCGF-aligned) */}
      <section className="py-12 md:py-16 mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl text-charcoal text-center mb-2">
          Donor Tiers
        </h2>
        <p className="text-sm text-muted text-center mb-10 max-w-lg mx-auto">
          Contribution levels aligned with KCGF categories. Higher tiers unlock greater
          discounts and donor-exclusive room access.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {TIER_THRESHOLDS.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-xl p-6 border border-charcoal/10 bg-white shadow-warm"
            >
              <h3 className="font-display text-2xl text-charcoal capitalize mb-1">
                {tier.name}
              </h3>
              <p className="text-sm text-champagne mb-1">KCGF-aligned contribution</p>
              <p className="text-sm text-muted mb-4">
                {formatCurrency(tier.minAmount)}
                {tier.maxAmount ? ` – ${formatCurrency(tier.maxAmount)}` : "+"}
              </p>
              <p className="text-3xl font-display text-champagne mb-4">
                {tier.discountPercent}% off stays
              </p>
              <ul className="space-y-2">
                {tier.benefits.map((b) => (
                  <li key={b} className="text-sm text-muted flex items-start gap-2 leading-relaxed">
                    <span className="text-champagne mt-0.5 shrink-0">✦</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl md:text-3xl text-charcoal text-center mb-8">
          Become a Donor
        </h2>
        <DonationForm />
      </section>

      {/* Contact */}
      <section className="py-10 border-t border-charcoal/10">
        <div className="mx-auto max-w-xl px-4 text-center text-sm text-muted">
          <p>
            Questions about KCGF, VKSP, or membership? Contact Vasavi Clubs International at{" "}
            <a href={VCI_CONTACT.phoneHref} className="text-champagne hover:underline">
              {VCI_CONTACT.phone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
