import type { SiteContent } from "@/data/content";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Section } from "@/components/ui/Section";

export function Research({ content }: { content: SiteContent["research"] }) {
  return (
    <Section id="research" heading={content}>
      <Ledger>
        {content.items.map((item) => (
          <LedgerRow
            key={item.title}
            aside={<p className="eyebrow text-slate">{item.type}</p>}
            trailing={<p className="eyebrow font-bold text-ink">{item.status}</p>}
          >
            <h3 className="font-display max-w-3xl text-[1.75rem] leading-[1.1] text-balance text-ink sm:text-4xl">
              {item.title}
            </h3>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed sm:mt-5 sm:text-lg">
              {item.summary}
            </p>
          </LedgerRow>
        ))}
      </Ledger>
    </Section>
  );
}
