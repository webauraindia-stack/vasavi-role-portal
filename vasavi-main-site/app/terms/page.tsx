import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HotelHub and Vasavi Hotels terms of service.",
};

export default function TermsPage() {
  return (
    <div className="pt-20 pb-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">Terms of Service</h1>
        <p className="text-muted leading-relaxed mb-4">
          By using Vasavi Hotels and HotelHub, you agree to our booking policies, cancellation
          terms, and community conduct standards aligned with Vasavi Clubs International
          values.
        </p>
        <p className="text-muted leading-relaxed mb-4">
          Donor contributions to KCGF and related schemes are voluntary and non-refundable
          except where required by law. Tier benefits apply as described on the{" "}
          <Link href="/donors" className="text-champagne hover:underline">
            Donor Program
          </Link>{" "}
          page.
        </p>
        <p className="text-muted leading-relaxed">
          Room rates, availability, and amenities are subject to change. Confirmed bookings
          receive email confirmation with a reference number.
        </p>
      </div>
    </div>
  );
}
