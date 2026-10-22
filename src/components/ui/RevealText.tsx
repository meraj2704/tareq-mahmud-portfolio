"use client";

import { animate, useInView } from "framer-motion";
import { Fragment, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { MOBILE_QUERY } from "@/lib/useIsMobile";

interface RevealTextProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  // Classes for the *highlighted* word.
  accentClassName?: string;
  // Put each word on its own line.
  stacked?: boolean;
}

const HIGHLIGHT = /^(.*?)\*(.+?)\*(.*)$/;

// On mobile, headings that wrap past this many lines fade in as one block.
const MAX_MASKED_LINES = 2;

// Reveals a heading line by line from behind a mask. Wrap one word in
// *asterisks* to set it in italic. Mobile gets a quicker, lighter reveal.
export function RevealText({
  text,
  as: Tag = "h2",
  className,
  accentClassName,
  stacked = false,
}: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(" ");

  useEffect(() => {
    const heading = ref.current;
    if (!inView || !heading) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const masks = Array.from(
      heading.querySelectorAll<HTMLElement>("[data-mask]"),
    );
    const words = masks.map((mask) => mask.firstElementChild as HTMLElement);
    let line = -1;
    let lineTop = Number.NEGATIVE_INFINITY;

    // Words sharing an offsetTop sit on the same rendered line.
    const lines = masks.map((mask) => {
      if (mask.offsetTop > lineTop + 2) {
        line += 1;
        lineTop = mask.offsetTop;
      }
      return line;
    });

    if (mobile && !reduceMotion && line + 1 > MAX_MASKED_LINES) {
      words.forEach((word) => (word.style.transform = "none"));
      animate(
        heading,
        { opacity: [0, 1], y: [12, 0] },
        { duration: 0.4, ease: "easeOut" },
      );
      return;
    }

    words.forEach((word, index) => {
      animate(
        word,
        { y: "0%" },
        {
          duration: reduceMotion ? 0 : mobile ? 0.4 : 0.6,
          delay: reduceMotion ? 0 : lines[index] * (mobile ? 0.08 : 0.1),
          ease: "easeOut",
        },
      );
    });
  }, [inView]);

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text.replace(/\*/g, "")}</span>
      {words.map((word, index) => {
        const match = word.match(HIGHLIGHT);
        return (
          <Fragment key={index}>
            <span
              data-mask
              aria-hidden="true"
              className={cn(
                "-mb-[0.12em] overflow-hidden pb-[0.12em] align-top",
                stacked ? "block" : "inline-block",
              )}
            >
              <span
                className="inline-block"
                style={{ transform: "translateY(110%)" }}
              >
                {match ? (
                  <>
                    {match[1]}
                    <em className={cn("italic", accentClassName)}>{match[2]}</em>
                    {match[3]}
                  </>
                ) : (
                  word
                )}
              </span>
            </span>
            {!stacked && index < words.length - 1 && " "}
          </Fragment>
        );
      })}
    </Tag>
  );
}
