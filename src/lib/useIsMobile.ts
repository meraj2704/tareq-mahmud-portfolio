import { useSyncExternalStore } from "react";

// Matches Tailwind's `max-sm` variant.
export const MOBILE_QUERY = "(width < 40rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// False during prerender, then tracks the viewport.
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
