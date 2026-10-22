import type { KeyFigure, SiteContent } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { RevealText } from "@/components/ui/RevealText";
import { Rule } from "@/components/ui/Rule";
import { cn } from "@/lib/cn";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  const { name, role, location, summary, photo, primaryCta, secondaryCta } =
    content;

  return (
    <section id="top" className="bg-paper pt-12 sm:pt-16 lg:pt-20">
      <Container>
        <div className="grid gap-y-14 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-7 lg:col-span-8">
            <FadeIn>
              <p className="eyebrow text-slate">{location}</p>
            </FadeIn>
            <RevealText
              as="h1"
              text={name}
              stacked
              className="font-display mt-8 text-[clamp(4.5rem,13vw,8rem)] leading-[0.86] font-light tracking-[-0.03em] text-ink"
            />
            <FadeIn delay={0.3} className="mt-12 max-w-md">
              <p className="font-display text-3xl font-normal text-ink italic sm:text-4xl">
                {role}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-slate">
                {summary}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={primaryCta.href} download={primaryCta.download}>
                  <Icon name="download" className="size-4" />
                  {primaryCta.label}
                </ButtonLink>
                <ButtonLink href={secondaryCta.href} variant="secondary">
                  {secondaryCta.label}
                  <Icon name="arrowRight" className="size-4" />
                </ButtonLink>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} className="md:col-span-5 lg:col-span-4">
            <Photo
              image={photo}
              orientation="portrait"
              preload
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw"
            />
          </FadeIn>
        </div>

        <KeyFigures figures={content.figures} />
      </Container>
    </section>
  );
}

function KeyFigures({ figures }: { figures: KeyFigure[] }) {
  return (
    <div className="mt-16 sm:mt-24">
      <Rule />
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {figures.map((figure, index) => (
          <FadeIn
            key={figure.label}
            delay={index * 0.08}
            className={cn(
              "border-mist py-6 pr-4 sm:py-8",
              // Vertical rules between columns; horizontal between rows on mobile.
              index % 2 === 1 && "border-l pl-5 sm:pl-6",
              index >= 2 && "border-t lg:border-t-0",
              index === 2 && "lg:border-l lg:pl-6",
            )}
          >
            <dt className="eyebrow text-slate">{figure.label}</dt>
            <dd className="font-display mt-3 text-3xl leading-tight font-light text-ink sm:text-4xl">
              {figure.value}
            </dd>
            {figure.detail && (
              <dd className="mt-2 text-sm text-slate">{figure.detail}</dd>
            )}
          </FadeIn>
        ))}
      </dl>
      <Rule />
    </div>
  );
}
