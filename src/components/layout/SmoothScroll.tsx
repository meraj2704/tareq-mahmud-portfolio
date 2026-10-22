"use client";

import Lenis from "lenis";
import { cancelFrame, frame, type FrameData } from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { MOBILE_QUERY } from "@/lib/useIsMobile";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

interface SmoothScrollValue {
  lenis: RefObject<Lenis | null>;
  scrollTo: (hash: string) => boolean;
}

// Scrolls so the target sits just below the sticky navbar. Returns false when
// the hash has no target, leaving the browser to handle it.
function scrollToHash(hash: string, lenis: Lenis | null) {
  let top = 0;
  if (hash !== "#") {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return false;
    // A numeric target, because Lenis subtracts scroll-padding from elements.
    top = target.getBoundingClientRect().top + window.scrollY;
  }

  const navbar = document.querySelector<HTMLElement>("[data-navbar]");
  const offset = -(navbar?.offsetHeight ?? 0);
  if (lenis) lenis.scrollTo(top, { offset });
  else window.scrollTo(0, Math.max(0, top + offset));

  if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  return true;
}

const SmoothScrollContext = createContext<SmoothScrollValue>({
  lenis: { current: null },
  scrollTo: (hash) => scrollToHash(hash, null),
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// True during prerender so Lenis only starts once the client allows motion.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );
}

// Lenis smooths wheel scrolling only; touch keeps native scrolling. Off for
// visitors who prefer reduced motion.
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const instance = new Lenis({
      duration: 1.1,
      easing: easeOutExpo,
      smoothWheel: true,
      syncTouch: false,
      // Lets the message textarea scroll its own text.
      allowNestedScroll: true,
    });
    lenis.current = instance;

    // Runs on framer-motion's frame loop so scroll-driven motion stays in step.
    const update = (data: FrameData) => instance.raf(data.timestamp);
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      instance.destroy();
      lenis.current = null;
    };
  }, [reducedMotion]);

  // In-page links scroll through Lenis. Listens on window so handlers that
  // already called preventDefault (like the mobile menu) take precedence.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (hash && scrollToHash(hash, lenis.current)) event.preventDefault();
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const value = useMemo<SmoothScrollValue>(
    () => ({ lenis, scrollTo: (hash) => scrollToHash(hash, lenis.current) }),
    [],
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

// Mouse and trackpad scrolling runs through Lenis, so stopping it is enough.
const WHEEL_QUERY = "(pointer: fine)";

// Locks page scroll while an overlay is open. Give the overlay
// data-lenis-prevent so it can still scroll itself.
export function useScrollLock(locked: boolean) {
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!locked) return;

    const instance = lenis.current;
    if (
      instance &&
      !window.matchMedia(MOBILE_QUERY).matches &&
      window.matchMedia(WHEEL_QUERY).matches
    ) {
      instance.stop();
      return () => instance.start();
    }

    // Touch scrolling is native, so lock it with overflow.
    const root = document.documentElement;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [locked, lenis]);
}
