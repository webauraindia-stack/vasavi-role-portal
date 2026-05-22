"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "hotelhub-cookie-consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const save = (preferences: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setVisible(false);
    setShowPrefs(false);
  };

  const acceptAll = () =>
    save({ necessary: true, analytics: true, marketing: true });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="mx-auto max-w-4xl bg-white rounded-xl border border-charcoal/10 p-6 shadow-warm-lg">
            {!showPrefs ? (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-display text-lg text-charcoal mb-1">
                    We value your privacy
                  </p>
                  <p className="text-sm text-muted">
                    We use cookies to enhance your browsing experience and analyze
                    site traffic. Read our{" "}
                    <Link href="/privacy" className="text-champagne hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button variant="outline" onClick={() => setShowPrefs(true)}>
                    Manage Preferences
                  </Button>
                  <Button onClick={acceptAll}>Accept All</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-display text-lg text-charcoal">Cookie Preferences</p>
                <PreferenceRow
                  label="Necessary"
                  description="Required for the site to function."
                  checked
                  disabled
                />
                <PreferenceRow
                  label="Analytics"
                  description="Help us understand how visitors use our site."
                  checked={prefs.analytics}
                  onCheckedChange={(v) => setPrefs({ ...prefs, analytics: v })}
                />
                <PreferenceRow
                  label="Marketing"
                  description="Personalized offers and promotions."
                  checked={prefs.marketing}
                  onCheckedChange={(v) => setPrefs({ ...prefs, marketing: v })}
                />
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowPrefs(false)}>
                    Back
                  </Button>
                  <Button onClick={() => save(prefs)}>Save Preferences</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-charcoal">{label}</Label>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
