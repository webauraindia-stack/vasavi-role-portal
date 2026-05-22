import { HeroSection } from "@/components/customer/hero-section";
import { FeaturesSection } from "@/components/customer/features-section";
import { TrustStats } from "@/components/customer/trust-stats";
import { HotelGrid } from "@/components/customer/hotel-grid";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStats />
      <HotelGrid />
      <FeaturesSection />
    </>
  );
}
