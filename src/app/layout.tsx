import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CursorTick } from "@/components/ui/CursorTick";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { defaultLocale, getContent } from "@/data/content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // The full variable font: weight, optical size and softness.
  weight: "variable",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const { meta } = getContent();

export const metadata: Metadata = {
  // Absolute URLs for the share image. Set SITE_URL to the live domain;
  // without it Next falls back to the Vercel production URL or localhost.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: meta.title,
  description: meta.description,
  openGraph: {
    type: "profile",
    title: meta.title,
    description: meta.description,
  },
  twitter: { card: "summary_large_image" },
};

// Lets the page draw under notches; components pad with env(safe-area-inset-*).
// themeColor tints the mobile browser bar to match the paper background.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={defaultLocale}
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="font-sans">
        <MotionProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CursorTick />
        </MotionProvider>
        {/* Sits above everything, menu included; never takes pointer events. */}
        <div
          aria-hidden="true"
          className="grain pointer-events-none fixed inset-0 z-100"
        />
      </body>
    </html>
  );
}
