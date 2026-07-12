/**
 * Original CSS device mockups (no third-party/branded imagery) — a desktop
 * frame with a phone frame offset in front, abstract UI blocks standing in
 * for the real product screen. Deterministic per-project pattern via index.
 */
export function WorkMockup({
  index,
  accent,
}: {
  index: number;
  accent: "blue" | "magenta";
}) {
  const accentVar = accent === "blue" ? "var(--blue)" : "var(--magenta)";
  const blockCount = 6;
  const blocks = Array.from({ length: blockCount }, (_, i) => {
    const wide = (i + index) % 3 === 0;
    return { wide, id: i };
  });

  return (
    <div className="relative w-full">
      {/* desktop frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/10 bg-[#1f1f28] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
        <div className="grid grid-cols-4 gap-3 p-6">
          {blocks.map((b) => (
            <div
              key={b.id}
              className={`h-10 rounded-sm ${b.wide ? "col-span-4" : "col-span-2"}`}
              style={{
                background: b.id % 2 === 0 ? accentVar : "rgba(255,255,255,0.08)",
                opacity: b.id % 2 === 0 ? 0.85 : 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* phone frame, offset bottom-right */}
      <div className="absolute -bottom-8 -right-6 aspect-[9/19] w-24 overflow-hidden rounded-xl border border-white/10 bg-[#1f1f28] shadow-2xl sm:w-28">
        <div className="flex flex-col gap-2 p-3">
          <div className="h-2 w-2/3 rounded-sm bg-white/20" />
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-6 rounded-sm"
              style={{
                background: i % 2 === 0 ? accentVar : "rgba(255,255,255,0.08)",
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
