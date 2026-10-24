import { contactEmail, type SiteContent } from "@/data/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { Icon } from "@/components/ui/Icon";
import { Rule } from "@/components/ui/Rule";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "./ContactForm";

// Gives a long email address a line-break point before the "@".
function breakBeforeAt(value: string) {
  const at = value.indexOf("@");
  if (at <= 0) return value;
  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  );
}

export function Contact({ content }: { content: SiteContent["contact"] }) {
  return (
    <Section id="contact" heading={content} tone="ink" display glow>
      <div className="grid gap-y-14 sm:gap-y-16 md:grid-cols-12 md:gap-x-8">
        <FadeIn className="md:col-span-5">
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            {content.intro}
          </p>
          <div className="mt-8 sm:mt-12">
            {content.channels.map((channel) => {
              const external = channel.href?.startsWith("http");
              return (
                <div key={channel.label}>
                  <Rule className="bg-white/15" />
                  {/* On mobile the link stretches over the whole row (56px+).
                      Wider up, a value too long to sit beside its label drops below it. */}
                  <dl className="relative flex flex-col gap-1 py-5 transition-colors max-sm:min-h-14 max-sm:justify-center max-sm:py-3 max-sm:pr-10 max-sm:has-[a:active]:bg-white/5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
                    <dt className="eyebrow text-gold">{channel.label}</dt>
                    <dd className="font-display min-w-0 text-xl wrap-break-word text-white max-sm:text-lg sm:text-2xl">
                      {channel.href ? (
                        <a
                          href={channel.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold max-sm:no-underline max-sm:after:absolute max-sm:after:inset-0"
                        >
                          {breakBeforeAt(channel.value)}
                        </a>
                      ) : (
                        channel.value
                      )}
                      {channel.href && (
                        <Icon
                          name="arrowRight"
                          className="absolute top-1/2 right-0 size-5 -translate-y-1/2 text-gold sm:hidden"
                        />
                      )}
                    </dd>
                  </dl>
                </div>
              );
            })}
            <Rule className="bg-white/15" />
          </div>
        </FadeIn>

        <FadeIn className="md:col-span-6 md:col-start-7" delay={0.1}>
          <ContactForm content={content.form} recipient={contactEmail} />
        </FadeIn>
      </div>
    </Section>
  );
}
