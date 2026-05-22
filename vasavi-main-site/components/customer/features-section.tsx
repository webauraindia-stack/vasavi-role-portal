"use client";

import { motion } from "framer-motion";
import {
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FEATURES = [
  {
    id: "search",
    titleKey: "features.search.title",
    titleDefault: "Search simply",
    descKey: "features.search.description",
    descDefault:
      "Find rooms across all 11 Vasavi guest houses in seconds — filter by city, dates, and room type.",
    Icon: SearchSimplyIcon,
  },
  {
    id: "compare",
    titleKey: "features.compare.title",
    titleDefault: "Compare confidently",
    descKey: "features.compare.description",
    descDefault:
      "Compare prices, amenities, and donor-exclusive rooms side by side before you book.",
    Icon: CompareConfidentlyIcon,
  },
  {
    id: "save",
    titleKey: "features.save.title",
    titleDefault: "Save more",
    descKey: "features.save.description",
    descDefault:
      "Unlock donor-tier discounts and community welfare rates on every spiritual stay.",
    Icon: SaveBigIcon,
  },
] as const;

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section
      className="border-t border-charcoal/10 bg-white py-10 sm:py-14 md:py-16"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-2xl px-4 sm:max-w-3xl lg:max-w-4xl lg:px-8">
        <h2 id="features-heading" className="sr-only">
          Why book with Vasavi Hotels
        </h2>
        <ul className="flex flex-col gap-10 sm:gap-12 md:gap-14">
          {FEATURES.map((feature, index) => (
            <motion.li
              key={feature.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left md:gap-8"
            >
              <div className="shrink-0" aria-hidden>
                <feature.Icon />
              </div>
              <div className="min-w-0 flex-1 pt-0 sm:pt-1">
                <h3 className="text-xl font-bold text-charcoal sm:text-2xl leading-tight">
                  {t(feature.titleKey, feature.titleDefault)}
                </h3>
                <p className="mt-2 text-base font-semibold text-charcoal/70 leading-relaxed sm:text-lg">
                  {t(feature.descKey, feature.descDefault)}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SearchSimplyIcon() {
  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center sm:h-[100px] sm:w-[100px]">
      <div className="absolute inset-0 rounded-2xl bg-surface border border-charcoal/8" />
      <Building2
        className="absolute bottom-3 left-3 h-9 w-9 text-champagne/35 sm:h-10 sm:w-10"
        strokeWidth={1.5}
      />
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-warm-md border border-charcoal/10">
        <Search className="h-7 w-7 text-champagne" strokeWidth={2.25} />
      </div>
    </div>
  );
}

function CompareConfidentlyIcon() {
  return (
    <div className="relative flex h-[88px] w-[100px] items-end justify-center gap-1 sm:h-[100px] sm:w-[112px]">
      <div className="flex flex-col items-center gap-1">
        <span className="rounded-md bg-champagne-dark/90 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
          A.C
        </span>
        <Building2 className="h-10 w-10 text-champagne/50" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-center gap-1 -mb-1">
        <span className="rounded-md bg-champagne px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
          ₹
        </span>
        <Building2 className="h-12 w-12 text-champagne" strokeWidth={1.75} />
      </div>
      <div className="absolute -right-1 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-charcoal/10 shadow-warm">
        <SlidersHorizontal className="h-4 w-4 text-champagne-dark" strokeWidth={2} />
      </div>
    </div>
  );
}

function SaveBigIcon() {
  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center sm:h-[100px] sm:w-[100px]">
      <div className="absolute -top-1 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-md">
        <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      <div className="absolute top-0 left-1 flex h-9 w-9 items-center justify-center rounded-full bg-champagne-dark shadow-md">
        <BadgeIndianRupee className="h-5 w-5 text-white" strokeWidth={2.25} />
      </div>
      <div className="mt-4 flex h-16 w-20 items-center justify-center rounded-xl border-2 border-charcoal/15 bg-surface">
        <div className="space-y-1">
          <div className="h-2 w-14 rounded-full bg-champagne/25" />
          <div className="h-8 w-14 rounded-md bg-champagne/15 border border-champagne/25" />
        </div>
      </div>
    </div>
  );
}
