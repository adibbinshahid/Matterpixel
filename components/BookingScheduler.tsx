"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { cn, EASE } from "@/lib/utils";
import {
  CALL_MINUTES,
  slotMapForRange,
  zonedDateKey,
  zonedParts,
  zoneOffsetLabel,
  zoneOffsetMinutes,
} from "@/lib/availability";

/**
 * The booking wizard's slot step: one card split into a month grid and a
 * slot rail, both driven by the real availability window in
 * `lib/availability` and rendered in whichever time zone the visitor picks.
 *
 * The selection this reports upward is an **ISO instant**, not a wall-clock
 * string: the office window is fixed to the office's clock, the visitor is
 * not, and the two only agree on an instant. The zone-local date/time the
 * visitor saw travel alongside it for the confirmation email.
 */

/** Above this many slots in a day, the rail splits into parts of the day;
 * at or below it the day is shown whole. Set just above a normal weekday's
 * ten so only the around-the-clock days ever get tabs. */
const GROUP_THRESHOLD = 12;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Offered zones, one per major offset — enough to cover any visitor
 * without a 400-row select. Sorted by real offset at render time. */
export const TIME_ZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

/** Direction-aware page-turn, shared by the month label and the day grid so
 * both halves of the header move as one. `custom` is the +1/-1 direction.
 * Written as variants (not inline `initial={(d) => …}` props) because
 * Motion only threads `custom` through variant resolvers. */
const monthLabelVariants = {
  enter: (d: number) => ({ opacity: 0, y: d > 0 ? 14 : -14 }),
  center: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: (d: number) => ({ opacity: 0, y: d > 0 ? -14 : 14, transition: { duration: 0.24, ease: EASE } }),
};

const gridVariants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 34 : -34 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.34, ease: EASE } },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -34 : 34, transition: { duration: 0.28, ease: EASE } }),
};

/** Civil `YYYY-MM-DD` for a plain calendar cell — no zone involved, the grid
 * is just a grid. */
function civilKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Buckets a slot by the visitor's local hour. Fri/Sat are open around the
 * clock, so "Night" is a real bucket here, not a rounding error. */
const SLOT_GROUPS = [
  { id: "night", label: "Night", icon: Moon, test: (h: number) => h < 6 },
  { id: "morning", label: "Morning", icon: Sunrise, test: (h: number) => h >= 6 && h < 12 },
  { id: "afternoon", label: "Afternoon", icon: Sun, test: (h: number) => h >= 12 && h < 17 },
  { id: "evening", label: "Evening", icon: Sunset, test: (h: number) => h >= 17 },
] as const;

type GroupId = (typeof SLOT_GROUPS)[number]["id"];

function groupOf(instant: Date, timeZone: string): GroupId {
  const { hour } = zonedParts(instant, timeZone);
  return SLOT_GROUPS.find((g) => g.test(hour))!.id;
}

export interface SlotSelection {
  /** The booked instant, ISO — the only unambiguous part. */
  slotUtc: string;
  /** What the visitor saw, in their chosen zone. */
  dateKey: string;
  timeKey: string;
}

