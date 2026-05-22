"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TRUST_STATS } from "@/lib/data/hotels";
import { useTranslation } from "react-i18next";

function CountUp({
  end,
  suffix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function TrustStats() {
  const { t } = useTranslation();

  const stats = [
    { label: t("trust.devotees", "Happy Pilgrims"), value: TRUST_STATS.totalBookings, suffix: "+" },
    { label: t("trust.years", "Years Serving"), value: TRUST_STATS.yearsOperating },
    { label: t("trust.temples", "Temple Destinations"), value: TRUST_STATS.cities },
    { label: t("trust.properties", "Community Guest Houses"), value: 11 },
  ];

  return (
    <section className="relative z-0 py-12 md:py-16 border-y border-champagne/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center justify-start text-center min-h-[5.5rem]"
            >
              <p className="font-display text-3xl md:text-4xl lg:text-5xl text-champagne font-semibold leading-none tracking-tight mb-2 md:mb-3">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-charcoal font-bold uppercase tracking-wide leading-snug max-w-[11rem] mx-auto">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
