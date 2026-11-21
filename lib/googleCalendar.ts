import { createSign } from "node:crypto";
import { logger } from "@/lib/logger";

/**
 * Google Calendar link for the booking form, via a service account that
 * Adib's calendar is shared with. Two jobs:
 *   1. busy times — so the scheduler never offers a slot he's already in
 *   2. a placeholder event per booking — so the next visitor can't take
 *      the same slot
 *
 * Off until all three env vars are set; the scheduler then falls back to
 * the plain availability rule in lib/availability.
 *
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL         …@….iam.gserviceaccount.com
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   the JSON key's private_key (\n kept)
 *   GOOGLE_CALENDAR_ID                   usually the Gmail address
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";

export type BusyRange = { start: string; end: string };

function config() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  return email && key && calendarId ? { email, key, calendarId } : null;
}

export function isCalendarConnected(): boolean {
  return config() !== null;
}

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const cfg = config();
  if (!cfg) throw new Error("calendar not configured");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: cfg.email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${b64url(signer.sign(cfg.key))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) throw new Error(`token: ${data.error ?? res.status}`);
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

/** Busy ranges on the calendar between two instants. */
export async function getBusy(from: Date, to: Date): Promise<BusyRange[]> {
  const cfg = config();
  if (!cfg) return [];
  const res = await fetch(`${API}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id: cfg.calendarId }] }),
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: BusyRange[]; errors?: { reason: string }[] }>;
  };
  const cal = data.calendars?.[cfg.calendarId];
  if (!res.ok || cal?.errors?.length) {
    throw new Error(`freeBusy: ${cal?.errors?.[0]?.reason ?? res.status}`);
  }
  return cal?.busy ?? [];
}

/** True when [start, start + minutes) overlaps anything on the calendar. */
export async function isSlotBusy(start: Date, minutes: number): Promise<boolean> {
  const end = new Date(start.getTime() + minutes * 60_000);
  const busy = await getBusy(start, end);
  return busy.some((b) => new Date(b.start) < end && new Date(b.end) > start);
}

/** Puts the requested call on the calendar so the slot reads busy at once.
 * No attendees: a service account can't invite guests on a personal
 * Google account, so the Meet link goes out by email as before. */
export async function createBookingEvent(options: {
  start: Date;
  minutes: number;
  summary: string;
  description: string;
}): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  const end = new Date(options.start.getTime() + options.minutes * 60_000);
  const res = await fetch(`${API}/calendars/${encodeURIComponent(cfg.calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: options.summary,
      description: options.description,
      start: { dateTime: options.start.toISOString() },
      end: { dateTime: end.toISOString() },
      status: "tentative",
      transparency: "opaque",
      reminders: { useDefault: true },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("calendar.insert_failed", { status: res.status, body: text.slice(0, 200) });
  }
}
