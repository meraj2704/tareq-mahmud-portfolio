import type { SiteContent } from "@/data/content";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Section } from "@/components/ui/Section";
import { pad2 } from "@/lib/format";

export function Certifications({
  content,
}: {
  content: SiteContent["certifications"];
}) {
  return (
    <Section id="certifications" heading={content} tone="paper">
      <Ledger>
        {content.items.map((item, index) => (
          <LedgerRow
            key={item.title}
            aside={
              <p className="eyebrow text-slate">
                {pad2(index + 1)}
              </p>
            }
            trailing={<p className="eyebrow text-ink">{item.year}</p>}
          >
            <h3 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-1 text-slate">{item.issuer}</p>
          </LedgerRow>
        ))}
      </Ledger>
    </Section>
  );
}
