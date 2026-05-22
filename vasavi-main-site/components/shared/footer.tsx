"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, Twitter, Linkedin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOTELS } from "@/lib/data/hotels";
import { cn } from "@/lib/utils";

const companyLinks = [
  { href: "/donors", label: "Donor Program" },
  { href: "/schemes", label: "Community Schemes" },
  { href: "/founder", label: "Our Founder" },
  { href: "/admin", label: "ERP Admin Panel" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "https://vasaviclubs.org/", label: "Vasavi Clubs International" },
];

const social = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Linkedin, label: "LinkedIn" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <footer className="bg-surface border-t border-charcoal/10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Mobile accordion sections */}
        <div className="md:hidden space-y-0 divide-y divide-charcoal/10">
          <AccordionSection
            id="hotels"
            title="Our Hotels"
            open={openSection === "hotels"}
            onToggle={() => toggle("hotels")}
          >
            <ul className="space-y-2 pb-4">
              {HOTELS.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/hotels/${h.slug}`}
                    className="text-base font-semibold text-charcoal/80 hover:text-champagne transition-colors"
                  >
                    {h.name}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="company"
            title="Company"
            open={openSection === "company"}
            onToggle={() => toggle("company")}
          >
            <ul className="space-y-2 pb-4">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base font-semibold text-charcoal/80 hover:text-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionSection>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <Link
              href="/"
              className="select-none flex items-center gap-2 hover:opacity-90 transition-opacity mb-2 justify-start"
            >
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src="/images/vasavi-club-logo.svg"
                  alt="Vasavi Clubs Logo"
                  fill
                  className="object-contain rounded-full border-2 border-champagne-dark shadow-sm"
                />
              </div>
              <span className="font-display text-[1.15rem] tracking-wide flex items-center gap-1 uppercase">
                <span className="text-champagne font-black">va</span>
                <span className="text-champagne-dark font-black">sa</span>
                <span className="text-champagne-dark font-black">vi</span>
                <span className="text-champagne font-bold ml-1">hotels</span>
              </span>
            </Link>
            <p className="text-base text-charcoal/80 mb-6 font-semibold leading-relaxed">
              Simple, affordable spiritual stays for the Vysha community.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              {social.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-muted hover:text-champagne-dark transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-charcoal mb-4">Our Hotels</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {HOTELS.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/hotels/${h.slug}`}
                    className="text-base font-semibold text-charcoal/80 hover:text-champagne transition-colors"
                  >
                    {h.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-charcoal mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base font-semibold text-charcoal/80 hover:text-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg text-charcoal mb-4">Newsletter</h3>
            <p className="text-base text-charcoal/80 font-semibold mb-4 leading-relaxed">
              Curated travel inspiration from across our collection.
            </p>
            <NewsletterForm email={email} setEmail={setEmail} />
          </div>
        </div>

        {/* Mobile: brand + social + newsletter */}
        <div className="md:hidden mt-8 space-y-6 text-center">
          <div>
            <Link
              href="/"
              className="select-none flex items-center gap-2 hover:opacity-90 transition-opacity mb-2 justify-center"
            >
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src="/images/vasavi-club-logo.svg"
                  alt="Vasavi Clubs Logo"
                  fill
                  className="object-contain rounded-full border-2 border-champagne-dark shadow-sm"
                />
              </div>
              <span className="font-display text-[1.15rem] tracking-wide flex items-center gap-1 uppercase">
                <span className="text-champagne font-black">va</span>
                <span className="text-champagne-dark font-black">sa</span>
                <span className="text-champagne-dark font-black">vi</span>
                <span className="text-champagne font-bold ml-1">hotels</span>
              </span>
            </Link>
            <p className="text-base text-charcoal/80 font-semibold leading-relaxed">
              Simple, affordable spiritual stays for the Vysha community.
            </p>
          </div>
          <div className="flex justify-center gap-5">
            {social.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-muted hover:text-champagne-dark transition-colors"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <div className="text-left">
            <h3 className="font-display text-lg text-charcoal mb-3 text-center">Newsletter</h3>
            <NewsletterForm email={email} setEmail={setEmail} stacked />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-charcoal/10 flex flex-col sm:flex-row justify-between gap-4 text-sm font-semibold text-charcoal/75">
          <p>© {new Date().getFullYear()} vasavihotels. All rights reserved.</p>
          <div className="flex gap-6 justify-center sm:justify-end">
            <Link href="/privacy" className="hover:text-champagne-dark">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-champagne-dark">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AccordionSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 font-display text-lg text-charcoal"
        aria-expanded={open}
        aria-controls={`footer-${id}`}
      >
        {title}
        <ChevronDown
          className={cn("h-5 w-5 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`footer-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewsletterForm({
  email,
  setEmail,
  stacked = false,
}: {
  email: string;
  setEmail: (v: string) => void;
  stacked?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEmail("");
      }}
      className={cn(stacked ? "flex flex-col gap-2" : "flex gap-2")}
    >
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Newsletter email"
        required
        className={stacked ? "w-full" : "flex-1"}
      />
      <Button type="submit" className={stacked ? "w-full" : "shrink-0"}>
        Subscribe
      </Button>
    </form>
  );
}
