import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FOUNDER,
  COMMUNITY_SCHEMES,
  INTERNATIONAL_PST,
  VCI_CONTACT,
  QUICK_LINKS,
} from "@/lib/data/vasavi-community";
import { HOTELS } from "@/lib/data/hotels";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "HotelHub — eleven Vasavi-affiliated boutique hotels united under the spirit of Vasavi Clubs International since 1961.",
};

export default function AboutPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <h1 className="font-display text-3xl md:text-4xl text-charcoal mb-6">
          About HotelHub
        </h1>

        <div className="space-y-4 text-charcoal/80 leading-relaxed">
          <p>
            <strong className="text-charcoal">Welcome to the Vasavi hotel community.</strong>{" "}
            HotelHub is the unified booking platform for eleven distinctive boutique hotels
            across India — from Hyderabad to Goa, Shimla to Kochi — operating in fellowship
            with the ideals of{" "}
            <a
              href={VCI_CONTACT.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne hover:underline"
            >
              Vasavi Clubs International
            </a>
            .
          </p>
          <p>
            A need was strongly felt to bring the community to a common platform. The first
            Vasavi Club was inaugurated on {FOUNDER.date} in {FOUNDER.place} by{" "}
            {FOUNDER.name} ({FOUNDER.honorific}), Freedom Fighter and Father of the Vasavi
            Movement, with {FOUNDER.foundingMembers} founding members. HotelHub extends that
            legacy through premium hospitality, donor giving, and service at every property.
          </p>
          <p>
            Our eleven hotels share one standard of excellence — heritage architecture,
            thoughtful amenities, and a commitment to giving back through KCGF education
            support, VKSP family welfare, self-employment loans, and the Sreyobhilashi
            scheme.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-charcoal mb-4">Our Collection</h2>
          <p className="text-muted text-sm mb-4">
            {HOTELS.length} properties across {new Set(HOTELS.map((h) => h.city)).size} cities
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted">
            {HOTELS.map((h) => (
              <li key={h.id}>
                <Link href={`/hotels/${h.slug}`} className="hover:text-champagne">
                  {h.name} — {h.city}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-charcoal mb-4">Community Schemes</h2>
          <ul className="space-y-2 text-sm text-muted">
            {COMMUNITY_SCHEMES.map((s) => (
              <li key={s.id}>
                <Link href={`/schemes#${s.id}`} className="hover:text-champagne">
                  {s.shortName}: {s.name.split("—")[0].trim()}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/schemes" className="text-sm text-champagne hover:underline mt-3 inline-block">
            Full scheme details →
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            International Leadership (PST)
          </h2>
          <ul className="space-y-3">
            {INTERNATIONAL_PST.map((p) => (
              <li key={p.role} className="text-sm">
                <p className="font-medium text-charcoal">{p.role}</p>
                <p className="text-muted">{p.name}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 card-surface p-6">
          <h2 className="font-display text-xl text-charcoal mb-3">Contact</h2>
          <p className="text-sm text-muted">
            Vasavi Clubs International:{" "}
            <a href={VCI_CONTACT.phoneHref} className="text-champagne hover:underline">
              {VCI_CONTACT.phone}
            </a>
          </p>
          <p className="text-sm text-muted mt-2">{VCI_CONTACT.address}</p>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold text-charcoal mb-2">Quick links (VCI)</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#hotels">
            <Button>Browse Hotels</Button>
          </Link>
          <Link href="/donors">
            <Button variant="outline">Donor Program</Button>
          </Link>
          <Link href="/founder">
            <Button variant="outline">Our Founder</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
