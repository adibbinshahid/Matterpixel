import { NextResponse } from "next/server";
import { siteUrl } from "@/content/siteConfig";
import { logger } from "@/lib/logger";
import { getClientIp, isRateLimited, type RateLimit } from "@/lib/rate-limit";

/** Largest JSON body a form endpoint accepts. The biggest legitimate
 * payload (every field at its schema max) is well under this. */
const MAX_BODY_BYTES = 16 * 1024;

const ALLOWED_HOSTS = new Set([
  new URL(siteUrl).host,
  new URL(siteUrl).host.replace(/^www\./, ""),
  "localhost:3000",
  "127.0.0.1:3000",
]);

/** Same-site browsers always send Origin on a POST from fetch(). A request
 * with no Origin, or one from another site, is a script or a cross-site
 * form — never our own form. Vercel preview deployments are allowed so
 * forms can be tested before promotion. */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const { host } = new URL(origin);
    return ALLOWED_HOSTS.has(host) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

type GuardResult =
  | { ok: true; ip: string; body: unknown }
  | { ok: false; response: NextResponse };

/**
 * Shared front door for public form endpoints: origin check, JSON-only and
 * size cap, in that order, so a rejected request costs as little as
 * possible. Returns the parsed body on success. Per-IP throttling runs here
 * too unless `rateLimit` is false — then the caller throttles itself (the
 * quote route does, after its honeypot check) with `isIpRateLimited`.
 */
export async function guardFormRequest(
  request: Request,
  scope: string,
  { rateLimit = true }: { rateLimit?: boolean } = {},
): Promise<GuardResult> {
  const ip = getClientIp(request);
  const fail = (status: number, error: string, event: string): GuardResult => {
    logger.warn(`${scope}.${event}`, { ip });
    return { ok: false, response: NextResponse.json({ ok: false, error }, { status }) };
  };

  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return fail(403, "Forbidden.", "bad_origin");
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "Unsupported request.", "bad_content_type");
  }

  if (rateLimit && isRateLimited(`${scope}:${ip}`)) {
    return fail(429, "Too many requests. Please try again in a few minutes.", "rate_limited");
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return fail(413, "That message is too long.", "body_too_large");
  }

  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return fail(413, "That message is too long.", "body_too_large");
  }

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }

  return { ok: true, ip, body };
}

/** Per-IP throttle with a caller-chosen window. */
export function isIpRateLimited(scope: string, ip: string, limit: RateLimit): boolean {
  return isRateLimited(`${scope}:${ip}`, limit);
}
