"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { useIsMobile } from "@/lib/useIsMobile";

// Fills a photo frame and moves the photo within it.
// - Wider screens: the photo drifts a few percent against the scroll,
//   scaled up slightly so the drift never shows an edge.
// - Mobile, where photos run edge to edge: the photo is uncovered from the
//   bottom up as it enters view, easing back from a zoom. The wipe rides CSS
//   variables so it is in place before hydration and only applies below `sm`.
// Both are off for visitors who prefer reduced motion.
export function PhotoMotion({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const drift = !mobile && !reducedMotion;

  // The variables are animated on an unclipped layer and inherited by the
  // clipped one: a fully clipped element never counts as in view.
  return (
    <motion.div
      ref={frame}
      className="absolute inset-0"
      initial={{ "--wipe": "100%", "--zoom": 1.15 }}
      whileInView={{ "--wipe": "0%", "--zoom": 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.4, ease: EASE_OUT }}
    >
      <div className="size-full bg-mist max-sm:motion-safe:[clip-path:inset(var(--wipe)_0_0_0)]">
        <motion.div
          className={cn(
            "relative size-full max-sm:motion-safe:scale-(--zoom)",
            drift && "scale-106",
          )}
          style={drift ? { y } : undefined}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
