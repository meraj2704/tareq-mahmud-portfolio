import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/data/content";
import { cn } from "@/lib/cn";

const ASPECT = {
  portrait: "aspect-4/5",
  landscape: "aspect-3/2",
} as const;

// Grayscale until hovered; full color on mobile and touch screens. Shared
// with media layered over the image (see HeroVideo).
export const PHOTO_MEDIA =
  "object-cover grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0 max-sm:grayscale-0 [@media(hover:none)]:grayscale-0";

// Duotone layers: fade out on hover; skipped on mobile and touch screens.
const DUOTONE =
  "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out group-hover:opacity-0 max-sm:hidden [@media(hover:none)]:hidden";

interface PhotoProps {
  image: ImageAsset;
  orientation: keyof typeof ASPECT;
  sizes: string;
  preload?: boolean;
  className?: string;
  // Layered over the image, under the duotone.
  children?: ReactNode;
}

// Editorial photo: fixed aspect, hairline border, ink-and-gold duotone until
// hovered. On mobile it runs edge to edge, and touch screens show it in full
// color.
export function Photo({
  image,
  orientation,
  sizes,
  preload,
  className,
  children,
}: PhotoProps) {
  return (
    <div
      className={cn(
        "group relative isolate overflow-hidden rounded-xs border border-mist bg-mist max-sm:bleed max-sm:rounded-none max-sm:border-0",
        ASPECT[orientation],
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        preload={preload}
        sizes={sizes}
        className={PHOTO_MEDIA}
      />
      {children}
      {/* Multiply tints the highlights gold; lighten lifts the shadows to ink. */}
      <span aria-hidden="true" className={cn(DUOTONE, "bg-gold mix-blend-multiply")} />
      <span aria-hidden="true" className={cn(DUOTONE, "bg-ink mix-blend-lighten")} />
    </div>
  );
}
