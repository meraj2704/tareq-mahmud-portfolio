import { contactEmail, type SiteContent } from "@/data/content";
import { FadeIn } from "@/components/ui/FadeIn";
import { Rule } from "@/components/ui/Rule";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "./ContactForm";

export function Contact({ content }: { content: SiteContent["contact"] }) {
  return (
    <Section id="contact" heading={content} tone="ink" display>
      <div className="grid gap-y-16 md:grid-cols-12 md:gap-x-8">
        <FadeIn className="md:col-span-5">
          <p className="max-w-md text-lg leading-relaxed text-white/70">
            {content.intro}
          </p>
          <dl className="mt-12">
            {content.channels.map((channel) => {
              const external = channel.href?.startsWith("http");
              return (
                <div key={channel.label}>
                  <Rule className="bg-white/15" />
                  <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <dt className="eyebrow text-gold">{channel.label}</dt>
                    <dd className="font-display text-xl wrap-break-word text-white sm:text-2xl">
                      {channel.href ? (
                        <a
                          href={channel.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                        >
                          {channel.value}
                        </a>
                      ) : (
                        channel.value
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
            <Rule className="bg-white/15" />
          </dl>
        </FadeIn>

        <FadeIn className="md:col-span-6 md:col-start-7" delay={0.1}>
          <ContactForm content={content.form} recipient={contactEmail} />
        </FadeIn>
      </div>
    </Section>
  );
}
