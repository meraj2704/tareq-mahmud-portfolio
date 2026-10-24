import type { SiteContent } from "@/data/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { Rule } from "@/components/ui/Rule";
import { Section } from "@/components/ui/Section";
import { pad2 } from "@/lib/format";

export function Skills({ content }: { content: SiteContent["skills"] }) {
  return (
    <Section id="skills" heading={content} tone="emerald">
      <div className="md:grid md:grid-cols-12 md:gap-x-8">
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 sm:gap-y-14 md:col-span-9 md:col-start-4">
          {content.groups.map((group, index) => (
            <div key={group.title}>
              <Rule className="bg-gold" delay={(index % 2) * 0.08} />
              <FadeIn delay={(index % 2) * 0.08}>
                <div className="flex items-baseline justify-between gap-4 pt-4 pb-3">
                  <h3 className="font-display text-2xl text-white">
                    {group.title}
                  </h3>
                  <span className="eyebrow text-gold">
                    {pad2(index + 1)}
                  </span>
                </div>
                <ul className="divide-y divide-white/15 border-t border-white/15">
                  {group.items.map((item) => (
                    <li key={item} className="py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
