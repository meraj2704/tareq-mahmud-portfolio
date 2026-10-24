"use client";

import { useEffect, useRef, useState } from "react";
import type { BackgroundVideo, VideoSources } from "@/data/content";
import { cn } from "@/lib/cn";
import {
  afterLoadIdle,
  constrainedNetwork,
  usePlayWhileVisible,
} from "@/lib/loopVideo";
import {
  REDUCED_MOTION_QUERY,
  TABLET_QUERY,
  useMediaQuery,
} from "@/lib/useMediaQuery";

const MEDIA = "absolute inset-0 size-full object-cover";

// Faint ink texture behind the hero: a grayscale loop multiplied into the
// paper, then washed back to solid paper behind the copy and toward the
// figures, so text contrast is what it would be on plain paper. The poster
// carries the same treatment and stays alone for reduced motion, data saver,
// 2g and blocked autoplay.
export function HeroBackground({ background }: { background: BackgroundVideo }) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, true);
  const [sources, setSources] = useState<VideoSources | null>(null);
  const { poster, small, large } = background;

  useEffect(() => {
    if (reducedMotion || constrainedNetwork()) return;
    return afterLoadIdle(() =>
      setSources(window.matchMedia(TABLET_QUERY).matches ? large : small),
    );
  }, [reducedMotion, small, large]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-paper"
    >
      <div className="absolute inset-0 opacity-12 mix-blend-multiply">
        {/* Pre-encoded at its display size; a decorative texture gains
            nothing from the image optimizer. */}
        <picture>
          <source srcSet={poster.webp} type="image/webp" />
          <img
            src={poster.jpg}
            alt=""
            decoding="async"
            fetchPriority="low"
            className={MEDIA}
          />
        </picture>
        {sources && !reducedMotion && <LoopVideo sources={sources} />}
      </div>
      {/* Wash to paper: behind the copy (the whole width below md, the left
          column from md) and fully by the bottom of the hero. */}
      <div className="absolute inset-0 bg-linear-to-b from-paper/40 from-30% to-paper to-90% md:from-transparent" />
      <div className="absolute inset-0 hidden bg-linear-to-r from-paper from-30% via-paper/75 via-50% to-transparent to-65% md:block" />
    </div>
  );
}

// Mounts with its sources, so the browser picks one straight away, and
// fades in over the poster once frames are playing.
function LoopVideo({ sources }: { sources: VideoSources }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  usePlayWhileVisible(ref);

  return (
    <video
      ref={ref}
      muted
      autoPlay
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      onPlaying={() => setPlaying(true)}
      className={cn(
        MEDIA,
        "opacity-0 transition-opacity duration-1000 ease-out",
        playing && "opacity-100",
      )}
    >
      <source src={sources.webm} type="video/webm" />
      <source src={sources.mp4} type="video/mp4" />
    </video>
  );
}
