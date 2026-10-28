"use client";

import { useEffect, useRef, useState } from "react";
import type { PortraitVideo, VideoSources } from "@/data/content";
import { Photo, PHOTO_MEDIA } from "@/components/ui/Photo";
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

interface HeroVideoProps {
  video: PortraitVideo;
  sizes: string;
}

// Living portrait: the poster is the LCP image, and a silent loop fades in
// over it once the page has loaded. Reduced motion, data saver and 2g get
// the poster alone, as does a browser that blocks autoplay.
export function HeroVideo({ video, sizes }: HeroVideoProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY, true);
  const [sources, setSources] = useState<VideoSources | null>(null);
  const { small, large } = video;

  useEffect(() => {
    if (reducedMotion || constrainedNetwork()) return;
    return afterLoadIdle(() =>
      setSources(window.matchMedia(TABLET_QUERY).matches ? large : small),
    );
  }, [reducedMotion, small, large]);

  return (
    <Photo
      image={video.poster}
      orientation="portrait"
      preload
      settle
      sizes={sizes}
    >
      {sources && !reducedMotion && <LoopVideo sources={sources} />}
    </Photo>
  );
}

// Mounts with its sources, so the browser picks one straight away. Plays
// only while on screen in a visible tab.
function LoopVideo({ sources }: { sources: VideoSources }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  usePlayWhileVisible(ref);

  return (
    <div
      className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-1000 ease-out",
        playing && "opacity-100",
      )}
    >
      <video
        ref={ref}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        className={cn(PHOTO_MEDIA, "size-full")}
      >
        <source src={sources.webm} type="video/webm" />
        <source src={sources.mp4} type="video/mp4" />
      </video>
    </div>
  );
}
