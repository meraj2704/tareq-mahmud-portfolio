import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// Private LAN ranges, so phones and other machines on the network can load
// the dev server. `*` matches exactly one address segment.
const PRIVATE_RANGES = ["192.168.*.*", "10.*.*.*", "172.16.*.*"];

// This machine's own LAN IPv4 addresses, picked up at startup.
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net?.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...new Set([...PRIVATE_RANGES, ...lanAddresses])],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
