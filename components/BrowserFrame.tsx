import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Chrome around a real screenshot: traffic lights and the demo's actual
 * hostname in an address bar.
 *
 * The frame is doing credibility work, not decoration. Every screenshot in
 * the Projects section is a capture of a URL a prospect can open in the next
 * tab, and the address bar is what says so — a naked image reads as a
 * mockup, an addressed one reads as a site. Which is why `url` is required
 * and always the live host, never a made-up domain.
 *
 * Hardcoded dark chrome, like ProjectMedia's caption scrim: this is a
 * photo-frame treatment that has to hold its own against whatever the
 * screenshot's own colours are, not a themed surface.
 */
export function BrowserFrame({
  url,
  children,
  className,
  bodyClassName,
}: {
  /** Live host shown in the address bar, e.g. "scentora.matterpixel.com". */
  url: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--mp-radius-md)] border border-[rgba(255,255,255,0.09)] bg-[#1b1b21] shadow-[0_24px_60px_-24px_rgba(22,22,28,0.55)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="truncate rounded-full bg-[rgba(255,255,255,0.07)] px-3 py-1 font-mono text-[11px] tracking-tight text-[#a5a2b0]">
            {url}
          </span>
        </div>
        {/* Balances the traffic lights so the address bar sits optically
            centred rather than pushed right. */}
        <div className="w-[42px] shrink-0" aria-hidden="true" />
      </div>
      <div className={cn("relative bg-[#0f0f13]", bodyClassName)}>{children}</div>
    </div>
  );
}

/**
 * Phone counterpart to BrowserFrame, for the mobile capture beside each
 * case study's desktop one. Same reasoning: the bezel is what makes a
 * 390px-wide screenshot legible as "this is the phone view" rather than as
 * a cropped desktop image.
 */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2.25rem] border-[6px] border-[#1b1b21] bg-[#1b1b21] shadow-[0_24px_60px_-24px_rgba(22,22,28,0.55)]",
        className,
      )}
    >
      {/* Notch — purely a shape cue that this is a handset. */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#1b1b21]"
      />
      <div className="relative overflow-hidden rounded-[1.85rem] bg-[#0f0f13]">{children}</div>
    </div>
  );
}
