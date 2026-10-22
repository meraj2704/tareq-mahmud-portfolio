"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/useIsMobile";

interface RuleProps {
  className?: string;
  delay?: number;
}

// A 1px ledger line that draws in from left to right.
export function Rule({ className, delay = 0 }: RuleProps) {
  const mobile = useIsMobile();

  return (
    <motion.div
      aria-hidden="true"
      className={cn("h-px origin-left bg-mist", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: mobile ? 0.4 : 0.6, ease: "easeOut", delay }}
    />
  );
}
