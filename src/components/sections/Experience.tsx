import type { SiteContent } from "@/data/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Photo } from "@/components/ui/Photo";
import { Section } from "@/components/ui/Section";
import { pad2 } from "@/lib/format";

export function Experience({
  content,
}: {
  content: SiteContent["experience"];
}) {
  return (
    <Section id="experience" heading={content} tone="paper">
      <Ledger total>
        {content.items.map((item) => (
          <LedgerRow
            key={`${item.company}-${item.period}`}
            aside={
              <div className="flex flex-wrap items-baseline gap-x-3 sm:block">
                <p className="eyebrow text-ink">{item.period}</p>
                {item.current && (
                  <p className="eyebrow text-slate sm:mt-1">
                    {content.currentLabel}
                  </p>
                )}
              </div>
            }
          >
            <h3 className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">
              {item.role}
            </h3>
            <p className="eyebrow mt-2 text-slate">{item.company}</p>
            <ol className="mt-6 max-w-2xl divide-y divide-mist sm:mt-8">
              {item.responsibilities.map((line, index) => (
                <li
                  key={line}
                  className="grid grid-cols-[2rem_1fr] py-3 leading-relaxed sm:grid-cols-[2.5rem_1fr]"
                >
                  <span className="eyebrow pt-0.5 text-slate">
                    {pad2(index + 1)}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          </LedgerRow>
        ))}
      </Ledger>
      {content.photo && (
        <FadeIn className="mt-12 grid md:grid-cols-12 md:gap-x-8">
          <Photo
            image={content.photo}
            orientation="landscape"
            sizes="(min-width: 1024px) 45vw, (min-width: 768px) 70vw, (min-width: 640px) 90vw, 100vw"
            className="md:col-span-9 md:col-start-4 lg:col-span-6"
          />
        </FadeIn>
      )}
    </Section>
  );
}
