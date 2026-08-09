/**
 * When Matterpixel is reachable — the single source of truth for both the
 * booking calendar and every piece of availability copy on the site.
 *
 * Audit calls  Sunday–Thursday, 7:00–11:30 PM; Friday–Saturday, 24 hours —
 * all on the office clock (Asia/Dhaka, GMT+6).
 * WhatsApp/email  always.
 *
 * The window is defined in the **office's own zone** and rendered in whichever
 * zone the visitor picks. Defining it in UTC instead is what made a Dhaka
 * Sunday open at midnight: a UTC-Saturday 24h rule runs to 23:30 UTC, which is
 * already 05:30 Sunday in Dhaka. A slot is therefore an *instant* (a `Date`),
 * never a wall-clock string — a "2:30 PM" that doesn't say where is exactly
 * the ambiguity this module exists to remove.
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
  callsShort: "Sun–Thu 7:00–11:30 PM (GMT+6) · Fri–Sat 24h",
  /** Tightest form — for places that must hold one line. */
  callsCompact: "Sun–Thu 7–11:30 PM GMT+6 · Fri–Sat 24h",
  callsLong:
    "Audit calls: Sunday–Thursday, 7:00 PM–11:30 PM (GMT+6). Friday–Saturday, 24 hours.",
  messaging: "WhatsApp & email: 24/7",
} as const;

/** The office's own clock. Every rule below is a wall-clock rule *here*. */
export const OFFICE_TIME_ZONE = "Asia/Dhaka";

/** Sun–Thu: first and last bookable *start*, as minutes past office midnight.
 * The last start is 23:30 so a 30-minute call still ends on the same day. */
const WEEKDAY_OPEN_MINUTE = 19 * 60;
const WEEKDAY_LAST_START_MINUTE = 23 * 60 + 30;

/** Office weekdays open around the clock (5 = Fri, 6 = Sat). */
const FULL_DAY_OFFICE = new Set([5, 6]);

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** Day of week (0 = Sunday) for `instant` as seen in `timeZone`. */
export function zonedWeekday(instant: Date, timeZone: string): number {
  const label = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(instant);
  return WEEKDAY_INDEX[label] ?? 0;
}

/** Whether a call may *start* at this instant, by the office-hours rule alone
 * — lead time and horizon are separate concerns (see `slotMapForRange`). */
export function isWithinCallWindow(instant: Date): boolean {
  if (FULL_DAY_OFFICE.has(zonedWeekday(instant, OFFICE_TIME_ZONE))) return true;
  const { hour, minute } = zonedParts(instant, OFFICE_TIME_ZONE);
  const mins = hour * 60 + minute;
  return mins >= WEEKDAY_OPEN_MINUTE && mins <= WEEKDAY_LAST_START_MINUTE;
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

/** Whether `Intl` will accept this as a zone. Worth asking before formatting
 * anything with a zone that arrived over the wire: `Intl.DateTimeFormat`
 * throws a `RangeError` on an unknown one, which would turn a junk request
 * body into a 500. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Whether `instant` lands on a real slot boundary. The window rule alone
 * would accept 7:07 PM, which is not a slot anyone was offered. */
export function isOnSlotGrain(instant: Date): boolean {
  return instant.getTime() % (SLOT_MINUTES * 60_000) === 0;
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
