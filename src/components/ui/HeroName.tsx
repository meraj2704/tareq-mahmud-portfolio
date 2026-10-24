"use client";

import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import {
  DESKTOP_QUERY,
  FINE_POINTER_QUERY,
  REDUCED_MOTION_QUERY,
  useMediaQuery,
} from "@/lib/useMediaQuery";
import { RevealText } from "./RevealText";

// The resting look matches the `font-display` utility with `font-light`.
const REST = { wght: 300, soft: 50 };
// Cursor ranges, kept narrow so the name always reads cleanly.
const WGHT_SWING = 110;
const SOFT_RANGE = [10, 90] as const;
// Scrolling out of view: a little heavier, a lower optical size.
const EXIT_WGHT = 50;
const EXIT_OPSZ = 0.5;
// Fraunces' opsz axis.
const OPSZ_MIN = 9;
const OPSZ_MAX = 144;

const POINTER_SPRING = { stiffness: 70, damping: 18, mass: 0.6 };
// Touch and smaller screens: one light-to-resting ease on load, then still.
const INTRO_WGHT = 220;
const INTRO = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;

interface HeroNameProps {
  text: string;
  // Classes for the h1; the display face comes from the wrapper.
  className?: string;
}

// The hero name in Fraunces, its variable axes alive. On desktop with a
// mouse, the cursor steers weight (across) and softness (down), and the name
// settles as it scrolls away. Elsewhere it eases in from a lighter weight
// once, then holds still. Static for visitors who prefer reduced motion.
export function HeroName({ text, className }: HeroNameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY, true);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const live = desktop && finePointer;

  const introWght = useMotionValue(INTRO_WGHT);
  const introPlayed = useRef(false);
  const intro = useTransform(
    introWght,
    (wght) => `"wght" ${wght.toFixed(1)}, "SOFT" ${REST.soft}`,
  );

  // Cursor position across the viewport, 0 to 1; centered at rest.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, POINTER_SPRING);
  const smoothY = useSpring(pointerY, POINTER_SPRING);
  // Resting optical size for the rendered font size; 0 until measured.
  const opsz = useMotionValue(0);
  // Document offset of the name's bottom edge.
  const bottom = useRef(1);
  const { scrollY } = useScroll();

  const settings = useTransform(
    [smoothX, smoothY, scrollY, opsz],
    ([x, y, scroll, rest]: number[]) => {
      if (!rest) return `"SOFT" ${REST.soft}`;
      const exit = Math.min(1, Math.max(0, scroll / bottom.current));
      const wght = REST.wght + (x - 0.5) * WGHT_SWING + exit * EXIT_WGHT;
      const soft = SOFT_RANGE[0] + y * (SOFT_RANGE[1] - SOFT_RANGE[0]);
      const size = rest - exit * rest * (1 - EXIT_OPSZ);
      return `"wght" ${wght.toFixed(1)}, "opsz" ${Math.max(OPSZ_MIN, size).toFixed(1)}, "SOFT" ${soft.toFixed(1)}`;
    },
  );

  // Tracks the font size (for opsz) and where the name leaves the viewport.
  useEffect(() => {
    const heading = ref.current?.firstElementChild;
    if (reduceMotion || !live || !(heading instanceof HTMLElement)) return;

    const measure = () => {
      const rect = heading.getBoundingClientRect();
      bottom.current = Math.max(1, rect.bottom + window.scrollY);
      const size = parseFloat(getComputedStyle(heading).fontSize);
      opsz.set(Math.min(OPSZ_MAX, Math.max(OPSZ_MIN, size)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    return () => observer.disconnect();
  }, [reduceMotion, live, opsz]);

  // Plays once per page load; an interrupted run starts over.
  useEffect(() => {
    if (reduceMotion || live || introPlayed.current) return;
    const controls = animate(introWght, REST.wght, {
      ...INTRO,
      onComplete: () => (introPlayed.current = true),
    });
    return () => {
      controls.stop();
      if (!introPlayed.current) introWght.jump(INTRO_WGHT);
    };
  }, [reduceMotion, live, introWght]);

  useEffect(() => {
    if (reduceMotion || !live) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      // Off screen, the name has nothing to respond to.
      if (window.scrollY > bottom.current) return;
      pointerX.set(event.clientX / window.innerWidth);
      pointerY.set(event.clientY / window.innerHeight);
    };
    const onLeave = () => {
      pointerX.set(0.5);
      pointerY.set(0.5);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [reduceMotion, live, pointerX, pointerY]);

  return (
    // `display: contents` keeps the h1 in the hero's layout; it inherits the
    // face and the live variation settings from here.
    <motion.div
      ref={ref}
      className="font-display contents"
      style={
        reduceMotion
          ? undefined
          : { fontVariationSettings: live ? settings : intro }
      }
    >
      <RevealText as="h1" text={text} stacked className={className} />
    </motion.div>
  );
}
