import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
        }}
      >
        {/* Matterpixel mark — same paths as public/mark.svg. */}
        <svg width={198} height={132} viewBox="0 0 300 200" style={{ marginBottom: 32 }}>
          <path fill="#2C4BFF" d="M12 0h47l86 100-86 100H12A12 12 0 0 1 0 188V12A12 12 0 0 1 12 0Z" />
          <path fill="#FF2E93" d="M288 0h-47l-86 100 86 100h47a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12Z" />
        </svg>
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
    ),
    { width: 1200, height: 630 },
  );
}
