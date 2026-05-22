import type { Metadata } from "next";
import Link from "next/link";
import { COMMUNITY_SCHEMES, VCI_CONTACT } from "@/lib/data/vasavi-community";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Community Schemes",
  description:
    "KCGF, VKSP, Vasavi Saraswathi Padhakam, Self Employment, Sreyobhilashi, and VKSP Senior — Vasavi Clubs International schemes supported through HotelHub.",
};

export default function SchemesPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl text-charcoal mb-4">
            Schemes Details
          </h1>
          <p className="text-muted leading-relaxed">
            HotelHub donations and donor contributions support the same community schemes
            administered by{" "}
            <a
              href={VCI_CONTACT.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne hover:underline"
            >
              Vasavi Clubs International
            </a>
            . Below is a summary of each program and how your hospitality giving makes an
            impact.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-16">
        {COMMUNITY_SCHEMES.map((scheme) => (
          <article
            key={scheme.id}
            id={scheme.id}
            className="scroll-mt-24 border-b border-charcoal/10 pb-12 last:border-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-champagne mb-2">
              {scheme.shortName}
            </p>
            <h2 className="font-display text-2xl text-charcoal mb-4">{scheme.name}</h2>
            <p className="text-sm text-muted leading-relaxed mb-4">{scheme.summary}</p>
            <p className="text-base text-charcoal/80 leading-relaxed whitespace-pre-line mb-6">
              {scheme.description}
            </p>
            <div className="card-surface p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted mb-1">HotelHub benefit</p>
              <p className="text-sm text-charcoal">{scheme.hotelBenefit}</p>
            </div>
            <a
              href={scheme.readMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-champagne hover:underline"
            >
              Read more on vasaviclubs.org →
            </a>
          </article>
        ))}
      </div>

      <div className="text-center px-4 pb-8">
        <Link href="/donors">
          <Button size="lg">Become a Donor</Button>
        </Link>
      </div>
    </div>
  );
}
