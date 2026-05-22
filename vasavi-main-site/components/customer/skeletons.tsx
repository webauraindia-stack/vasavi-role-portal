import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg bg-surface", className)} />;
}

export function HotelGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-charcoal/10 bg-white shadow-warm">
          <Shimmer className="aspect-video w-full rounded-none" />
          <div className="p-2.5 space-y-2">
            <Shimmer className="h-3.5 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-8 w-full mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Shimmer className="h-[40dvh] md:h-[50vh] w-full rounded-xl" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Shimmer className="h-10 w-2/3" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
          <Shimmer className="h-4 w-4/6" />
        </div>
        <Shimmer className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function RoomsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-charcoal/10 bg-white">
          <Shimmer className="h-40 md:h-32 md:w-48 shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-6 w-1/3" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col overflow-hidden rounded-xl border border-charcoal/10 bg-white lg:flex-row",
            i === 3 && "max-lg:col-span-2 max-lg:w-[calc(50%-0.375rem)] max-lg:justify-self-center"
          )}
        >
          <Shimmer className="aspect-[4/3] w-full rounded-none lg:aspect-auto lg:h-40 lg:w-52 xl:w-60 shrink-0" />
          <div className="flex flex-1 flex-col gap-2 p-2.5 lg:flex-row lg:items-center lg:justify-between lg:p-5">
            <div className="space-y-2 flex-1">
              <Shimmer className="h-3 w-2/3" />
              <Shimmer className="h-5 w-1/2" />
              <Shimmer className="h-3 w-1/3" />
            </div>
            <div className="space-y-2 lg:items-end lg:flex lg:flex-col lg:pl-6 lg:border-l lg:border-charcoal/10">
              <Shimmer className="h-6 w-24" />
              <Shimmer className="h-10 w-full lg:w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
