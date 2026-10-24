"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  FINE_POINTER_QUERY,
  REDUCED_MOTION_QUERY,
  useMediaQuery,
} from "@/lib/useMediaQuery";

// What earns a tick: things that can be clicked.
const INTERACTIVE =
  "a[href], button, [role='button'], summary, label[for], select, input[type='submit'], input[type='button'], input[type='checkbox'], input[type='radio']";
const DARK_TONES = new Set(["emerald", "ink"]);
const FOLLOW = { stiffness: 700, damping: 45, mass: 0.35 };
// The mark sits below and right of the pointer, clear of the native cursor.
const OFFSET = 16;
const SIZE = 18;

interface CursorState {
  visible: boolean;
  // Over a link or button: the dot becomes a tick.
  ticked: boolean;
  dark: boolean;
}

// A small gold dot that trails the cursor and, over anything clickable,
// turns into a hand-drawn tick. Mouse and trackpad only; none for visitors
// who prefer reduced motion.
export function CursorTick() {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY, true);
  if (!finePointer || reduceMotion) return null;
  return <Follower />;
}

function Follower() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, FOLLOW);
  const smoothY = useSpring(y, FOLLOW);
  const [state, setState] = useState<CursorState>({
    visible: false,
    ticked: false,
    dark: false,
  });
  const visible = useRef(false);

  useEffect(() => {
    const update = (next: Partial<CursorState>) =>
      setState((prev) =>
        Object.entries(next).every(
          ([key, value]) => prev[key as keyof CursorState] === value,
        )
          ? prev
          : { ...prev, ...next },
      );

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visible.current) {
        // Appear in place rather than sliding in from the corner.
        smoothX.jump(event.clientX);
        smoothY.jump(event.clientY);
        visible.current = true;
        update({ visible: true });
      }
    };

    // Hover changes are rare next to moves, so state is set only here.
    const onOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target;
      const control = target.closest(INTERACTIVE);
      const tone = target.closest<HTMLElement>("[data-tone]")?.dataset.tone;
      update({
        ticked:
          !!control &&
          !control.matches(":disabled, [aria-disabled='true']"),
        dark: DARK_TONES.has(tone ?? ""),
      });
    };

    const onLeave = () => {
      visible.current = false;
      update({ visible: false, ticked: false });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, smoothX, smoothY]);

  const draw = { duration: 0.28, ease: "easeOut" } as const;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-110"
      style={{ x: smoothX, y: smoothY }}
      initial={false}
      animate={{ opacity: state.visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        className={cn(
          "block transition-colors duration-300",
          state.dark ? "text-gold" : "text-gold-deep",
        )}
        style={{ transform: `translate(${OFFSET - SIZE / 2}px, ${OFFSET - SIZE / 2}px)` }}
      >
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={3}
          fill="currentColor"
          initial={false}
          animate={{ scale: state.ticked ? 0 : 1, opacity: state.ticked ? 0 : 1 }}
          transition={draw}
        />
        {/* A short stroke down, then a longer one up and out, slightly bowed. */}
        <motion.path
          d="M3.4 9.9 Q5.6 11.3 7.2 14.2 Q9.9 8.1 15 3.8"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={
            state.ticked
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={state.ticked ? draw : { duration: 0.15 }}
        />
      </svg>
    </motion.div>
  );
}
