"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { ContactChannel, SiteContent } from "@/data/content";
import { useScrollLock, useSmoothScroll } from "@/components/layout/SmoothScroll";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";

interface NavbarProps {
  brand: string;
  content: SiteContent["nav"];
  channels: ContactChannel[];
  cv: SiteContent["hero"]["primaryCta"];
}

const linkStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

// Mirrors the theme colors in globals.css; used for the browser bar tint.
const PAPER = "#f7f6f2";
const INK = "#0a1a33";

// True while an ink section (Contact, the footer) has reached the bottom
// edge of the navbar.
function isOverInk(header: HTMLElement) {
  const edge = header.offsetHeight;
  for (const section of document.querySelectorAll('[data-tone="ink"]')) {
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= edge && bottom > edge) return true;
  }
  return false;
}

// Matches Tailwind's `lg` breakpoint, where the inline nav takes over.
const DESKTOP_QUERY = "(width >= 64rem)";

// The section crossing a line 40% down the viewport, or null when none of
// the given sections does (in the hero, say).
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) setActive(id);
          else setActive((current) => (current === id ? null : current));
        }
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    for (const id of key.split(" ")) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}

export function Navbar({ brand, content, channels, cv }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pendingHash = useRef<string | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const { scrollTo } = useSmoothScroll();
  // Contact has no inline link, but the menu lists it.
  const active = useActiveSection([
    ...content.items.map((item) => item.id),
    "contact",
  ]);

  // Over ink sections the navbar turns ink too, so it never sits on the
  // dark Contact section as a pale band.
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 8);
    if (header.current) setDark(isOverInk(header.current));
  });

  // Tints the mobile browser bar to match what sits under it.
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark || open ? INK : PAPER);
  }, [dark, open]);

  // Lock page scroll behind the menu.
  useScrollLock(open);

  // Drop the menu if the viewport grows into the desktop layout.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open]);

  // Runs a menu link's scroll once the menu has closed and the lock is off.
  useEffect(() => {
    if (open || !pendingHash.current) return;
    scrollTo(pendingHash.current);
    pendingHash.current = null;
  }, [open, scrollTo]);

  const close = () => setOpen(false);

  // Menu links close the menu first, then scroll.
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    const hash = event.currentTarget.getAttribute("href");
    if (hash?.startsWith("#")) {
      event.preventDefault();
      pendingHash.current = hash;
    }
    setOpen(false);
  };

  // Used by the close button and Escape; link taps leave focus to the page.
  const dismiss = () => {
    setOpen(false);
    menuButton.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <header
        ref={header}
        data-navbar
        data-tone="paper"
        className={cn(
          "sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-colors duration-500",
          !scrolled && !open
            ? "border-transparent bg-paper"
            : cn(
                "backdrop-blur-md backdrop-saturate-150",
                dark ? "border-white/10 bg-ink/85" : "border-mist bg-paper/80",
              ),
        )}
      >
        {/* Reading progress along the bottom edge; the inline nav's gold
            dot does this job on desktop. */}
        <motion.div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 -bottom-px h-px origin-left bg-gold transition-opacity duration-500 lg:hidden",
            !scrolled && "opacity-0",
          )}
          style={{ scaleX: scrollYProgress }}
        />
        <Container className="flex h-14 items-center justify-between sm:h-16">
          <a
            href="#top"
            onClick={close}
            className={cn(
              "font-display flex h-11 items-center text-xl leading-none transition-colors duration-500 sm:text-2xl",
              dark ? "text-white" : "text-ink",
              linkStyles,
            )}
          >
            {brand}
          </a>

          <nav className="hidden items-center gap-10 lg:flex">
            <ul className="flex items-center gap-7">
              {content.items.map((item) => {
                const current = item.id === active;
                return (
                  <li key={item.id}>
                    {/* The underline slides in from the left on hover and
                        out to the right; a gold dot marks the section in view. */}
                    <a
                      href={`#${item.id}`}
                      aria-current={current ? "location" : undefined}
                      className={cn(
                        "relative text-sm transition-colors duration-300",
                        "before:absolute before:top-1/2 before:-left-3 before:size-1 before:-translate-y-1/2 before:rounded-full before:bg-gold before:transition-opacity before:duration-500",
                        "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100",
                        dark
                          ? "after:bg-white hover:text-white"
                          : "after:bg-ink hover:text-ink",
                        current ? "before:opacity-100" : "before:opacity-0",
                        current && (dark ? "text-white" : "text-ink"),
                        !current && (dark ? "text-white/60" : "text-slate"),
                        linkStyles,
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            <ButtonLink
              href="#contact"
              size="sm"
              variant={dark ? "inverse" : "primary"}
            >
              {content.cta}
            </ButtonLink>
          </nav>

          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={content.openMenu}
            className={cn(
              "-mr-2.5 flex size-11 items-center justify-center transition-colors duration-500 lg:hidden",
              dark ? "text-white" : "text-ink",
              linkStyles,
            )}
          >
            <Icon name="menu" />
          </button>
        </Container>
      </header>

      <AnimatePresence>
        {open && (
          <MobileMenu
            brand={brand}
            content={content}
            channels={channels}
            cv={cv}
            active={active}
            onNavigate={navigate}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface MobileMenuProps extends NavbarProps {
  active: string | null;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
  onDismiss: () => void;
}

const overlayLinkStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

// Each link rises in turn from behind its line as the curtain drops.
const rise = (index: number) => ({
  initial: { y: "100%" },
  animate: { y: "0%" },
  transition: { duration: 0.8, delay: 0.15 + index * 0.05, ease: EASE_OUT },
}) as const;

// The contact details and CV button fade up after the links.
const reveal = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: 0.15 + index * 0.05, ease: EASE_OUT },
}) as const;

// The overlay drops like a curtain from the navbar and lifts on close.
// Visitors who prefer reduced motion get a plain fade.
const curtain = {
  initial: { clipPath: "inset(0% 0% 100% 0%)" },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.7, ease: EASE_OUT },
  },
  exit: {
    clipPath: "inset(0% 0% 100% 0%)",
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  },
} as const;

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
} as const;

// Full-screen ink menu for small screens. Sits outside the header because
// the header's backdrop blur would otherwise trap this fixed layer inside it.
function MobileMenu({
  brand,
  content,
  channels,
  cv,
  active,
  onNavigate,
  onDismiss,
}: MobileMenuProps) {
  const reducedMotion = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const items = [...content.items, { id: "contact", label: content.cta }];
  const details = channels.filter(
    (channel) =>
      channel.href && (channel.icon === "mail" || channel.icon === "phone"),
  );

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  // Escape closes; Tab cycles within the menu.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onDismiss();
      return;
    }
    if (event.key !== "Tab" || !dialog.current) return;
    const focusable = dialog.current.querySelectorAll<HTMLElement>("a, button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <motion.div
      ref={dialog}
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label={brand}
      onKeyDown={handleKeyDown}
      {...(reducedMotion ? fade : curtain)}
      data-lenis-prevent
      data-tone="ink"
      className="fixed inset-0 z-60 overflow-y-auto overscroll-contain bg-ink text-white lg:hidden"
    >
      <div className="flex min-h-svh flex-col pt-[env(safe-area-inset-top)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Container className="flex h-14 shrink-0 items-center justify-between border-b border-white/15 sm:h-16">
          <a
            href="#top"
            onClick={onNavigate}
            className={cn(
              "font-display flex h-11 items-center text-xl leading-none text-white sm:text-2xl",
              overlayLinkStyles,
            )}
          >
            {brand}
          </a>
          <button
            ref={closeButton}
            type="button"
            onClick={onDismiss}
            aria-label={content.closeMenu}
            className={cn(
              "-mr-2.5 flex size-11 items-center justify-center text-white",
              overlayLinkStyles,
            )}
          >
            <Icon name="close" />
          </button>
        </Container>

        <Container className="flex flex-1 flex-col justify-between gap-10 pt-8">
          <nav>
            <ul>
              {/* Each line masks its link; the section in view is set in
                  italic and keeps a gold number while the others dim. */}
              {items.map((item, index) => (
                <li key={item.id} className="overflow-hidden">
                  <motion.a
                    {...rise(index)}
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={item.id === active ? "location" : undefined}
                    className={cn(
                      "group flex min-h-12 items-baseline gap-4 py-1.5",
                      overlayLinkStyles,
                    )}
                  >
                    <span
                      className={cn(
                        "eyebrow w-6 shrink-0 transition-colors",
                        item.id === active || !active
                          ? "text-gold"
                          : "text-white/40 group-active:text-gold",
                      )}
                    >
                      {pad2(index + 1)}
                    </span>
                    <span
                      className={cn(
                        "font-display text-[clamp(2rem,9vw,2.75rem)] leading-[1.1] font-light tracking-[-0.02em] text-white transition-colors group-active:text-gold",
                        item.id === active && "italic",
                      )}
                    >
                      {item.label}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div {...reveal(items.length)}>
            <ul className="border-t border-white/15">
              {details.map((channel) => (
                <li key={channel.label} className="border-b border-white/15">
                  <a
                    href={channel.href}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-4 py-2",
                      overlayLinkStyles,
                    )}
                  >
                    <span className="eyebrow text-white/50">
                      {channel.label}
                    </span>
                    <span className="min-w-0 truncate text-right text-white">
                      {channel.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <ButtonLink
              href={cv.href}
              download={cv.download}
              variant="inverse"
              onClick={onNavigate}
              className="mt-6 w-full"
            >
              <Icon name="download" className="size-4 group-hover:translate-y-0.5" />
              {cv.label}
            </ButtonLink>
          </motion.div>
        </Container>
      </div>
    </motion.div>
  );
}
