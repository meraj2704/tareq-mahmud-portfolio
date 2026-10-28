"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { useIsMobile } from "@/lib/useIsMobile";

interface RuleProps {
  className?: string;
  delay?: number;
  // Closes a list the way a ledger total is double underlined.
  double?: boolean;
}

// A 1px ledger line that draws in from left to right.
export function Rule({ className, delay = 0, double = false }: RuleProps) {
  const mobile = useIsMobile();

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "origin-left",
        double ? "double-rule text-mist" : "h-px bg-mist",
        className,
      )}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: mobile ? 0.6 : 1.1, ease: EASE_OUT, delay }}
    />
  );
}

// An accounting double rule closing a total: two 1px lines, 3px apart,
// drawing in from left to right. Shown at once with reduced motion.
export function DoubleRule({ className, delay = 0 }: RuleProps) {
  const mobile = useIsMobile();
  const duration = mobile ? 0.4 : 0.6;

  return (
    <div aria-hidden="true" className="flex flex-col gap-[3px]">
      {[0, 0.12].map((stagger) => (
        <motion.div
          key={stagger}
          className={cn(
            "h-px origin-left bg-gold-deep motion-reduce:transform-none!",
            className,
          )}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration, ease: "easeOut", delay: delay + stagger }}
        />
      ))}
    </div>
  );
}
