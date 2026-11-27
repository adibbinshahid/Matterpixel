import { NextResponse } from "next/server";
import { guardFormRequest, isIpRateLimited } from "@/lib/apiGuard";
import { logger } from "@/lib/logger";
import { normalizeWebsite, quoteSchema, serviceLabel, utmSchema, type Utm } from "@/lib/schema";
import { checkTurnstile, tokenFrom, verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

/**
 * POST /api/quote — the "Get a fixed quote" form.
 *
 * No lead may be lost, so after the guard the work runs as three
 * independent steps, each in its own try/catch:
 *   1. save to Supabase `inbound` (the source of truth)
 *   2. send a plain-text backup email through Resend
 *   3. notify n8n (optional, 5 s timeout)
 * The visitor sees success if step 1 OR step 2 worked. Every failed step is
 * logged with its name (console.error, so it shows in Vercel logs).
 */

const HOUR_MS = 60 * 60 * 1000;
const WEBHOOK_TIMEOUT_MS = 5000;
const UPSTREAM_TIMEOUT_MS = 8000;

type Lead = {
  name: string;
  email: string;
  website: string | null;
  service: string;
  details: string;
  budget: string | null;
  timeline: string | null;
  link: string | null;
  selection: string | null;
  src: string | null;
};

type Meta = {
  source_page: string | null;
  utm: Utm;
  country: string | null;
  user_agent: string | null;
};

const fake = () => NextResponse.json({ ok: true });

export async function POST(request: Request) {
  // ── Step 0: guard ─────────────────────────────────────────────────────
  const guard = await guardFormRequest(request, "quote", { rateLimit: false });
  if (!guard.ok) return guard.response;
  const { ip, body } = guard;
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  // Rate limit before anything that calls out (Turnstile), so a flood can't
  // be used to hammer Cloudflare.
  if (isIpRateLimited("quote", ip, { windowMs: HOUR_MS, max: 5 })) {
    logger.warn("quote.rate_limited", { ip });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in an hour, or email us." },
      { status: 429 },
    );
  }

  // Honeypot: a bot gets the same answer a person would, and nothing is
  // stored or sent. The one exception is a filled honeypot whose Turnstile
  // token Cloudflare actually confirmed: that's a person whose browser
  // autofilled the hidden field. This branch fails closed, so with no
  // Turnstile secret or Cloudflare unreachable, a filled honeypot is dropped.
  const honeypotFilled = typeof raw.company_fax === "string" && raw.company_fax.trim() !== "";
  if (honeypotFilled) {
    if ((await checkTurnstile(tokenFrom(raw), ip)) !== "passed") {
      logger.warn("quote.honeypot", { ip });
      return fake();
    }
    logger.warn("quote.honeypot_autofill_passed_turnstile", { ip });
  } else if (!(await verifyTurnstile(tokenFrom(raw), ip))) {
    // Normal path: fails open on outage (see lib/turnstile.ts). A token is
    // single-use, so it is checked once on whichever branch runs.
    return NextResponse.json(
      { ok: false, error: "Bot check failed. Refresh the page and try again." },
      { status: 400 },
    );
  }

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn("quote.invalid", { ip, fields: parsed.error.issues.map((i) => i.path.join(".")) });
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);
  const lead: Lead = {
    name: data.name,
    email: data.email,
    website: data.website ? normalizeWebsite(data.website) : null,
    service: data.service,
    details: data.details,
    budget: data.budget ?? null,
    timeline: data.timeline ?? null,
    link: data.link ? normalizeWebsite(data.link) : null,
    selection: orNull(data.selection),
    src: orNull(data.src),
  };
  const utm = utmSchema.safeParse(raw.utm);
  const meta: Meta = {
    source_page: refererPath(request.headers.get("referer")),
    utm: utm.success ? stripEmpty(utm.data) : {},
    country: request.headers.get("x-vercel-ip-country"),
    user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  };

  // ── Step 1: Supabase ──────────────────────────────────────────────────
  let inboundId: string | null = null;
  try {
    inboundId = await saveToSupabase(lead, meta);
  } catch (error) {
    logger.error("quote.step1_supabase_failed", { ip, error: errorText(error) });
  }

  // ── Step 2: backup email ──────────────────────────────────────────────
  let emailed = false;
  try {
    await sendBackupEmail(lead, meta, inboundId);
    emailed = true;
  } catch (error) {
    logger.error("quote.step2_email_failed", { ip, inboundId, error: errorText(error) });
  }

  // ── Step 3: n8n (PixelScout Telegram alert) ───────────────────────────
  // Never affects the visitor's response.
  try {
    await notifyWebhook(lead, meta, inboundId);
  } catch (error) {
    console.error("[quote] n8n notify failed", error);
    logger.error("quote.step3_webhook_failed", { ip, inboundId, error: errorText(error) });
  }

  if (!inboundId && !emailed) {
    logger.error("quote.lead_not_captured", { ip });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  logger.info("quote.received", { ip, inboundId, emailed });
  return NextResponse.json({ ok: true });
}

