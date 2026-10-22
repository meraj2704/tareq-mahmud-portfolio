import type { ReactNode } from "react";
import type { SectionHeading, SectionId } from "@/data/content";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
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

interface SectionProps {
  id: SectionId;
  heading: SectionHeading;
  tone?: "paper" | "ink";
  // Oversized heading, for the closing section.
  display?: boolean;
  children: ReactNode;
}

export function Section({
  id,
  heading,
  tone = "paper",
  display = false,
  children,
}: SectionProps) {
  const number = String(SECTION_ORDER.indexOf(id) + 1).padStart(2, "0");
  const dark = tone === "ink";

  return (
    <section
      id={id}
      className={cn("py-20 sm:py-28", dark ? "bg-ink text-white" : "bg-paper")}
    >
      <Container>
        <Rule className={dark ? "bg-white/15" : undefined} />
        <div className="grid gap-y-4 pt-6 sm:gap-y-6 md:grid-cols-12 md:gap-x-8">
          <FadeIn className="md:col-span-3">
            <p className={cn("eyebrow", dark ? "text-gold" : "text-slate")}>
              {number} — {heading.eyebrow}
            </p>
          </FadeIn>
          <RevealText
            text={heading.title}
            accentClassName={dark ? "text-gold" : undefined}
            className={cn(
              "font-display font-light tracking-[-0.02em] text-balance md:col-span-9",
              dark ? "text-white" : "text-ink",
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
