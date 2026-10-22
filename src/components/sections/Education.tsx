import type { SiteContent } from "@/data/content";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

export function Education({ content }: { content: SiteContent["education"] }) {
  return (
    <Section id="education" heading={content}>
      <Ledger>
        {content.items.map((item) => (
          <LedgerRow
            key={item.degree}
            aside={<p className="eyebrow text-ink">{item.period}</p>}
            trailing={
              <p
                className={cn(
                  "eyebrow",
                  item.ongoing ? "font-bold text-ink" : "text-slate",
                )}
              >
                {item.status}
              </p>
            }
          >
            <h3 className="font-display text-[1.75rem] leading-tight text-ink sm:text-4xl">
              {item.degree}
            </h3>
            <p className="mt-2 text-slate">{item.institution}</p>
          </LedgerRow>
        ))}
      </Ledger>
    </Section>
  );
}
