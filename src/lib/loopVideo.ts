import { useEffect, type RefObject } from "react";

// Shared by the silent hero loops (HeroVideo, HeroBackground).

// Network Information API (Chromium only; not in TypeScript's DOM lib).
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

// Data saver on, or a 2g / slow-2g connection.
export function constrainedNetwork() {
  const { connection } = navigator as Navigator & {
    connection?: NetworkInformation;
  };
  return Boolean(
    connection?.saveData || connection?.effectiveType?.endsWith("2g"),
  );
}

// Runs `callback` once the window has loaded and the main thread is idle.
export function afterLoadIdle(callback: () => void) {
  let idle = 0;
  let timer = 0;
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      timer = window.setTimeout(callback, 200);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}

// Plays the video only while it is on screen in a visible tab.
export function usePlayWhileVisible(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let onScreen = false;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") {
        // Blocked autoplay rejects; the poster simply stays.
        element.play().catch(() => {});
      } else {
        element.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);
}
