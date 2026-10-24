import type { ReactNode } from "react";
import type { SectionHeading, SectionId } from "@/data/content";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { GrowthTick } from "./GrowthLine";
import { RevealText } from "./RevealText";
import { Rule } from "./Rule";

// Matches the render order in app/page.tsx; drives the "01 —" numbering.
const SECTION_ORDER: SectionId[] = [
  "about",
  "experience",
  "education",
  "skills",
  "certifications",
  "research",
  "contact",
];

export type SectionTone = "paper" | "cream" | "emerald" | "ink";

interface ToneStyles {
  // Background plus the body text color children inherit.
  surface: string;
  title: string;
  // The *italic* word in the title.
  accent: string;
  eyebrow: string;
  rule: string;
  // The outlined number ghosted behind the title.
  ghost: string;
}

const LIGHT = {
  title: "text-ink",
  accent: "text-gold-deep",
  eyebrow: "text-slate",
  rule: "bg-mist",
  ghost: "text-gold-deep opacity-30",
};

const DARK = {
  title: "text-white",
  accent: "text-gold",
  eyebrow: "text-gold",
  rule: "bg-white/15",
  ghost: "text-gold opacity-20",
};

const TONES: Record<SectionTone, ToneStyles> = {
  paper: { surface: "bg-paper", ...LIGHT },
  cream: { surface: "bg-cream", ...LIGHT },
  emerald: { surface: "bg-emerald text-white/70", ...DARK },
  ink: { surface: "bg-ink text-white/70", ...DARK },
};

interface SectionProps {
  id: SectionId;
  heading: SectionHeading;
  tone?: SectionTone;
  // Oversized heading, for the closing section.
  display?: boolean;
  // Soft gold light behind the title.
  glow?: boolean;
  children: ReactNode;
}

export function Section({
  id,
  heading,
  tone = "paper",
  display = false,
  glow = false,
  children,
}: SectionProps) {
  const number = pad2(SECTION_ORDER.indexOf(id) + 1);
  const styles = TONES[tone];

  return (
    <section
      id={id}
      data-tone={tone}
      className={cn("py-20 sm:py-28", styles.surface)}
    >
      <Container>
        <Rule className={styles.rule} />
        <div className="relative isolate grid gap-y-4 pt-6 sm:gap-y-6 md:grid-cols-12 md:gap-x-8">
          {glow && (
            <div
              aria-hidden="true"
              className="glow-gold pointer-events-none absolute -inset-y-24 inset-x-0 -z-10 opacity-60 md:right-auto md:left-[20%] md:w-[min(44rem,80%)]"
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "font-display text-outline pointer-events-none absolute -top-10 right-0 -z-10 hidden text-[clamp(10rem,16vw,15rem)] leading-none font-light tracking-[-0.04em] select-none lg:block",
              styles.ghost,
            )}
          >
            {number}
          </span>
          <FadeIn className="md:col-span-3">
            <p className={cn("eyebrow", styles.eyebrow)}>
              {number} — {heading.eyebrow}
              {/* Below lg the growth line becomes these ticks; the closing
                  section gets its final stroke from GrowthLine instead. */}
              {!display && (
                <GrowthTick className={cn("lg:hidden", styles.accent)} />
              )}
            </p>
          </FadeIn>
          <RevealText
            text={heading.title}
            accentClassName={styles.accent}
            className={cn(
              "font-display font-light tracking-[-0.02em] text-balance md:col-span-9",
              styles.title,
              display
                ? "text-[clamp(3.5rem,9vw,8rem)] leading-[0.9]"
                : "text-[clamp(2.25rem,10.5vw,3rem)] leading-[0.95] sm:text-6xl lg:text-7xl",
            )}
          />
        </div>
        <div className="mt-12 sm:mt-24">{children}</div>
      </Container>
    </section>
  );
}
