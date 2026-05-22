"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MessageCircle, X } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { formatDate } from "@/lib/utils";

const DURATION_MS = 7000;

export function BookingToast() {
  const { showToast, toastData, dismissToast } = useBookingStore();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!showToast) return;

    setProgress(100);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) dismissToast();
    }, 50);

    const timeout = setTimeout(dismissToast, DURATION_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showToast, dismissToast]);

  return (
    <AnimatePresence>
      {showToast && toastData && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed z-[60] top-4 left-4 right-4 md:top-auto md:left-auto md:bottom-6 md:right-6 md:w-full md:max-w-sm"
        >
          <div className="bg-white rounded-xl border border-champagne-dark/30 overflow-hidden shadow-warm-md">
            <div className="p-4 flex gap-3">
              <CheckCircle className="h-6 w-6 text-champagne-dark shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-charcoal font-bold">Booking Confirmed!</p>
                <p className="text-sm text-muted mt-1">
                  {toastData.roomType} at {toastData.hotelName}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Check-in: {formatDate(toastData.checkIn)}
                </p>
                {toastData.whatsappSent && (
                  <p className="text-xs text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp confirmation sent
                  </p>
                )}
              </div>
              <button
                onClick={dismissToast}
                className="text-muted hover:text-charcoal shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-1 bg-surface">
              <motion.div
                className="h-full bg-champagne-dark"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
