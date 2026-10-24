"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/useIsMobile";

// Decorative trend lines, one per figure; they carry no data.
const SERIES = [
  [2, 3, 3, 5, 4, 6, 7, 9],
  [1, 2, 4, 3, 5, 5, 7, 8],
  [3, 4, 3, 5, 6, 5, 7, 8],
  [2, 2, 4, 5, 4, 6, 8, 9],
];

const WIDTH = 48;
const HEIGHT = 20;
// Keeps the stroke and end dot inside the viewBox.
const PAD = 2;

interface SparklineProps {
  // Picks the series.
  variant?: number;
  delay?: number;
  className?: string;
}

// A small line that draws in from left to right as it enters the viewport.
export function Sparkline({ variant = 0, delay = 0, className }: SparklineProps) {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();
  const series = SERIES[variant % SERIES.length];
  const min = Math.min(...series);
  const max = Math.max(...series);

  const points = series.map((value, index) => [
    PAD + (index / (series.length - 1)) * WIDTH,
    PAD + HEIGHT - ((value - min) / (max - min)) * HEIGHT,
  ]);
  const path = points
    .map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [endX, endY] = points[points.length - 1];

  const duration = reduceMotion ? 0 : mobile ? 0.8 : 1.2;
  const start = reduceMotion ? 0 : mobile ? delay * 0.6 : delay;

  return (
    <svg
      viewBox={`0 0 ${WIDTH + PAD * 2} ${HEIGHT + PAD * 2}`}
      fill="none"
      aria-hidden="true"
      className={cn("h-5 w-11", className)}
    >
      <motion.path
        d={path}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration, delay: start, ease: "easeOut" }}
      />
      <motion.circle
        cx={endX}
        cy={endY}
        r={1.75}
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: start + duration }}
      />
    </svg>
  );
}
