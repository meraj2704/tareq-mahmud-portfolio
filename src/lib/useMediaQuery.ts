import { useCallback, useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// Mouse or trackpad: hover effects and the cursor follower.
export const FINE_POINTER_QUERY = "(pointer: fine)";
// Matches Tailwind's `md` variant.
export const TABLET_QUERY = "(width >= 48rem)";
// Matches Tailwind's `lg` variant.
export const DESKTOP_QUERY = "(width >= 64rem)";

// `serverValue` during prerender and hydration, then tracks the query.
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
