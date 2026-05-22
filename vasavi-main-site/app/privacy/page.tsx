import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "HotelHub and Vasavi Hotels privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 lg:px-8 prose prose-sm max-w-none">
        <h1 className="font-display text-3xl text-charcoal mb-6">Privacy Policy</h1>
        <p className="text-muted leading-relaxed mb-4">
          Vasavi Hotels respects your privacy. We collect only information necessary to
          process bookings, donor contributions, and account management. We do not sell
          personal data to third parties.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          Payment details are processed securely through certified payment gateways. Booking
          and donor records may be shared with affiliated Vasavi community properties solely
          to fulfil your stay or membership benefits.
        </p>
        <p className="text-muted leading-relaxed">
          For questions, contact us via the{" "}
          <Link href="/contact" className="text-champagne hover:underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
