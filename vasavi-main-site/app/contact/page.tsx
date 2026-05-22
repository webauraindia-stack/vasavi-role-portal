import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VCI_CONTACT, QUICK_LINKS } from "@/lib/data/vasavi-community";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact HotelHub and Vasavi Clubs International for bookings, donations, and membership.",
};

export default function ContactPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <h1 className="font-display text-3xl md:text-4xl text-charcoal mb-6">Contact Us</h1>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <ContactCard
            icon={Phone}
            title="Vasavi Clubs International"
            lines={[
              <a key="p" href={VCI_CONTACT.phoneHref} className="text-champagne hover:underline text-lg">
                {VCI_CONTACT.phone}
              </a>,
            ]}
          />
          <ContactCard
            icon={MapPin}
            title="Headquarters"
            lines={[VCI_CONTACT.address]}
          />
          <ContactCard
            icon={ExternalLink}
            title="Official website"
            lines={[
              <a
                key="w"
                href={VCI_CONTACT.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-champagne hover:underline"
              >
                vasaviclubs.org
              </a>,
            ]}
          />
          <ContactCard
            icon={Mail}
            title="HotelHub bookings"
            lines={[
              <Link key="b" href="/search" className="text-champagne hover:underline">
                Search & book rooms online
              </Link>,
              <Link key="d" href="/donors" className="text-champagne hover:underline block mt-1">
                Donor program & KCGF
              </Link>,
            ]}
          />
        </div>

        <div className="card-surface p-6 md:p-8 mb-12">
          <h2 className="font-display text-xl text-charcoal mb-4">Send a message</h2>
          <form className="space-y-4" action="#" method="post">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="flex w-full rounded-lg border border-charcoal/10 bg-surface px-3 py-2 text-base text-charcoal mt-1 min-h-[8rem]"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </div>

        <section>
          <h2 className="font-display text-lg text-charcoal mb-3">VCI resources</h2>
          <ul className="space-y-2 text-sm text-muted">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: React.ReactNode[];
}) {
  return (
    <div className="card-surface p-5">
      <Icon className="h-5 w-5 text-champagne mb-3" />
      <h3 className="font-display text-lg text-charcoal mb-2">{title}</h3>
      <div className="text-sm text-muted space-y-1">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
