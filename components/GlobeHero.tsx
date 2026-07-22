"use client";

import { useEffect, useRef } from "react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { footer } from "@/content/siteConfig";

const contactButton =
  "hover-lift font-avenir inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper hover:bg-blue";

/**
 * /contact opener — a looping globe video background, the "we're global"
 * headline, and the contact headcopy/buttons/form all layered directly
 * over the same video as one continuous section (no separate section
 * break between the video intro and the contact form).
 */
export function GlobeHero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const waNumber = footer.contact.whatsapp.replace(/[^\d]/g, "");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-paper px-6 pb-0 pt-32 text-center sm:px-8 lg:px-12">
      <video
        ref={videoRef}
        className="absolute inset-x-0 top-0 h-[100svh] w-full object-cover"
        src="/videos/globe-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <Reveal delay={0.1} className="grid gap-10 text-left lg:grid-cols-2 lg:items-center">
          <div>
            <h1
              id="email"
              className="scroll-mt-32 text-[clamp(2.25rem,6vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-paper"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.5)" }}
            >
              Got something that <span className="text-magenta">matters?</span>
              <br />
              Let&rsquo;s <span className="text-blue">build</span> it.
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={contactButton}
              >
                <SiWhatsapp className="h-4 w-4" />
                Contact via WhatsApp
              </a>
              <a
                href={`https://t.me/${footer.contact.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={contactButton}
              >
                <SiTelegram className="h-4 w-4" />
                Contact via Telegram
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white/25 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_20px_60px_-16px_rgba(0,0,0,0.55)] backdrop-blur-md backdrop-saturate-150">
            <div className="rounded-[1.375rem] border border-line bg-paper p-5 shadow-[0_0_45px_-5px_rgba(0,0,0,0.5)] sm:p-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
