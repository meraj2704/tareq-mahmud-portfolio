import type { KeyFigure, SiteContent } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp, PURE_NUMBER } from "@/components/ui/CountUp";
import { FadeIn } from "@/components/ui/FadeIn";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { HeroName } from "@/components/ui/HeroName";
import { HeroVideo } from "@/components/ui/HeroVideo";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { DoubleRule, Rule } from "@/components/ui/Rule";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/lib/cn";

const PORTRAIT_SIZES =
  "(min-width: 1024px) 30vw, (min-width: 768px) 40vw, (min-width: 640px) 90vw, 100vw";

interface HeroProps {
  content: SiteContent["hero"];
  numberLocale: string;
}

export function Hero({ content, numberLocale }: HeroProps) {
  const {
    name,
    role,
    location,
    summary,
    photo,
    video,
    background,
    primaryCta,
    secondaryCta,
  } = content;

  return (
    <section
      id="top"
      data-tone="paper"
      className="relative isolate bg-paper pt-10 sm:pt-16 lg:pt-20"
    >
      {background && <HeroBackground background={background} />}
      <Container className="relative z-10">
        {/* Mobile flattens the text column so the portrait can sit between
            the summary and the buttons. */}
        <div className="flex flex-col sm:grid sm:gap-y-14 md:grid-cols-12 md:gap-x-8">
          <div className="max-sm:contents md:col-span-7 lg:col-span-8">
            <FadeIn>
              <p className="eyebrow text-slate">{location}</p>
            </FadeIn>
            <HeroName
              text={name}
              className="mt-5 text-[clamp(3.5rem,21vw,5.5rem)] leading-[0.86] font-light tracking-[-0.03em] hyphens-none text-ink sm:mt-8 sm:text-[clamp(4.5rem,13vw,7.5rem)] lg:text-[8rem]"
            />
            <FadeIn delay={0.3} className="mt-8 max-w-md sm:mt-12">
              <p className="font-display text-3xl font-normal text-gold-deep italic sm:text-4xl">
                {role}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-slate">
                {summary}
              </p>
            </FadeIn>
            <FadeIn
              delay={0.3}
              className="max-w-md max-sm:order-2 max-sm:mt-8 sm:mt-10"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={primaryCta.href} download={primaryCta.download}>
                  <Icon name="download" className="size-4 group-hover:translate-y-0.5" />
                  {primaryCta.label}
                </ButtonLink>
                <ButtonLink href={secondaryCta.href} variant="secondary">
                  {secondaryCta.label}
                  <Icon name="arrowRight" className="size-4 group-hover:translate-x-1" />
                </ButtonLink>
              </div>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.15}
            className="max-sm:order-1 max-sm:mt-10 md:col-span-5 lg:col-span-4"
          >
            <div className="relative isolate">
              <div
                aria-hidden="true"
                className="glow-gold pointer-events-none absolute -inset-x-10 -inset-y-14 -z-10 sm:-inset-x-16"
              />
              {/* Offset emerald block, printed behind the portrait. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-xs bg-emerald max-sm:hidden"
              />
              {video ? (
                <HeroVideo video={video} sizes={PORTRAIT_SIZES} />
              ) : (
                <Photo
                  image={photo}
                  orientation="portrait"
                  preload
                  settle
                  sizes={PORTRAIT_SIZES}
                />
              )}
            </div>
          </FadeIn>
        </div>

        <KeyFigures figures={content.figures} locale={numberLocale} />
      </Container>
    </section>
  );
}

function KeyFigures({
  figures,
  locale,
}: {
  figures: KeyFigure[];
  locale: string;
}) {
  return (
    <div className="mt-16 sm:mt-24">
      <Rule />
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {figures.map((figure, index) => {
          // The flag opts in; the check keeps a mislabelled phrase static.
          const numeric = figure.numeric && PURE_NUMBER.test(figure.value);
          return (
            <FadeIn
              key={figure.label}
              delay={index * 0.08}
              className={cn(
                "min-w-0 border-mist py-6 pr-4 sm:py-8",
                // Vertical rules between columns; horizontal between rows on mobile.
                index % 2 === 1 && "border-l pl-5 sm:pl-6",
                index >= 2 && "border-t lg:border-t-0",
                index === 2 && "lg:border-l lg:pl-6",
              )}
            >
              <dt className="eyebrow flex items-center justify-between gap-3 text-slate">
                <span className="min-w-0">{figure.label}</span>
                {numeric && (
                  <Sparkline
                    variant={index}
                    delay={0.2 + index * 0.08}
                    className="shrink-0 text-gold-deep"
                  />
                )}
              </dt>
              <dd className="font-display mt-2 text-2xl leading-tight font-light text-gold-deep tabular-nums sm:mt-3 sm:text-4xl">
                {numeric ? (
                  <CountUp
                    value={figure.value}
                    locale={locale}
                    prefix={figure.prefix}
                    suffix={figure.suffix}
                    delay={0.1 + index * 0.08}
                  />
                ) : (
                  <>
                    {figure.prefix}
                    {figure.value}
                    {figure.suffix}
                  </>
                )}
              </dd>
              {figure.detail && (
                <dd className="mt-2 text-sm text-slate">{figure.detail}</dd>
              )}
            </FadeIn>
          );
        })}
      </dl>
      <DoubleRule delay={0.3} />
    </div>
  );
}
