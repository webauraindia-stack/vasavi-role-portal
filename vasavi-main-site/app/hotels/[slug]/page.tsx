import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  getHotelBySlug,
  getAllHotelSlugs,
  getRoomsForHotel,
  getAvailabilityCalendar,
} from "@/lib/data/hotels";
import { formatCurrency } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { HotelDetailStickyNav } from "@/components/customer/hotel-detail-sticky-nav";
import {
  HotelGallery,
  RoomList,
  AvailabilityCalendar,
  ReviewsList,
  AmenitiesGrid,
} from "@/components/customer/hotel-detail-client";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllHotelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel Not Found" };
  return {
    title: hotel.name,
    description: hotel.description,
    openGraph: { images: [hotel.heroImage] },
  };
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);
  if (!hotel) notFound();

  const rooms = getRoomsForHotel(hotel.id);
  const availability = getAvailabilityCalendar(hotel.id);

  return (
    <div className="bg-white">
      <HotelDetailStickyNav hotelName={hotel.name} />

      <div className="pt-14 md:pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <HotelGallery images={hotel.images} name={hotel.name} />

          <div className="grid lg:grid-cols-3 gap-8 mt-6 md:mt-8">
            <div className="lg:col-span-2 space-y-8">
              <section id="overview">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-4xl text-charcoal">
                    {hotel.name}
                  </h1>
                  {hotel.hasDonorRooms && <Badge variant="donor">Donor Rooms</Badge>}
                </div>
                <p className="flex items-center gap-1 text-muted text-sm md:text-base">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {hotel.city}, {hotel.country} · {hotel.region}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <StarRating rating={hotel.overallRating} showValue />
                  <span className="text-sm text-muted">
                    {hotel.starRating}-star · {hotel.roomCount} rooms
                  </span>
                </div>
              </section>

              <p className="text-charcoal/80 leading-relaxed">{hotel.description}</p>

              <section id="amenities">
                <h2 className="font-display text-xl text-charcoal mb-4">Amenities</h2>
                <AmenitiesGrid amenities={hotel.amenities} />
              </section>

              {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
                <section id="attractions">
                  <h2 className="font-display text-xl text-charcoal mb-4">Nearby Temples & Attractions</h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {hotel.nearbyAttractions.map((attraction, i) => (
                      <li key={i} className="flex items-start gap-2 text-charcoal/80">
                        <MapPin className="h-4 w-4 text-champagne shrink-0 mt-0.5" />
                        <span>{attraction}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section id="rooms">
                <RoomList rooms={rooms} hotel={hotel} />
              </section>

              <section id="reviews" className="lg:hidden">
                <ReviewsList reviews={hotel.reviews} />
              </section>
            </div>

            <aside className="space-y-6">
              <div className="card-surface p-6 sticky top-28 hidden lg:block">
                <p className="text-sm text-muted">Starting from</p>
                <p className="font-display text-3xl text-champagne mb-4">
                  {formatCurrency(hotel.startingPrice)}
                  <span className="text-sm text-muted font-body">/night</span>
                </p>
                <Link
                  href={`/search?hotel=${hotel.id}`}
                  className="block w-full text-center rounded-lg bg-champagne text-white py-2.5 text-sm font-medium hover:bg-champagne/90 hover:text-white transition-colors"
                >
                  Search All Rooms
                </Link>
              </div>
              <AvailabilityCalendar availability={availability} />
              <div className="hidden lg:block">
                <ReviewsList reviews={hotel.reviews} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
