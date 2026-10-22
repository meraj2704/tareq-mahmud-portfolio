import { cacheLife } from "next/cache";

// Cache Components rejects uncached `new Date()` during prerender.
// Caching keeps the page static while the year refreshes daily.
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
