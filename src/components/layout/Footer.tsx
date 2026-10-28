import type { SiteContent } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "./CurrentYear";

export function Footer({ content }: { content: SiteContent["footer"] }) {
  const { credit } = content;

  return (
    <footer data-tone="ink" className="bg-ink text-white">
      <Container className="border-t border-white/15 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center">
        <span
          className="double-rule mx-auto block w-10 text-gold"
          aria-hidden="true"
        />
        <p className="font-display mt-6 text-2xl">{content.name}</p>
        <p className="eyebrow mt-3 text-white/50">{content.tagline}</p>
        <div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="eyebrow text-white/50">
            © <CurrentYear /> {content.name}. {content.rights}
          </p>
          <p className="eyebrow text-white/50">
            {credit.prefix}{" "}
            <a
              href={credit.href}
              target="_blank"
              rel="noopener"
              // The pseudo-element widens the tap area to 44px+ without
              // changing the layout.
              className="relative text-gold underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:underline focus-visible:underline"
            >
              {credit.label}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
