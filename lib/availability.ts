/**
 * When Matterpixel is reachable — the single source of truth for both the
 * booking calendar and every piece of availability copy on the site.
 *
 * Audit calls  Sunday–Thursday, 13:00–24:00 UTC; Friday–Saturday, 24 hours.
 * WhatsApp/email  always.
 *
 * Everything here is defined in **UTC** and rendered in whichever zone the
 * visitor picks, because the office window is fixed in UTC while visitors
 * are not. A slot is therefore an *instant* (a `Date`), never a wall-clock
 * string — a "2:30 PM" that doesn't say where is exactly the ambiguity this
 * module exists to remove.
 */

/** Slot granularity, and the length of the call itself. */
export const SLOT_MINUTES = 30;
export const CALL_MINUTES = 30;

/** How far ahead of now the earliest bookable slot sits. */
export const LEAD_TIME_MINUTES = 60;

/** Booking horizon — past this, "availability" is a guess, not a promise. */
export const HORIZON_DAYS = 90;

/** Human-readable statements of the rule above. Copy anywhere on the site
 * should come from here so the hours can never drift between pages. */
export const AVAILABILITY = {
  callsShort: "Sun–Thu 1:00 PM–12:00 AM UTC · Fri–Sat 24h",
  callsLong: "Audit calls: Sunday–Thursday, 1:00 PM–12:00 AM UTC. Friday–Saturday, 24 hours.",
  messaging: "WhatsApp & email: 24/7",
} as const;

/** UTC hour (inclusive) the Sun–Thu window opens. It runs to midnight, so a
 * 23:30 start still finishes inside the window. */
const WEEKDAY_OPEN_HOUR_UTC = 13;

/** UTC weekdays that are open around the clock (5 = Fri, 6 = Sat). */
const FULL_DAY_UTC = new Set([5, 6]);

/** Whether a call may *start* at this instant, by the UTC rule alone —
 * lead time and horizon are separate concerns (see `slotMapForRange`). */
export function isWithinCallWindow(instant: Date): boolean {
  const day = instant.getUTCDay();
  if (FULL_DAY_UTC.has(day)) return true;
  return instant.getUTCHours() >= WEEKDAY_OPEN_HOUR_UTC;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/** Wall-clock reading of `instant` in `timeZone`. `hourCycle: "h23"` keeps
 * midnight as 00, not 24. */
export function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** `YYYY-MM-DD` for `instant` as seen in `timeZone`. */
export function zonedDateKey(instant: Date, timeZone: string): string {
  const { year, month, day } = zonedParts(instant, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 24h `HH:MM` for `instant` as seen in `timeZone`. */
export function zonedTimeKey(instant: Date, timeZone: string): string {
  const { hour, minute } = zonedParts(instant, timeZone);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Minutes `timeZone` is ahead of UTC at `instant` — recomputed per instant
 * on purpose, since half the world's offsets move twice a year. */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const { year, month, day, hour, minute } = zonedParts(instant, timeZone);
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  // Compared against the instant floored to its own minute: the parts above
  // carry no seconds, so leaving them in would skew every offset by up to a
  // minute — enough to break :45 zones like Asia/Kathmandu.
  const instantMinute = Math.floor(instant.getTime() / 60_000) * 60_000;
  return Math.round((asIfUtc - instantMinute) / 60_000);
}

/** "GMT+6", "GMT-3:30", "GMT" — the label the visitor picks their zone by. */
export function zoneOffsetLabel(timeZone: string, at: Date = new Date()): string {
  const total = zoneOffsetMinutes(at, timeZone);
  if (total === 0) return "GMT";
  const sign = total > 0 ? "+" : "-";
  const abs = Math.abs(total);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

/** The visitor's own zone, or UTC where the browser won't say. */
export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Every bookable start instant between `from` and `to`, bucketed by the day
 * it falls on *in `timeZone`* — which is what the calendar grid needs, since
 * one UTC window can straddle two local days (and, near the date line, land
 * on a different day entirely).
 *
 * Walking UTC once and bucketing is deliberate: asking "is this local day
 * open?" per cell would re-format the same instants six times over.
 */
export function slotMapForRange(from: Date, to: Date, timeZone: string, now: Date = new Date()): Map<string, Date[]> {
  const map = new Map<string, Date[]>();
  const earliest = now.getTime() + LEAD_TIME_MINUTES * 60_000;
  const latest = now.getTime() + HORIZON_DAYS * 24 * 60 * 60_000;

  // Start on the first slot boundary at or after `from`.
  const step = SLOT_MINUTES * 60_000;
  let cursor = Math.ceil(from.getTime() / step) * step;
  const end = to.getTime();

  for (; cursor <= end; cursor += step) {
    if (cursor < earliest || cursor > latest) continue;
    const instant = new Date(cursor);
    if (!isWithinCallWindow(instant)) continue;
    const key = zonedDateKey(instant, timeZone);
    const bucket = map.get(key);
    if (bucket) bucket.push(instant);
    else map.set(key, [instant]);
  }

  return map;
}

/** Formats a slot for display in the visitor's zone: "2:30 PM". */
export function formatSlotTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

/** "Tue, 18 Aug 2026" in the visitor's zone. */
export function formatSlotDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(instant);
}

/** Same long date, from a `YYYY-MM-DD` key that is already zone-local — used
 * on the review screen, where there is nothing left to convert. */
export function formatDateKeyLong(key: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return "—";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** 24h `HH:MM` → "2:30 PM". */
export function formatTimeKey(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "—";
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}
