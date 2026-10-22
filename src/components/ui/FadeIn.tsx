"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/lib/useIsMobile";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Fades content in once as it enters the viewport. On mobile it also
// rises 12px, quicker; the offset rides a CSS variable so it is in place
// before hydration and only applies below `sm`.
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const mobile = useIsMobile();

  return (
    <motion.div
      className={cn("max-sm:motion-safe:translate-y-(--fade-y)", className)}
      initial={{ opacity: 0, "--fade-y": "12px" }}
      whileInView={{ opacity: 1, "--fade-y": "0px" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: mobile ? 0.4 : 0.6,
        delay: mobile ? delay * 0.6 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
