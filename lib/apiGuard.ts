import { NextResponse } from "next/server";
import { siteUrl } from "@/content/siteConfig";
import { logger } from "@/lib/logger";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

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
 * Shared front door for the public form endpoints: origin check, JSON-only,
 * size cap and per-IP throttling, in that order, so a rejected request
 * costs as little as possible. Returns the parsed body on success.
 */
export async function guardFormRequest(request: Request, scope: string): Promise<GuardResult> {
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

  if (isRateLimited(`${scope}:${ip}`)) {
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

/** A second throttle keyed on the visitor's email, so one address can't be
 * hammered from many IPs. */
export function isEmailRateLimited(scope: string, email: string): boolean {
  return isRateLimited(`${scope}:email:${email.trim().toLowerCase()}`);
}
