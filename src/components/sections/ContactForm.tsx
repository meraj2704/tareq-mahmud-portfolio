"use client";

import type { FormEvent } from "react";
import type { SiteContent } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface ContactFormProps {
  content: SiteContent["contact"]["form"];
  recipient: string;
}

const labelStyles = "eyebrow block text-white/60";

const fieldStyles =
  "mt-2 block w-full border-0 border-b border-white/30 bg-transparent px-0 py-3 text-lg text-white placeholder:text-white/30 transition-colors outline-none focus:border-gold";

// No backend yet: hands the message to the visitor's email app.
// Replace handleSubmit with an API call once a backend exists.
export function ContactForm({ content, recipient }: ContactFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name"));
    const email = String(data.get("email"));
    const message = String(data.get("message"));

    const params = new URLSearchParams({
      subject: `${content.subjectPrefix} ${name}`,
      body: `${message}\n\n— ${name} (${email})`,
    });
    // URLSearchParams encodes spaces as "+", which mail clients show literally.
    window.location.href = `mailto:${recipient}?${params.toString().replace(/\+/g, "%20")}`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="eyebrow text-gold">{content.title}</h3>
      <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10">
        <label className={labelStyles}>
          {content.name.label}
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={content.name.placeholder}
            className={fieldStyles}
          />
        </label>
        <label className={labelStyles}>
          {content.email.label}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={content.email.placeholder}
            className={fieldStyles}
          />
        </label>
        <label className={`${labelStyles} sm:col-span-2`}>
          {content.message.label}
          <textarea
            name="message"
            required
            rows={4}
            placeholder={content.message.placeholder}
            className={`${fieldStyles} resize-y`}
          />
        </label>
      </div>
      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-sm text-white/50">{content.note}</p>
        <Button type="submit" variant="inverse" className="shrink-0">
          {content.submit}
          <Icon name="arrowRight" className="size-4" />
        </Button>
      </div>
    </form>
  );
}