export function SchedulePicker({
  timeZone,
  onTimeZoneChange,
  slotUtc,
  onSelect,
}: {
  timeZone: string;
  onTimeZoneChange: (tz: string) => void;
  slotUtc: string;
  onSelect: (selection: SlotSelection) => void;
}) {
  /** Re-ticks every minute so the lead-time cutoff moves on its own — a
   * visitor who sits on this step for ten minutes shouldn't be offered a
   * slot that has since become unbookable. */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const selectedInstant = useMemo(() => {
    if (!slotUtc) return null;
    const d = new Date(slotUtc);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [slotUtc]);

  const todayKey = zonedDateKey(now, timeZone);

  const [cursor, setCursor] = useState(() => {
    const base = selectedInstant ? zonedParts(selectedInstant, timeZone) : zonedParts(new Date(), timeZone);
    return { year: base.year, month: base.month - 1 };
  });
  const [direction, setDirection] = useState(1);

  /** Which day's slots the rail is showing. Follows the selection, but is
   * its own state so a visitor can browse another day's times without
   * losing the slot they already picked. */
  const [activeDay, setActiveDay] = useState<string>(() =>
    selectedInstant ? zonedDateKey(selectedInstant, timeZone) : "",
  );

  // The zone changing rewrites what every slot is *called* without changing
  // which instant is booked, so the visible day has to follow the selection
  // into its new local date (14:00 Sunday in Dhaka is 08:00 Sunday in UTC,
  // but 21:00 *Saturday* in Los Angeles).
  useEffect(() => {
    if (!selectedInstant) return;
    const key = zonedDateKey(selectedInstant, timeZone);
    setActiveDay(key);
    const parts = zonedParts(selectedInstant, timeZone);
    setCursor({ year: parts.year, month: parts.month - 1 });
  }, [selectedInstant, timeZone]);

  /** Every bookable instant in the visible month (plus a day of slack each
   * side, since a UTC window can spill into the neighbouring local day),
   * bucketed by local date. */
  const slotMap = useMemo(() => {
    const from = new Date(Date.UTC(cursor.year, cursor.month, 1) - 24 * 60 * 60_000);
    const to = new Date(Date.UTC(cursor.year, cursor.month + 1, 1) + 24 * 60 * 60_000);
    return slotMapForRange(from, to, timeZone, now);
  }, [cursor, timeZone, now]);

  const daySlots = activeDay ? (slotMap.get(activeDay) ?? []) : [];

  /**
   * Whether the day is long enough to be worth splitting into parts of the
   * day. A short day is shown *whole* — filtering it would hide slots behind
   * a control that isn't on screen, which is what a Sun–Thu evening looked
   * like from a western zone: ten slots open, two of them reachable.
   */
  const grouped = daySlots.length > GROUP_THRESHOLD;

  const [group, setGroup] = useState<GroupId>("morning");

  // Keep the rail on a tab that actually has slots: the visitor's own pick
  // if there is one, otherwise the earliest group that day offers.
  useEffect(() => {
    if (!grouped) return;
    if (selectedInstant && activeDay === zonedDateKey(selectedInstant, timeZone)) {
      setGroup(groupOf(selectedInstant, timeZone));
      return;
    }
    const first = SLOT_GROUPS.find((g) => daySlots.some((s) => groupOf(s, timeZone) === g.id));
    if (first) setGroup(first.id);
    // daySlots is derived from activeDay/slotMap; those are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, slotMap, timeZone, selectedInstant, grouped]);

  const shiftMonth = (delta: number) => {
    setDirection(delta);
    setCursor((c) => {
      const next = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  };

  const nowParts = zonedParts(now, timeZone);
  const atFirstMonth = cursor.year === nowParts.year && cursor.month === nowParts.month - 1;

  const cells = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const out: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day++) out.push(day);
    return out;
  }, [cursor]);

  const monthKey = `${cursor.year}-${cursor.month}`;
  const monthLabel = new Date(Date.UTC(cursor.year, cursor.month, 1));

  const visibleSlots = useMemo(
    () => (grouped ? daySlots.filter((s) => groupOf(s, timeZone) === group) : daySlots),
    // daySlots is derived from activeDay/slotMap; those are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeDay, slotMap, group, grouped, timeZone],
  );

  return (
    <div className="rounded-[1.6rem] bg-gradient-to-br from-blue/45 via-white/10 to-magenta/45 p-px shadow-[0_40px_90px_-45px_rgba(37,99,235,0.65)]">
      <div className="grid overflow-hidden rounded-[calc(1.6rem-1px)] bg-[#0a0a12]/85 backdrop-blur-xl backdrop-saturate-150 md:grid-cols-[0.86fr_1.14fr]">
        {/* ------------------------------ date --------------------------- */}
        <div className="flex flex-col border-b border-white/10 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 px-4 pt-4">
            <PanelIcon>
              <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
            </PanelIcon>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-soft/70">Select a</p>
              <p className="text-[1.05rem] font-extrabold leading-tight tracking-tight text-ink">Date</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <MonthButton label="Previous month" disabled={atFirstMonth} onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </MonthButton>

            {/* The month label swaps with the grid and in the same direction,
               so the header reads as one page turn. */}
            <div className="relative h-6 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.span
                  key={monthKey}
                  custom={direction}
                  variants={monthLabelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center text-[0.95rem] font-bold tracking-tight text-ink"
                >
                  {monthLabel.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}
                  <span className="ml-1.5 font-semibold text-ink-soft">{cursor.year}</span>
                </motion.span>
              </AnimatePresence>
            </div>

            <MonthButton label="Next month" onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </MonthButton>
          </div>

          <div className="grid grid-cols-7 gap-0.5 px-3 pb-1">
            {WEEKDAY_LABELS.map((d, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="text-center text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft/60"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="relative flex-1 overflow-hidden px-3 pb-3">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={monthKey}
                custom={direction}
                variants={gridVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-7 gap-y-0.5"
              >
                {cells.map((day, i) => {
                  if (day === null) return <span key={`pad-${i}`} />;
                  const key = civilKey(cursor.year, cursor.month, day);
                  // A day is bookable when the availability window actually
                  // lands on it in *this* zone — no weekday rule in the UI,
                  // the rule lives in lib/availability.
                  const open = (slotMap.get(key)?.length ?? 0) > 0;
                  const isToday = key === todayKey;
                  const isActive = key === activeDay;
                  const holdsSelection =
                    !!selectedInstant && key === zonedDateKey(selectedInstant, timeZone);
                  // The around-the-clock days get the accent colour, but by
                  // slot count rather than by column: Friday in Dhaka starts
                  // on Thursday evening in Cairo, so the open-all-day cell is
                  // not always the weekend column in the visitor's zone.
                  const isFullDay = (slotMap.get(key)?.length ?? 0) > GROUP_THRESHOLD;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!open}
                      onClick={() => setActiveDay(key)}
                      aria-label={`${key}${open ? "" : " — no slots"}`}
                      aria-pressed={isActive}
                      className={cn(
                        // Fixed circles rather than `aspect-square` cells: the
                        // column width comes from the pane, and a six-row
                        // month of pane-wide squares is taller than the card.
                        "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[0.82rem] font-semibold transition-colors duration-200",
                        !open
                          ? "cursor-not-allowed text-ink-soft/20"
                          : isActive
                            ? "text-white"
                            : isFullDay
                              ? "text-magenta hover:bg-white/10"
                              : "text-ink hover:bg-white/10",
                      )}
                    >
                      {/* One puck for the whole grid: `layoutId` animates it
                         *between* cells instead of cross-fading two circles,
                         which is what sells the Apple feel. */}
                      {isActive && (
                        <motion.span
                          layoutId="calendar-selection"
                          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
                          className={cn(
                            "absolute inset-[2px] rounded-full",
                            holdsSelection
                              ? "bg-gradient-to-br from-blue to-magenta shadow-[0_0_26px_-2px_rgba(37,99,235,0.85)]"
                              : "bg-white/15",
                          )}
                        />
                      )}
                      {isToday && !isActive && (
                        <span className="absolute inset-[2px] rounded-full border border-white/25" />
                      )}
                      <span className="relative z-10">{day}</span>
                      {holdsSelection && (
                        <motion.span
                          layoutId="calendar-selection-dot"
                          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-magenta"
                        />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* ------------------------------ time --------------------------- */}
        <div className="flex flex-col">
          {/* The zone control lives beside the times it rewrites, not under
             the calendar: it changes what every slot below is *called*. */}
          <div className="flex items-center gap-3 px-4 pt-4">
            <PanelIcon>
              <Clock className="h-4 w-4" strokeWidth={2.25} />
            </PanelIcon>
            <div className="min-w-0 flex-1">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-soft/70">Select a</p>
              <p className="text-[1.05rem] font-extrabold leading-tight tracking-tight text-ink">Time Slot</p>
            </div>
            <ZonePicker timeZone={timeZone} onChange={onTimeZoneChange} now={now} />
          </div>

          <p className="px-4 pt-1.5 text-[0.72rem] font-semibold text-ink-soft">
            {/* The window itself is already stated in the step header — this
               line only carries what the header does not. */}
            Meeting duration: {CALL_MINUTES} min
            {daySlots.length > 0 && (
              <span className="text-ink-soft/60"> · {daySlots.length} slots open</span>
            )}
          </p>

          {/* The tabs are a 24-hour-day affordance, so they appear only when
             the day actually has more slots than the rail can hold. */}
          <AnimatePresence initial={false}>
            {grouped && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mx-4 mt-3 flex rounded-full border border-white/10 bg-white/[0.05] p-0.5">
                  {SLOT_GROUPS.map(({ id, label, icon: Icon }) => {
                    const count = daySlots.filter((s) => groupOf(s, timeZone) === id).length;
                    const isActive = id === group;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={count === 0}
                        onClick={() => setGroup(id)}
                        aria-pressed={isActive}
                        title={`${label} — ${count} times`}
                        className={cn(
                          "relative flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.06em] transition-colors duration-200",
                          count === 0
                            ? "cursor-not-allowed text-ink-soft/25"
                            : isActive
                              ? "text-white"
                              : "text-ink-soft hover:text-ink",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="slot-group-pill"
                            transition={{ type: "spring", stiffness: 420, damping: 36 }}
                            className="absolute inset-0 rounded-full bg-white/12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]"
                          />
                        )}
                        <Icon className="relative z-10 h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
                        <span className="relative z-10 hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* A 24-hour Friday can offer 48 slots; the rail scrolls inside its
             own box rather than growing the step past the card. overflow-x is
             pinned because `overflow-y: auto` alone would let the x axis
             compute to auto and flash a scrollbar under the entering grid. */}
          <div className="min-h-[13rem] flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeDay}-${group}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: EASE }}
                className={cn(
                  !activeDay || !visibleSlots.length
                    ? ""
                    : // Four columns once there is room: a 24-hour day then
                      // shows a whole period without scrolling.
                      "grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4",
                )}
              >
                {!activeDay || !visibleSlots.length ? (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-[0.78rem] font-semibold text-ink-soft">
                    {!activeDay ? "Pick a day to see open times." : "No times left in this part of the day."}
                  </p>
                ) : (
                  visibleSlots.map((instant, i) => {
                    const iso = instant.toISOString();
                    const isSelected = iso === slotUtc;
                    const { hour, minute } = zonedParts(instant, timeZone);
                    return (
                      <motion.button
                        key={iso}
                        type="button"
                        onClick={() =>
                          onSelect({
                            slotUtc: iso,
                            dateKey: zonedDateKey(instant, timeZone),
                            timeKey: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
                          })
                        }
                        aria-pressed={isSelected}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: Math.min(i, 14) * 0.028 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "relative overflow-hidden rounded-xl border px-1 py-2.5 text-[0.75rem] font-semibold tabular-nums transition-colors duration-200",
                          isSelected
                            ? "border-transparent text-white"
                            : "border-white/10 bg-white/[0.04] text-ink hover:border-white/25 hover:bg-white/[0.08]",
                        )}
                      >
                        {/* One puck for the whole rail, same trick as the
                           calendar: it travels to the new slot rather than
                           two chips cross-fading. */}
                        {isSelected && (
                          <motion.span
                            layoutId="slot-selection"
                            transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue to-magenta shadow-[0_14px_30px_-12px_rgba(37,99,235,0.95)]"
                          />
                        )}
                        <span className="relative z-10">{padSlotTime(instant, timeZone)}</span>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-[0.72rem] font-semibold text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue" strokeWidth={2.25} aria-hidden="true" />
            Times shown in your selected time zone — change it above
          </p>
        </div>
      </div>
    </div>
  );
}

/** The small rounded glyph tile that heads each panel. */
function PanelIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-blue/25 to-magenta/15 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
      {children}
    </span>
  );
}

/** "09:00 AM" — zero-padded so a column of slots keeps one edge. */
function padSlotTime(instant: Date, timeZone: string): string {
  const { hour, minute } = zonedParts(instant, timeZone);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function ZonePicker({
  timeZone,
  onChange,
  now,
}: {
  timeZone: string;
  onChange: (tz: string) => void;
  now: Date;
}) {
  // Sorted west-to-east by real offset, so the list reads like a globe
  // rather than like the alphabet.
  const zones = useMemo(
    () =>
      [...TIME_ZONES]
        .map((tz) => ({ tz, offset: zoneOffsetMinutes(now, tz), label: zoneOffsetLabel(tz, now) }))
        .sort((a, b) => a.offset - b.offset),
    [now],
  );

  // A zone the visitor's browser reports but the list doesn't carry still
  // has to be selectable, or the select would silently show the wrong one.
  const hasCurrent = zones.some((z) => z.tz === timeZone);

  return (
    // A compact pill, because it sits in a header row rather than a footer:
    // the offset is the part anyone scans for, the city name is the proof.
    <label className="group relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.1] focus-within:border-blue">
      <Globe className="h-3.5 w-3.5 shrink-0 text-blue" strokeWidth={2.25} aria-hidden="true" />
      <span className="max-w-[6.5rem] truncate text-[0.7rem] font-bold text-ink sm:max-w-[9rem]">
        <span className="tabular-nums">{zoneOffsetLabel(timeZone, now)}</span>
        <span className="ml-1 hidden font-semibold text-ink-soft sm:inline">
          {timeZone.split("/").pop()?.replace(/_/g, " ")}
        </span>
      </span>
      <ChevronDown
        className="h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform duration-200 group-hover:translate-y-0.5"
        strokeWidth={2.5}
        aria-hidden="true"
      />
      {/* A native select laid over the pill: the zone list stays keyboard-
         and mobile-native while the trigger reads as one line of type. */}
      <select
        value={timeZone}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Time zone"
        className="focus-no-outline absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {!hasCurrent && timeZone && (
          <option value={timeZone}>
            {timeZone.replace(/_/g, " ")} ({zoneOffsetLabel(timeZone, now)})
          </option>
        )}
        {zones.map(({ tz, label }) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, " ")} ({label})
          </option>
        ))}
      </select>
    </label>
  );
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-ink transition-colors",
        disabled ? "cursor-not-allowed opacity-30" : "hover:border-blue/50 hover:text-blue",
      )}
    >
      {children}
    </motion.button>
  );
}


