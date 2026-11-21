import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Node, not edge: the two bundled font weights put the function over the
// edge runtime's 1 MB size cap. next.config's outputFileTracingIncludes
// ships the .ttf files with it.
export const runtime = "nodejs";

// The site's heading face (Inter Tight, per DESIGN.md's Two Voices Rule —
// the card sets sentences, so never Avenir), bundled beside the route as
// static weights: the built-in fallback has no bold, and the renderer
// can't read the variable or WOFF2 builds next/font serves.
const fontDir = path.join(process.cwd(), "app", "api", "og");
const heavy = readFile(path.join(fontDir, "InterTight-800.ttf"));
const bold = readFile(path.join(fontDir, "InterTight-700.ttf"));

/** Share card. Bare `/api/og` is the brand card; `?title=…&eyebrow=…`
 * titles it for one page, so a shared link previews the page it opens.
 * Both params are clamped — this endpoint is public. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 90).trim();
  const eyebrow = searchParams.get("eyebrow")?.slice(0, 40).trim();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#FAF8F3",
          padding: "80px",
          fontFamily: "Inter Tight",
        }}
      >
        {/* Matterpixel mark — same paths as public/mark.svg. */}
        <svg width={title ? 132 : 198} height={title ? 88 : 132} viewBox="0 0 300 200" style={{ marginBottom: 32 }}>
          <path fill="#2C4BFF" d="M12 0h47l86 100-86 100H12A12 12 0 0 1 0 188V12A12 12 0 0 1 12 0Z" />
          <path fill="#FF2E93" d="M288 0h-47l-86 100 86 100h47a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12Z" />
        </svg>
        {title ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {eyebrow ? (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#FF2E93",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: "flex",
                  marginBottom: 20,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
            <div
              style={{
                fontSize: title.length > 48 ? 60 : 76,
                fontWeight: 800,
                color: "#16161C",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                display: "flex",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#2C4BFF",
                display: "flex",
                marginTop: 36,
              }}
            >
              matterpixel.com
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#16161C",
                letterSpacing: "-0.03em",
                display: "flex",
                maxWidth: 900,
              }}
            >
              We build what matters.
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#2C4BFF",
                letterSpacing: "-0.03em",
                display: "flex",
              }}
            >
              Down to the pixel.
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter Tight", data: await heavy, weight: 800, style: "normal" },
        { name: "Inter Tight", data: await bold, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
