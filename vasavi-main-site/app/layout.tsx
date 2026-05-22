import type { Metadata } from "next";
import { Cinzel, Marcellus, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BookingModal } from "@/components/shared/booking-modal";
import { BookingToast } from "@/components/shared/booking-toast";
import { CookieConsent } from "@/components/shared/cookie-consent";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vasavi Hotels — Premium Spiritual Hospitality",
    template: "%s | Vasavi Hotels",
  },
  description:
    "Experience divine temple elegance and premium Indian hospitality with Vasavi Hotels. A trusted ecosystem of luxury stays for families and pilgrims.",
  openGraph: {
    title: "Vasavi Hotels — Premium Spiritual Hospitality",
    description: "Experience divine temple elegance and premium Indian hospitality.",
    type: "website",
    locale: "en_IN",
    siteName: "Vasavi Hotels",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${marcellus.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BookingModal />
          <BookingToast />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
