import type { ReactNode } from "react";

/**
 * A headline keyword in a logo colour. On dark grounds it's coloured text;
 * on the blue or magenta sections it becomes a solid highlight in the other
 * brand colour (see .hl in globals.css) — magenta text on blue, or blue on
 * magenta, would be unreadable.
 */
export function Hl({ tone, children }: { tone: "blue" | "magenta"; children: ReactNode }) {
  return <span className={`hl hl-${tone}`}>{children}</span>;
}
