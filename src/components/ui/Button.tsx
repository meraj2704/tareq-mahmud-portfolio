import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "inverse";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-navy focus-visible:outline-ink",
  secondary:
    "border border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink",
  // For use on ink backgrounds.
  inverse: "bg-paper text-ink hover:bg-gold focus-visible:outline-gold",
};

// The surface each variant paints, for the cursor tick's color lookup.
// Secondary is see-through, so it takes the section's tone.
const tones: Record<Variant, string | undefined> = {
  primary: "ink",
  secondary: undefined,
  inverse: "paper",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6",
  sm: "h-9 px-4",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
}

export function buttonStyles({
  variant = "primary",
  size = "md",
}: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size]);
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      data-tone={tones[variant ?? "primary"]}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      data-tone={tones[variant ?? "primary"]}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}
