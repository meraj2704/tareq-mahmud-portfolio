import Image from "next/image";
import type { ImageAsset } from "@/data/content";
import { cn } from "@/lib/cn";

const ASPECT = {
  portrait: "aspect-4/5",
  landscape: "aspect-3/2",
} as const;

interface PhotoProps {
  image: ImageAsset;
  orientation: keyof typeof ASPECT;
  sizes: string;
  preload?: boolean;
  className?: string;
}

// Editorial photo: fixed aspect, hairline border, muted until hovered.
// On mobile it runs edge to edge, and touch screens show it in full color.
export function Photo({
  image,
  orientation,
  sizes,
  preload,
  className,
}: PhotoProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xs border border-mist bg-mist max-sm:bleed max-sm:rounded-none max-sm:border-0",
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
        className="object-cover saturate-70 transition-[filter] duration-700 ease-out group-hover:saturate-100 max-sm:saturate-100 [@media(hover:none)]:saturate-100"
      />
    </div>
  );
}
