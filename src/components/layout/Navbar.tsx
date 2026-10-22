"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import type { SiteContent } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface NavbarProps {
  brand: string;
  content: SiteContent["nav"];
}

const linkStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function Navbar({ brand, content }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-paper transition-colors duration-300",
        scrolled || open ? "border-mist" : "border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <a
          href="#top"
          onClick={close}
          className={cn("font-display text-2xl leading-none text-ink", linkStyles)}
        >
          {brand}
        </a>

        <nav className="hidden items-center gap-10 lg:flex">
          <ul className="flex items-center gap-7">
            {content.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "text-sm text-slate underline-offset-[6px] transition-colors hover:text-ink hover:underline",
                    linkStyles,
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href="#contact" size="sm">
            {content.cta}
          </ButtonLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? content.closeMenu : content.openMenu}
          className={cn("-mr-2 flex size-10 items-center justify-center text-ink lg:hidden", linkStyles)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" className="border-t border-mist lg:hidden">
          <Container className="pb-6">
            <ul className="divide-y divide-mist">
              {content.items.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={close}
                    className={cn("flex items-baseline gap-4 py-4 text-ink", linkStyles)}
                  >
                    <span className="eyebrow text-slate">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <ButtonLink href="#contact" onClick={close} className="mt-4 w-full">
              {content.cta}
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
