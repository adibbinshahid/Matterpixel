/**
 * A minimal RFC 5545 calendar file for one call, attached to the booking
 * notification so the request lands in a calendar in one click. Marked
 * TENTATIVE: the slot is requested, not yet confirmed.
 */

/** 2026-11-21T13:30:00.000Z -> 20261121T133000Z */
function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape per RFC 5545 §3.3.11 and strip anything that could start a new
 * property line. */
function icsText(value: string): string {
  return value
    .replace(/\r?\n/g, "\\n")
    .replace(/\\(?!n)/g, "\\\\")
    .replace(/[;,]/g, (c) => `\\${c}`);
}

export function buildCallInvite(options: {
  start: Date;
  minutes: number;
  summary: string;
  description: string;
}): string {
  const { start, minutes, summary, description } = options;
  const end = new Date(start.getTime() + minutes * 60_000);
  const uid = `${icsDate(start)}-${Math.random().toString(36).slice(2, 10)}@matterpixel.com`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Matterpixel//Audit call//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(summary)}`,
    `DESCRIPTION:${icsText(description)}`,
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
