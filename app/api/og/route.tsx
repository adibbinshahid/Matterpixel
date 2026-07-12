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
        <div style={{ display: "flex", position: "relative", width: 132, height: 132, marginBottom: 32 }}>
          {[
            { x: 0, y: 0, c: "#2C4BFF" },
            { x: 0, y: 26.4, c: "#2C4BFF" },
            { x: 0, y: 52.8, c: "#2C4BFF" },
            { x: 0, y: 79.2, c: "#2C4BFF" },
            { x: 0, y: 105.6, c: "#2C4BFF" },
            { x: 26.4, y: 26.4, c: "#2C4BFF" },
            { x: 52.8, y: 52.8, c: "#2C4BFF" },
            { x: 105.6, y: 0, c: "#FF2E93" },
            { x: 105.6, y: 26.4, c: "#FF2E93" },
            { x: 105.6, y: 52.8, c: "#FF2E93" },
            { x: 105.6, y: 79.2, c: "#FF2E93" },
            { x: 105.6, y: 105.6, c: "#FF2E93" },
            { x: 79.2, y: 26.4, c: "#FF2E93" },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                position: "absolute",
                left: b.x,
                top: b.y,
                width: 26.4,
                height: 26.4,
                background: b.c,
              }}
            />
          ))}
        </div>
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
