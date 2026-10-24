"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  DESKTOP_QUERY,
  REDUCED_MOTION_QUERY,
  useMediaQuery,
} from "@/lib/useMediaQuery";

interface Point {
  x: number;
  y: number;
  // Corner rounding where the line turns at this point.
  r?: number;
}

interface ToneBand {
  top: number;
  bottom: number;
  dark: boolean;
}

interface Layout {
  // Desktop: the full rail, drawn with scroll. Smaller screens: only the
  // closing stroke beside the Contact title, drawn as it enters view.
  mode: "rail" | "mark";
  width: number;
  height: number;
  d: string;
  // Section tones, as fractions of the height.
  bands: ToneBand[];
  dot: Point;
  // The polyline the path follows, with cumulative lengths, for mapping
  // scroll position to drawn length.
  points: Point[];
  lengths: number[];
  // Main's top in document coordinates.
  originY: number;
  docHeight: number;
  // Changes whenever anything drawn changes.
  key: string;
}

// Rendered once per page, so a fixed id is safe.
const GRADIENT_ID = "growth-line-tone";
const DARK_TONES = new Set(["emerald", "ink"]);
const GOLD = "var(--color-gold)";
const GOLD_DEEP = "var(--color-gold-deep)";
// The drawn tip trails this far down the viewport.
const TIP = 0.62;
// The closing mark draws once it is this far up the viewport.
const REVEAL = 0.85;
// Vertical distance between chart points in the rail.
const STEP = 120;
// Settles bursts of resizes into one measure.
const DEBOUNCE = 150;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

function toward(from: Point, to: Point, length: number): Point {
  const ratio = length / (distance(from, to) || 1);
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

// A polyline with softened corners, like a chart drawn by hand.
function toPath(points: Point[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [prev, point, next] = [points[i - 1], points[i], points[i + 1]];
    const r = Math.min(
      point.r ?? 0,
      distance(prev, point) / 2,
      distance(point, next) / 2,
    );
    const a = toward(point, prev, r);
    const b = toward(point, next, r);
    d += ` L${f(a.x)} ${f(a.y)} Q${f(point.x)} ${f(point.y)} ${f(b.x)} ${f(b.y)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${f(last.x)} ${f(last.y)}`;
}

// Down the left rail with gentle dips and rises, drifting inward, then along
// the gap under the Contact title and sharply up to a dot beside it.
function railPoints(
  start: number,
  contentLeft: number,
  safeLeft: number,
  title: DOMRect,
  dot: Point,
): Point[] {
  const inner = contentLeft - 14;
  const outer = Math.min(inner, Math.max(10, safeLeft + 6, contentLeft - 88));
  // Inside the gap between the title and the section body.
  const low = title.bottom + 44;
  const count = Math.max(2, Math.round((low - start) / STEP));
  const points: Point[] = [];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const edge = i === 0 || i === count;
    const wave = edge
      ? 0
      : 0.2 * Math.sin(i * 1.9 + 0.4) + 0.1 * Math.sin(i * 0.7 + 1.3);
    const jitter = edge ? 0 : (0.25 * Math.sin(i * 2.3)) / count;
    const value = edge ? (i ? 1 : 0.1) : clamp(0.1 + 0.75 * t + wave);
    points.push({
      x: outer + value * (inner - outer),
      y: start + (t + jitter) * (low - start),
      r: 10,
    });
  }

  points.push(
    { x: inner + (dot.x - inner) * 0.45, y: low - 10, r: 8 },
    { x: dot.x - 44, y: low + 12, r: 3 },
    dot,
  );
  return points;
}

// A short upward stroke ending in the dot beside the Contact title: in the
// column gap when the title sits right of its eyebrow, otherwise in the safe
// part of the left gutter. None if the gutter has no room.
function markPoints(
  contentLeft: number,
  safeLeft: number,
  title: DOMRect,
  lineMiddle: number,
  eyebrowBottom: number,
): Point[] | null {
  if (title.left - contentLeft > 48) {
    const dot = { x: title.left - 16, y: Math.max(lineMiddle, eyebrowBottom + 40) };
    return [
      { x: dot.x - 9, y: dot.y + 34 },
      { x: dot.x - 6, y: dot.y + 20, r: 2 },
      dot,
    ];
  }

  const room = contentLeft - safeLeft;
  if (room < 12) return null;
  const x = safeLeft + room / 2;
  const dot = { x: x + 1, y: lineMiddle };
  return [
    { x: x - 3, y: dot.y + 34 },
    { x: x - 2, y: dot.y + 20, r: 2 },
    dot,
  ];
}

function measure(
  main: HTMLElement,
  desktop: boolean,
  safeLeft: number,
): Layout | null {
  const sections = Array.from(
    main.querySelectorAll<HTMLElement>(":scope > section"),
  );
  const hero = sections[0];
  const container = hero?.firstElementChild;
  const contact = main.querySelector<HTMLElement>("#contact");
  const title = contact?.querySelector<HTMLElement>("h2");
  if (!hero || !(container instanceof HTMLElement) || !contact || !title) {
    return null;
  }

  const box = main.getBoundingClientRect();
  const local = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return new DOMRect(
      rect.left - box.left,
      rect.top - box.top,
      rect.width,
      rect.height,
    );
  };

  const contentLeft =
    local(container).left + parseFloat(getComputedStyle(container).paddingLeft);
  const heading = local(title);
  const firstLine = title.querySelector("[data-mask]");
  const lineMiddle = firstLine
    ? local(firstLine).top + local(firstLine).height / 2
    : heading.top + 40;
  // The eyebrow's FadeIn only shifts it below `sm`, where it sits above the
  // title and is not measured against.
  const eyebrow = contact.querySelector(".eyebrow");
  const eyebrowBottom = eyebrow ? local(eyebrow).bottom : heading.top;

  let points: Point[] | null;
  if (desktop) {
    const start =
      local(hero).top + parseFloat(getComputedStyle(hero).paddingTop);
    const dot = {
      x: heading.left - 18,
      y: Math.max(lineMiddle, eyebrowBottom + 28),
    };
    points = railPoints(start, contentLeft, safeLeft, heading, dot);
  } else {
    points = markPoints(contentLeft, safeLeft, heading, lineMiddle, eyebrowBottom);
  }
  if (!points) return null;

  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  }

  const bands = sections.map((section) => {
    const rect = local(section);
    return {
      top: rect.top / box.height,
      bottom: rect.bottom / box.height,
      dark: DARK_TONES.has(section.dataset.tone ?? ""),
    };
  });

  const d = toPath(points);
  return {
    mode: desktop ? "rail" : "mark",
    width: box.width,
    height: box.height,
    d,
    bands,
    dot: points[points.length - 1],
    points,
    lengths,
    originY: box.top + window.scrollY,
    docHeight: document.documentElement.scrollHeight,
    key: `${box.width}|${box.height}|${d}|${bands.map((b) => b.top).join()}`,
  };
}

