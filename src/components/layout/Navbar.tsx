"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
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

interface NavbarProps {
  brand: string;
  content: SiteContent["nav"];
  channels: ContactChannel[];
  cv: SiteContent["hero"]["primaryCta"];
}

const linkStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

// Matches Tailwind's `lg` breakpoint, where the inline nav takes over.
const DESKTOP_QUERY = "(width >= 64rem)";

export function Navbar({ brand, content, channels, cv }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pendingHash = useRef<string | null>(null);
  const { scrollY } = useScroll();
  const { scrollTo } = useSmoothScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

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
        data-navbar
        className={cn(
          "sticky top-0 z-50 border-b bg-paper pt-[env(safe-area-inset-top)] transition-colors duration-300",
          scrolled || open
            ? "border-mist max-sm:bg-paper/80 max-sm:backdrop-blur-md max-sm:backdrop-saturate-150"
            : "border-transparent",
        )}
      >
        <Container className="flex h-14 items-center justify-between sm:h-16">
          <a
            href="#top"
            onClick={close}
            className={cn(
              "font-display flex h-11 items-center text-xl leading-none text-ink sm:text-2xl",
              linkStyles,
            )}
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
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={content.openMenu}
            className={cn(
              "-mr-2.5 flex size-11 items-center justify-center text-ink lg:hidden",
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
            onNavigate={navigate}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface MobileMenuProps extends NavbarProps {
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
  onDismiss: () => void;
}

const overlayLinkStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

// Each link rises 12px in turn once the overlay has faded in.
const reveal = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: 0.1 + index * 0.05, ease: "easeOut" },
}) as const;

// Full-screen ink menu for small screens. Sits outside the header because
// the header's backdrop blur would otherwise trap this fixed layer inside it.
function MobileMenu({
  brand,
  content,
  channels,
  cv,
  onNavigate,
  onDismiss,
}: MobileMenuProps) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-lenis-prevent
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
              {items.map((item, index) => (
                <motion.li key={item.id} {...reveal(index)}>
                  <a
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "group flex min-h-12 items-baseline gap-4 py-1.5",
                      overlayLinkStyles,
                    )}
                  >
                    <span className="eyebrow w-6 shrink-0 text-gold">
                      {pad2(index + 1)}
                    </span>
                    <span className="font-display text-[clamp(2rem,9vw,2.75rem)] leading-[1.1] font-light tracking-[-0.02em] text-white transition-colors group-active:text-gold">
                      {item.label}
                    </span>
                  </a>
                </motion.li>
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
              <Icon name="download" className="size-4" />
              {cv.label}
            </ButtonLink>
          </motion.div>
        </Container>
      </div>
    </motion.div>
  );
}
