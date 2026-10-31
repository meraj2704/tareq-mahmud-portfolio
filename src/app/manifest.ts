import type { MetadataRoute } from "next";
import { getContent } from "@/data/content";

// Mirrors the paper theme color in globals.css and layout.tsx.
const PAPER = "#f7f6f2";

// Lets Android and desktop browsers install the site to the home screen.
export default function manifest(): MetadataRoute.Manifest {
  const { meta, hero } = getContent();

  return {
    name: meta.title,
    short_name: hero.name,
    description: meta.description,
    start_url: "/",
    display: "standalone",
    background_color: PAPER,
    theme_color: PAPER,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
