import { logger } from "@/lib/logger";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Pulls the Turnstile token off a request body without trusting its shape. */
export function tokenFrom(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const token = (body as Record<string, unknown>).turnstileToken;
  return typeof token === "string" && token.length <= 2048 ? token : undefined;
}

/** "passed": Cloudflare confirmed the token. "failed": Cloudflare rejected
 * it, or there was none. "unverified": no secret configured, or Cloudflare
 * couldn't be reached, so nothing was actually checked. */
export type TurnstileResult = "passed" | "failed" | "unverified";

export async function checkTurnstile(token: string | undefined, ip: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "unverified";
  if (!token) return "failed";

  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") form.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) logger.warn("turnstile.rejected", { ip, codes: data["error-codes"] });
    return data.success === true ? "passed" : "failed";
  } catch (error) {
    logger.error("turnstile.unreachable", { ip, error: error instanceof Error ? error.message : String(error) });
    return "unverified";
  }
}

/**
 * Server half of the Turnstile check, for normal submissions. Fails open:
 * true when the token is valid, when TURNSTILE_SECRET_KEY isn't configured
 * (forms keep working until the keys are added), or when Cloudflare is
 * unreachable (an outage must not turn away real leads; the honeypot and
 * rate limit still stand). An explicit "this token is bad" still rejects.
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  return (await checkTurnstile(token, ip)) !== "failed";
}
