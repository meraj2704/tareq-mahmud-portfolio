import type { SiteContent } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "./CurrentYear";

export function Footer({ content }: { content: SiteContent["footer"] }) {
  return (
    <footer className="bg-ink text-white">
      <Container className="border-t border-white/15 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center">
        <span className="mx-auto block h-px w-10 bg-gold" aria-hidden="true" />
        <p className="font-display mt-6 text-2xl">{content.name}</p>
        <p className="eyebrow mt-3 text-white/50">{content.tagline}</p>
        <p className="eyebrow mt-6 text-white/50">
          © <CurrentYear /> {content.name}. {content.rights}
        </p>
      </Container>
    </footer>
  );
}
