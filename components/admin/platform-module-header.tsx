export function PlatformModuleHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="border-b border-beige/40 bg-surface px-6 py-6">
      <div className="mx-auto max-w-5xl">
        {badge && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-champagne">
            {badge}
          </p>
        )}
        <h1 className="font-display text-2xl text-charcoal mt-1">{title}</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">{description}</p>
      </div>
    </div>
  );
}
