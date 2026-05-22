import { HotelDetailSkeleton } from "@/components/customer/skeletons";

export default function HotelLoading() {
  return (
    <div className="pt-20 pb-16 mx-auto max-w-7xl px-4 lg:px-8">
      <HotelDetailSkeleton />
    </div>
  );
}
