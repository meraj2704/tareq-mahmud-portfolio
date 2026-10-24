"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { MOBILE_QUERY } from "@/lib/useIsMobile";

// Only plain integers count up: not years in a phrase, not words.
export const PURE_NUMBER = /^\d+$/;

interface CountUpProps {
  // Digits only, e.g. "1200".
  value: string;
  // BCP 47 tag for digit and grouping style, e.g. "en-US" or "bn-BD".
  locale: string;
  // Static text either side of the number, e.g. "+" or "%".
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Pads to the value's digit count so the width holds while counting
// (on tabular figures): "1200" runs "0,000" → "1,200".
function numberFormat(locale: string, value: string) {
  return new Intl.NumberFormat(locale, { minimumIntegerDigits: value.length });
}

// Counts a pure number up from zero as it enters the viewport, with
// thousands separators for the locale. Renders the final value until then,
// so it reads correctly before hydration and with reduced motion. Anything
// that is not a pure number renders as is.
export function CountUp({
  value,
  locale,
  prefix = "",
  suffix = "",
  className,
  delay = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const countable = PURE_NUMBER.test(value);

  // Zero the figure before the first paint, unless motion is reduced.
  useLayoutEffect(() => {
    const figure = ref.current;
    if (!countable || !figure || prefersReducedMotion()) return;
    figure.textContent = numberFormat(locale, value).format(0);
  }, [countable, locale, value]);

  useEffect(() => {
    const figure = ref.current;
    if (!countable || !inView || !figure || prefersReducedMotion()) return;

    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const format = numberFormat(locale, value);
    const controls = animate(0, Number(value), {
      duration: mobile ? 0.9 : 1.4,
      delay: mobile ? delay * 0.6 : delay,
      ease: "easeOut",
      onUpdate: (current) => {
        figure.textContent = format.format(Math.round(current));
      },
    });

    return () => controls.stop();
  }, [countable, inView, locale, value, delay]);

  if (!countable) {
    return (
      <span className={className}>
        {prefix}
        {value}
        {suffix}
      </span>
    );
  }

  const formatted = numberFormat(locale, value).format(Number(value));

  return (
    <span className={className}>
      <span className="sr-only">
        {prefix}
        {formatted}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix}
        <span ref={ref} className="tabular-nums">
          {formatted}
        </span>
        {suffix}
      </span>
    </span>
  );
}