// Share of the rail drawn when the tip reaches this far down the page. Once
// the tip passes the lowest point, the closing stroke draws in full.
function progressAt(layout: Layout, scroll: number) {
  if (layout.mode === "mark") return 1;
  // Read live: the viewport height changes as mobile toolbars come and go.
  if (scroll >= layout.docHeight - window.innerHeight - 1) return 1;
  const { points, lengths } = layout;
  const target = scroll + window.innerHeight * TIP - layout.originY;
  if (target <= points[0].y) return 0;

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point.y >= target) {
      const prev = points[i - 1];
      const t = (target - prev.y) / (point.y - prev.y);
      const length = lengths[i - 1] + t * (lengths[i] - lengths[i - 1]);
      return length / lengths[lengths.length - 1];
    }
  }
  return 1;
}

function inReach(layout: Layout, scroll: number) {
  return scroll + window.innerHeight * REVEAL >= layout.originY + layout.dot.y;
}

// One gold line running behind the page from the hero to Contact, drawn as
// the visitor scrolls; its color follows the tone of each section. Below
// `lg`, only its closing stroke remains, beside the Contact title, and each
// section eyebrow carries a GrowthTick instead.
export function GrowthLine() {
  const ref = useRef<SVGSVGElement>(null);
  const layoutRef = useRef<Layout | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [revealed, setRevealed] = useState(false);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY, true);

  const { scrollY } = useScroll();
  // Bumped on every measure so the progress recomputes without a scroll.
  const version = useMotionValue(0);
  const target = useTransform([scrollY, version], ([scroll]) =>
    layoutRef.current ? progressAt(layoutRef.current, scroll as number) : 0,
  );
  const progress = useSpring(target, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005,
  });
  const dotOpacity = useTransform(progress, [0.985, 0.999], [0, 1]);

  useMotionValueEvent(scrollY, "change", (scroll) => {
    const current = layoutRef.current;
    if (current?.mode === "mark" && inReach(current, scroll)) setRevealed(true);
  });

  useEffect(() => {
    const svg = ref.current;
    const main = svg?.parentElement;
    if (!svg || !main) return;

    let request = 0;
    let timer = 0;
    const update = () => {
      request = 0;
      // The svg carries env(safe-area-inset-left) as an inert scroll margin.
      const safeLeft = parseFloat(getComputedStyle(svg).scrollMarginLeft) || 0;
      const next = measure(main, desktop, safeLeft);
      layoutRef.current = next;
      version.set(version.get() + 1);
      setLayout((prev) => (prev && next && prev.key === next.key ? prev : next));
      if (next?.mode === "mark" && inReach(next, window.scrollY)) {
        setRevealed(true);
      }
    };
    const run = () => {
      timer = 0;
      if (!request) request = requestAnimationFrame(update);
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, DEBOUNCE);
    };

    // Section size changes always count. Main's own height follows its
    // sections, so only its width is watched: a height-only viewport change,
    // like a mobile address bar, never triggers a measure.
    let width = main.getBoundingClientRect().width;
    const observer = new ResizeObserver((entries) => {
      const changed = entries.some((entry) => {
        if (entry.target !== main) return true;
        const previous = width;
        width = entry.contentRect.width;
        return width !== previous;
      });
      if (changed) schedule();
    });
    observer.observe(main);
    main
      .querySelectorAll(":scope > section")
      .forEach((section) => observer.observe(section));
    document.fonts?.ready.then(schedule);
    run();

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(request);
      observer.disconnect();
    };
  }, [desktop, version]);

  const dotBand = layout?.bands.find(
    (band) => layout.dot.y / layout.height <= band.bottom,
  );
  const dotFill = dotBand?.dark === false ? GOLD_DEEP : GOLD;

  return (
    // z-1 keeps it above the hero, which isolates its background video.
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      fill="none"
      width={layout?.width ?? 0}
      height={layout?.height ?? 0}
      className="pointer-events-none absolute top-0 left-0 z-1"
      style={{ scrollMarginLeft: "env(safe-area-inset-left, 0px)" }}
    >
      {layout && (
        <>
          <defs>
            <linearGradient
              id={GRADIENT_ID}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2={layout.height}
            >
              {layout.bands.flatMap((band, index) => {
                const color = { stopColor: band.dark ? GOLD : GOLD_DEEP };
                return [
                  <stop key={`${index}-top`} offset={band.top} style={color} />,
                  <stop
                    key={`${index}-bottom`}
                    offset={band.bottom}
                    style={color}
                  />,
                ];
              })}
            </linearGradient>
          </defs>
          {reduceMotion ? (
            <>
              <path
                d={layout.d}
                stroke={`url(#${GRADIENT_ID})`}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={layout.dot.x}
                cy={layout.dot.y}
                r={3.5}
                style={{ fill: dotFill }}
              />
            </>
          ) : layout.mode === "rail" ? (
            <g key="rail">
              <motion.path
                d={layout.d}
                stroke={`url(#${GRADIENT_ID})`}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: progress }}
              />
              <motion.circle
                cx={layout.dot.x}
                cy={layout.dot.y}
                r={3.5}
                style={{ fill: dotFill, opacity: dotOpacity }}
              />
            </g>
          ) : (
            <g key="mark">
              <motion.path
                d={layout.d}
                stroke={`url(#${GRADIENT_ID})`}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  revealed
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.circle
                cx={layout.dot.x}
                cy={layout.dot.y}
                r={3}
                style={{ fill: dotFill }}
                initial={{ opacity: 0 }}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.25, delay: revealed ? 0.45 : 0 }}
              />
            </g>
          )}
        </>
      )}
    </svg>
  );
}

// A short gold stroke with a slight rise, set after a section eyebrow on
// smaller screens; it draws in as it enters view. Inline, so it never
// overlaps the text around it.
export function GrowthTick({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={32}
      height={12}
      viewBox="0 0 32 12"
      fill="none"
      className={cn("ml-3 inline-block", className)}
    >
      <motion.path
        d="M1 10 L10 7.8 L15 8.8 L31 2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 0.2,
          ease: "easeOut",
        }}
      />
    </svg>
  );
}
