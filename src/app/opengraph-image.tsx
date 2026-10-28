import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getContent } from "@/data/content";

// The card shown when the site is shared on LinkedIn, WhatsApp, etc.
// Built at build time from the static fonts and portrait in assets/og.

const { hero, meta } = getContent();

export const alt = meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the theme colors in globals.css.
const INK = "#0a1a33";
const PAPER = "#f7f6f2";
const GOLD = "#c9a96e";

const asset = (file: string) => readFile(join(process.cwd(), "assets/og", file));

export default async function Image() {
  const [fraunces, frauncesItalic, mono, portrait] = await Promise.all([
    asset("Fraunces-Light.ttf"),
    asset("Fraunces-Italic.ttf"),
    asset("JetBrainsMono-Regular.ttf"),
    asset("portrait.jpg"),
  ]);
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: INK,
          color: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "72px 72px 64px",
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            {hero.location}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Fraunces",
                fontWeight: 300,
                fontSize: 112,
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {hero.name.split(" ").map((word) => (
                <span key={word}>{word}</span>
              ))}
            </div>
            <div
              style={{
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontSize: 44,
                marginTop: 28,
                color: GOLD,
              }}
            >
              {hero.role}
            </div>
          </div>
          {/* The site's double rule. */}
          <div
            style={{
              width: 64,
              height: 5,
              borderTop: `1.5px solid ${GOLD}`,
              borderBottom: `1.5px solid ${GOLD}`,
            }}
          />
        </div>
        <img
          src={portraitSrc}
          alt=""
          width={420}
          height={630}
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 300 },
        { name: "Fraunces", data: frauncesItalic, style: "italic", weight: 400 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
