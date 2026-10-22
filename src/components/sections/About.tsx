import type { SiteContent } from "@/data/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";

export function About({ content }: { content: SiteContent["about"] }) {
  const [lede, ...rest] = content.paragraphs;

  return (
    <Section id="about" heading={content}>
      <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-8">
        <FadeIn className="md:col-span-8 md:col-start-4">
          <p className="text-2xl leading-snug text-ink sm:text-[1.75rem]">
            {lede}
          </p>
          {rest.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-slate"
            >
              {paragraph}
            </p>
          ))}
        </FadeIn>
        <FadeIn
          delay={0.1}
          className="md:col-span-3 md:col-start-1 md:row-start-1"
        >
          <ul className="divide-y divide-mist border-y border-mist">
            {content.highlights.map((item) => (
              <li key={item} className="eyebrow py-3 text-ink">
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </Section>
  );
}
