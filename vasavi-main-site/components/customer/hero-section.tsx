"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { GlobalSearchBar } from "@/components/shared/global-search-bar";
import { useTranslation } from "react-i18next";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative flex flex-col items-center justify-center overflow-visible pt-24 pb-12 sm:pt-32 sm:pb-16 bg-surface border-b border-charcoal/5 min-h-[70vh]">
      {/* Light subtle clean gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-surface to-surface/50 z-0" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--color-champagne)_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        {/* Branding Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-3"
        >
          <span className="text-champagne font-bold text-sm sm:text-base tracking-[0.15em] uppercase bg-champagne/10 px-4 py-1.5 rounded-full">
            {t("hero.eyebrow", "Vasavi Hotels • Premium Spiritual Hospitality")}
          </span>
        </motion.div>

        {/* Trivago-style Catchy Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal font-black tracking-tight max-w-3xl leading-[1.1] mb-4 text-balance"
        >
          {t("hero.title", "Find your perfect spiritual stay")}
        </motion.h1>

        {/* Minimal Sub-heading description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-base sm:text-lg md:text-xl text-charcoal/85 max-w-2xl mx-auto mb-8 font-semibold leading-relaxed px-2"
        >
          {t(
            "hero.subtitle",
            "Compare simple, comfortable, and devotional guest houses across sacred destinations with direct donor privilege integrations."
          )}
        </motion.p>

        {/* Large Prominent Trivago Search Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-20 w-full max-w-6xl"
        >
          <Suspense
            fallback={
              <div className="h-[220px] w-full max-w-6xl rounded-2xl border border-charcoal/10 bg-white animate-pulse" />
            }
          >
            <GlobalSearchBar variant="hero" />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}
