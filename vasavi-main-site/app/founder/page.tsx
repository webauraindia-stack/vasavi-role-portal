import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Award, BookOpen, Flag, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDER, VCI_CONTACT } from "@/lib/data/vasavi-community";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Founder — K.C. Gupta",
  description:
    "Late Vn. Kalvakuntla Chandrasena Gupta (K.C. Gupta), Freedom Fighter and Founder of the Vasavi Movement. First Vasavi Club, Hyderabad, 1 October 1961.",
  openGraph: {
    title: "K.C. Gupta — Founder of the Vasavi Movement",
    description:
      "Freedom fighter, publisher, and founder of Vasavi Club Hyderabad in 1961.",
    images: [{ url: "/images/founder-kcg.jpg", alt: FOUNDER.fullName }],
  },
};

export default function FounderPage() {
  return (
    <div className="pt-16 bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-champagne/15 bg-surface">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(var(--color-champagne)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-14 lg:items-center">
            <div className="mx-auto w-full max-w-[340px] lg:mx-0">
              <div className="relative rounded-2xl border-4 border-champagne-dark/40 bg-white p-2 shadow-warm-lg">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={FOUNDER.image}
                    alt={FOUNDER.fullName}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 340px, 340px"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-champagne px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-warm">
                  Freedom Fighter
                </div>
              </div>
              <p className="mt-5 text-center text-sm font-semibold text-charcoal/75 lg:text-left">
                Portrait courtesy of{" "}
                <a
                  href={FOUNDER.imageSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne hover:underline"
                >
                  Vasavi Clubs International
                </a>
              </p>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-sm font-bold uppercase tracking-wide text-champagne mb-3">
                Heritage · Vasavi Movement
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight mb-2">
                {FOUNDER.honorific}
              </h1>
              <p className="font-display text-lg sm:text-xl text-champagne-dark mb-4">
                {FOUNDER.title}
              </p>
              <p className="text-base font-semibold text-charcoal/80 mb-6">
                {FOUNDER.born} — {FOUNDER.died}
              </p>
              <p className="text-base sm:text-lg font-semibold text-charcoal leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 whitespace-pre-line">
                {FOUNDER.bio}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Link href="/schemes">
                  <Button>Community Schemes</Button>
                </Link>
                <Link href="/donors">
                  <Button variant="outline">Donor Program</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-14 md:py-16 border-b border-charcoal/5">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <SectionHeading icon={Landmark} title="A Life of Service" />
          <div className="mt-8 relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-champagne/25 md:-translate-x-px" />
            <ol className="space-y-8">
              {FOUNDER.timeline.map((item, i) => (
                <li
                  key={`${item.year}-${item.title}`}
                  className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />
                  <div
                    className={`md:w-1/2 pl-10 md:pl-0 ${
                      i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                    }`}
                  >
                    <span className="absolute left-2.5 md:left-1/2 md:-translate-x-1/2 flex h-3 w-3 rounded-full bg-champagne ring-4 ring-white" />
                    <p className="font-display text-lg text-champagne">{item.year}</p>
                    <p className="font-semibold text-charcoal mt-0.5">{item.title}</p>
                    <p className="text-sm sm:text-base font-semibold text-charcoal/80 mt-1">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Bio-data */}
      <section className="py-14 md:py-16 bg-surface/60">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <SectionHeading icon={Users} title="Bio-Data" />
          <p className="text-sm text-muted mt-2 mb-8 text-center md:text-left">
            As recorded by{" "}
            <a
              href={FOUNDER.imageSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne hover:underline"
            >
              Vasavi Clubs International
            </a>
          </p>
          <dl className="grid sm:grid-cols-2 gap-4">
            {FOUNDER.personalDetails.map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-warm"
              >
                <dt className="text-xs font-bold uppercase tracking-wide text-charcoal/70">
                  {row.label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-charcoal leading-snug">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <HighlightStat label="Founded" value={String(FOUNDER.year)} />
            <HighlightStat label="First club" value={FOUNDER.place} />
            <HighlightStat label="Members" value={String(FOUNDER.foundingMembers)} />
          </div>
        </div>
      </section>

      {/* Political & Social */}
      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 grid md:grid-cols-2 gap-10">
          <ContentCard
            icon={Flag}
            title="Political Life"
            items={FOUNDER.political}
          />
          <div className="space-y-10">
            <ContentCard
              icon={Users}
              title="Organisations Founded"
              items={FOUNDER.organizationsFounded}
            />
            <ContentCard icon={Users} title="Social Roles" items={FOUNDER.socialRoles} />
          </div>
        </div>
      </section>

      {/* Publications & Awards */}
      <section className="py-14 md:py-16 bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 grid md:grid-cols-2 gap-10">
          <ContentCard
            icon={BookOpen}
            title="Publications"
            items={FOUNDER.publications}
            variant="dark"
          />
          <div className="space-y-10">
            <ContentCard icon={Award} title="Awards & Honours" items={FOUNDER.awards} variant="dark" />
            <ContentCard
              icon={BookOpen}
              title="Books Dedicated to Him"
              items={FOUNDER.booksDedicated}
              variant="dark"
            />
          </div>
        </div>
      </section>

      {/* Legacy CTA */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-4">
            His Legacy Lives On
          </h2>
          <p className="text-muted leading-relaxed mb-8">{FOUNDER.legacy}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search">
              <Button size="lg">Book a Guest House</Button>
            </Link>
            <a href={VCI_CONTACT.website} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                Visit Vasavi Clubs International
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center md:justify-start gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne/10 text-champagne">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="font-display text-2xl md:text-3xl text-charcoal">{title}</h2>
    </div>
  );
}

function HighlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4 text-center">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-charcoal/70">{label}</p>
      <p className="font-display text-xl text-champagne mt-1">{value}</p>
    </div>
  );
}

function ContentCard({
  icon: Icon,
  title,
  items,
  variant = "light",
}: {
  icon: LucideIcon;
  title: string;
  items: readonly string[];
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            isDark ? "bg-white/10 text-champagne-dark" : "bg-champagne/10 text-champagne"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className={cn("font-display text-xl", isDark ? "text-white" : "text-charcoal")}>
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "flex gap-3 text-sm sm:text-base font-semibold leading-relaxed",
              isDark ? "text-white/90" : "text-charcoal"
            )}
          >
            <span
              className={cn(
                "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                isDark ? "bg-champagne-dark" : "bg-champagne"
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
