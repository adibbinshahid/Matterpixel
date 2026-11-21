"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile — the bot check on the contact and booking forms.
 * Runs in "interaction-only" mode: real visitors almost never see it; it
 * only shows a checkbox when Cloudflare is unsure. Renders nothing at all
 * until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, and the server skips the
 * check until TURNSTILE_SECRET_KEY is set, so the forms keep working
 * before the keys exist.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("turnstile script failed"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export function Turnstile({
  onToken,
  resetSignal,
}: {
  /** Receives a fresh token, or null when it expires or errors. */
  onToken: (token: string | null) => void;
  /** Change this number to get a new token (tokens are single-use). */
  resetSignal?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: "interaction-only",
          theme: "dark",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetSignal === undefined || !widgetId.current || !window.turnstile) return;
    onTokenRef.current(null);
    window.turnstile.reset(widgetId.current);
  }, [resetSignal]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={boxRef} className="flex justify-center empty:hidden" />;
}