/** Inserts the lead through the Supabase REST API and returns its id. */
async function saveToSupabase(lead: Lead, meta: Meta): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");

  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  // New `sb_secret_…` keys aren't JWTs and belong on `apikey` alone
  // (Supabase rejects them as a Bearer token). A legacy service_role JWT
  // also needs the Authorization header.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;

  // Only the origin is used, so a pasted ".../rest/v1/" (as Supabase's Data
  // API page shows it) works the same as the bare project URL.
  let base: string;
  try {
    base = new URL(url.trim()).origin;
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL");
  }
  const res = await fetch(`${base}/rest/v1/inbound`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "quote", ...lead, ...meta, status: "new" }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const rows = (await res.json()) as { id?: string | number }[];
  const id = rows[0]?.id;
  if (id == null) throw new Error("Supabase returned no id");
  return String(id);
}

/** Plain-text copy of every field to Adib's inbox, independent of the DB. */
async function sendBackupEmail(lead: Lead, meta: Meta, inboundId: string | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_BACKUP_FROM;
  const to = process.env.LEAD_BACKUP_TO;
  if (!apiKey || !from || !to) throw new Error("RESEND_API_KEY, LEAD_BACKUP_FROM or LEAD_BACKUP_TO is not set");

  const utmLine = Object.entries(meta.utm)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  const text = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Website: ${lead.website ?? "-"}`,
    `Service: ${serviceLabel(lead.service)} (${lead.service})`,
    `Budget: ${lead.budget ?? "-"}`,
    `Timeline: ${lead.timeline ?? "-"}`,
    `Link: ${lead.link ?? "-"}`,
    `Selection: ${lead.selection ? lead.selection.replace(/\n/g, " · ") : "-"}`,
    `CTA: ${lead.src ?? "-"}`,
    "",
    "Details:",
    lead.details,
    "",
    `Source page: ${meta.source_page ?? "-"}`,
    `UTM: ${utmLine || "-"}`,
    `Country: ${meta.country ?? "-"}`,
    `Inbound ID: ${inboundId ?? "NOT SAVED TO DB"}`,
    `Received: ${dhakaTimestamp()} (Asia/Dhaka)`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `[Lead backup] Quote: ${oneLine(lead.name)} – ${serviceLabel(lead.service)}`,
      text,
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** Tells n8n (PixelScout) about the lead so it can send the Telegram
 * alert. Skipped silently unless both the URL and the secret are set. */
async function notifyWebhook(lead: Lead, meta: Meta, inboundId: string | null): Promise<void> {
  const url = process.env.QUOTE_WEBHOOK_URL;
  const secret = process.env.QUOTE_WEBHOOK_SECRET;
  if (!url || !secret) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-pixelscout-secret": secret },
      body: JSON.stringify({
        event: "quote.created",
        inbound_id: inboundId,
        name: lead.name,
        email: lead.email,
        website: lead.website,
        service: lead.service,
        details: lead.details,
        budget: lead.budget,
        timeline: lead.timeline,
        link: lead.link,
        source_page: meta.source_page,
        utm: meta.utm,
        country: meta.country,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Webhook ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

/** `https://www.matterpixel.com/contact?tab=inquiry` → `/contact`. */
function refererPath(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname.slice(0, 300);
  } catch {
    return null;
  }
}

function stripEmpty(utm: Utm): Utm {
  return Object.fromEntries(Object.entries(utm).filter(([, v]) => v)) as Utm;
}

/** Header-safe: a name can't add lines to the subject. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 80);
}

function dhakaTimestamp(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
