import type { SiteContent } from "@/data/content";
import { Ledger, LedgerRow } from "@/components/ui/Ledger";
import { Section } from "@/components/ui/Section";

export function Certifications({
  content,
}: {
  content: SiteContent["certifications"];
}) {
  return (
    <Section id="certifications" heading={content}>
      <Ledger>
        {content.items.map((item, index) => (
          <LedgerRow
            key={item.title}
            aside={
              <p className="eyebrow text-slate">
                {String(index + 1).padStart(2, "0")}
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
