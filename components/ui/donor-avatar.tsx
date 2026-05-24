import Image from "next/image";
import { cn } from "@/lib/utils";

/** Placeholder services we render as local initials instead of remote images. */
const PLACEHOLDER_HOSTS = new Set(["ui-avatars.com", "gravatar.com"]);

export function donorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Returns a URL safe for `next/image`, or null when we should show initials. */
export function donorPhotoSrc(src: string | undefined | null): string | null {
  const trimmed = src?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (PLACEHOLDER_HOSTS.has(url.hostname)) return null;
    return trimmed;
  } catch {
    return null;
  }
}

type DonorAvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
  imageClassName?: string;
  sizes?: string;
};

export function DonorAvatar({
  name,
  src,
  className,
  imageClassName,
  sizes = "64px",
}: DonorAvatarProps) {
  const photo = donorPhotoSrc(src);

  if (!photo) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-champagne text-sm font-semibold text-white",
          className
        )}
        role="img"
        aria-label={name}
      >
        <span aria-hidden>{donorInitials(name)}</span>
      </div>
    );
  }

  return (
    <Image
      src={photo}
      alt={name}
      fill
      className={cn("object-cover", imageClassName)}
      sizes={sizes}
    />
  );
}
