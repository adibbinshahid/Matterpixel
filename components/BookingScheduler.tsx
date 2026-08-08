"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ChevronLeft, ChevronRight, Globe, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { cn, EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  AVAILABILITY,
  formatSlotDate,
  formatSlotTime,
  slotMapForRange,
  zonedDateKey,
  zonedParts,
  zoneOffsetLabel,
  zoneOffsetMinutes,
} from "@/lib/availability";

/**
 * The booking wizard's slot step: an Apple-Calendar-style month grid, a
 * time-of-day rail, and a live analog clock — all three driven by the real
 * availability window in `lib/availability` and rendered in whichever time
 * zone the visitor picks.
 *
 * The selection this reports upward is an **ISO instant**, not a wall-clock
 * string: the office window is fixed in UTC, the visitor is not, and the two
 * only agree on an instant. The zone-local date/time the visitor saw travel
 * alongside it for the confirmation email.
 */

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

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

  const [group, setGroup] = useState<GroupId>("morning");

  // Keep the rail on a tab that actually has slots: the visitor's own pick
  // if there is one, otherwise the earliest group that day offers.
  useEffect(() => {
    if (selectedInstant && activeDay === zonedDateKey(selectedInstant, timeZone)) {
      setGroup(groupOf(selectedInstant, timeZone));
      return;
    }
    const first = SLOT_GROUPS.find((g) => daySlots.some((s) => groupOf(s, timeZone) === g.id));
    if (first) setGroup(first.id);
    // daySlots is derived from activeDay/slotMap; those are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, slotMap, timeZone, selectedInstant]);

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

  const visibleSlots = daySlots.filter((s) => groupOf(s, timeZone) === group);

  return (
    <div className="flex flex-col gap-3">
      <ZonePicker timeZone={timeZone} onChange={onTimeZoneChange} now={now} />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* ------------------------------ calendar ----------------------- */}
        <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
          <div className="flex items-center justify-between px-1 pb-2">
            {/* The month label swaps with the grid and in the same
               direction, so the header reads as one page turn. */}
            <div className="relative h-6 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.span
                  key={monthKey}
                  custom={direction}
                  variants={monthLabelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center text-[0.95rem] font-bold tracking-tight text-ink"
                >
                  {monthLabel.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}
                  <span className="ml-1.5 font-semibold text-ink-soft">{cursor.year}</span>
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
              <MonthButton label="Previous month" disabled={atFirstMonth} onClick={() => shiftMonth(-1)}>
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </MonthButton>
              <MonthButton label="Next month" onClick={() => shiftMonth(1)}>
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </MonthButton>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 pb-1">
            {WEEKDAY_LABELS.map((d, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="text-center text-[0.6rem] font-bold uppercase tracking-[0.1em] text-ink-soft/70"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={monthKey}
                custom={direction}
                variants={gridVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-7 gap-0.5"
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

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!open}
                      onClick={() => setActiveDay(key)}
                      aria-label={`${key}${open ? "" : " — no slots"}`}
                      aria-pressed={isActive}
                      className={cn(
                        // Fixed 36px circles rather than `aspect-square`
                        // cells: the column width comes from the pane, and a
                        // six-row month of pane-wide squares is taller than
                        // the card.
                        "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[0.8rem] font-semibold transition-colors duration-200",
                        !open
                          ? "cursor-not-allowed text-ink-soft/25"
                          : holdsSelection || isActive
                            ? "text-white"
                            : "text-ink hover:bg-white/12",
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
                            "absolute inset-[3px] rounded-full",
                            holdsSelection
                              ? "bg-gradient-to-br from-blue to-magenta shadow-[0_10px_22px_-10px_rgba(37,99,235,0.9)]"
                              : "bg-white/20",
                          )}
                        />
                      )}
                      {isToday && !isActive && (
                        <span className="absolute inset-[3px] rounded-full border border-blue/60" />
                      )}
                      <span className="relative z-10">{day}</span>
                      {holdsSelection && !isActive && (
                        <span className="absolute bottom-[5px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-magenta" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="px-1 pt-2 text-[0.65rem] font-semibold leading-relaxed text-ink-soft/70">
            {AVAILABILITY.callsShort}
          </p>
        </div>

        {/* -------------------------- clock + rail ------------------------ */}
        <div className="flex flex-col gap-3">
          <ClockPreview instant={selectedInstant} timeZone={timeZone} />

          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
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
                    className={cn(
                      "relative flex flex-1 items-center justify-center gap-1 rounded-full px-1.5 py-1.5 text-[0.65rem] font-bold transition-colors duration-200",
                      count === 0
                        ? "cursor-not-allowed text-ink-soft/30"
                        : isActive
                          ? "text-white"
                          : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="slot-group-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        className="absolute inset-0 rounded-full bg-blue shadow-[0_10px_22px_-12px_rgba(37,99,235,0.9)]"
                      />
                    )}
                    <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* A 24-hour Friday can offer 48 slots; the rail scrolls inside
               its own box rather than growing the step past the card and
               pushing the calendar out of view. overflow-x-hidden because
               `overflow-y: auto` alone would let the x axis compute to auto
               and flash a scrollbar under the entering slot grid. */}
            <div className="min-h-[6.75rem] max-h-[13.5rem] overflow-y-auto overflow-x-hidden pr-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeDay}-${group}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className={cn(!activeDay || !visibleSlots.length ? "" : "grid grid-cols-3 gap-1.5")}
                >
                  {!activeDay ? (
                    <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-[0.75rem] font-semibold text-ink-soft">
                      Pick a day to see open times.
                    </p>
                  ) : !visibleSlots.length ? (
                    <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center text-[0.75rem] font-semibold text-ink-soft">
                      No times left in this part of the day.
                    </p>
                  ) : (
                    visibleSlots.map((instant, i) => {
                      const iso = instant.toISOString();
                      const isSelected = iso === slotUtc;
                      return (
                        <motion.button
                          key={iso}
                          type="button"
                          onClick={() =>
                            onSelect({
                              slotUtc: iso,
                              dateKey: zonedDateKey(instant, timeZone),
                              timeKey: `${String(zonedParts(instant, timeZone).hour).padStart(2, "0")}:${String(
                                zonedParts(instant, timeZone).minute,
                              ).padStart(2, "0")}`,
                            })
                          }
                          aria-pressed={isSelected}
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.28, ease: EASE, delay: Math.min(i, 12) * 0.025 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "rounded-xl border px-2 py-1.5 text-[0.75rem] font-bold tabular-nums transition-colors duration-200",
                            isSelected
                              ? "border-blue bg-blue/20 text-ink shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                              : "border-white/15 bg-white/10 text-ink-soft hover:border-blue/50 hover:text-ink",
                          )}
                        >
                          {formatSlotTime(instant, timeZone)}
                        </motion.button>
                      );
                    })
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
    <label className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
      <Globe className="h-4 w-4 shrink-0 text-blue" strokeWidth={2} aria-hidden="true" />
      <span className="shrink-0 text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
        Times shown in
      </span>
      <select
        value={timeZone}
        onChange={(e) => onChange(e.target.value)}
        className="focus-no-outline min-w-0 flex-1 cursor-pointer rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[0.8rem] font-semibold text-ink outline-none transition-colors focus:border-blue"
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

/* -------------------------------- clock -------------------------------- */

/**
 * Analog preview of the picked slot, in the visitor's zone. The hands spring
 * to each new selection (and take the short way round — see `useSmoothAngle`),
 * and the face warms from dawn-blue to dusk-magenta across the day, so the
 * time reads before the numbers do.
 */
export function ClockPreview({ instant, timeZone }: { instant: Date | null; timeZone: string }) {
  const reduced = useReducedMotion();
  const parts = instant ? zonedParts(instant, timeZone) : null;
  const h = parts?.hour ?? 9;
  const m = parts?.minute ?? 0;

  const hourAngle = useSmoothAngle(parts ? ((h % 12) + m / 60) * 30 : 0, reduced);
  const minuteAngle = useSmoothAngle(parts ? m * 6 : 0, reduced);

  // Live second hand — the one thing on the card that is always moving, so
  // the preview reads as a clock rather than a picture of one.
  const [seconds, setSeconds] = useState(() => new Date().getSeconds());
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setSeconds(new Date().getSeconds()), 1000);
    return () => clearInterval(id);
  }, [reduced]);

  const dayProgress = parts ? Math.min(Math.max((h * 60 + m) / (24 * 60), 0), 1) : 0;
  const faceGlow = `radial-gradient(circle at 50% 32%, rgba(${Math.round(37 + dayProgress * 182)},${Math.round(99 - dayProgress * 60)},${Math.round(235 - dayProgress * 116)},0.28) 0%, rgba(10,10,14,0) 68%)`;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] px-3.5 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
      <div className="relative h-[64px] w-[64px] shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: faceGlow }}
          animate={{ opacity: parts ? 1 : 0.35 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" className="text-ink/15" strokeWidth="1.5" />
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const outer = 41;
            const inner = i % 3 === 0 ? 33 : 37;
            return (
              <line
                key={i}
                x1={50 + Math.sin(angle) * inner}
                y1={50 - Math.cos(angle) * inner}
                x2={50 + Math.sin(angle) * outer}
                y2={50 - Math.cos(angle) * outer}
                stroke="currentColor"
                className={i % 3 === 0 ? "text-ink/60" : "text-ink/25"}
                strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="27"
            stroke="currentColor"
            className="text-ink"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", rotate: hourAngle }}
          />
          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="16"
            stroke="currentColor"
            className="text-ink"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", rotate: minuteAngle }}
          />
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="14"
            stroke="currentColor"
            className="text-magenta"
            strokeWidth="1.25"
            strokeLinecap="round"
            style={{
              transformOrigin: "50px 50px",
              transform: `rotate(${seconds * 6}deg)`,
              transition: "transform 0.35s cubic-bezier(0.4, 2.2, 0.5, 1)",
            }}
          />
          <circle cx="50" cy="50" r="3.5" className="fill-ink" />
          <circle cx="50" cy="50" r="1.5" className="fill-magenta" />
        </svg>
      </div>

      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.p
            key={instant ? instant.toISOString() : "empty"}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: EASE }}
            className="text-[1.35rem] font-extrabold leading-none tracking-tight text-ink tabular-nums"
          >
            {instant ? formatSlotTime(instant, timeZone) : "--:--"}
          </motion.p>
        </AnimatePresence>
        <p className="mt-1.5 truncate text-[0.72rem] font-semibold text-ink-soft">
          {instant ? formatSlotDate(instant, timeZone) : "Pick a time"}
        </p>
      </div>
    </div>
  );
}

/**
 * Springs a clock hand to `target` degrees along the *short* arc. Feeding
 * raw 0–360 values to a spring makes 11:30 → 12:00 unwind almost a full
 * turn backwards; tracking an unbounded angle instead keeps every move to
 * at most half a revolution.
 */
function useSmoothAngle(target: number, reduced: boolean) {
  const raw = useMotionValue(target);
  const spring = useSpring(raw, { stiffness: 90, damping: 16, mass: 0.9 });
  const unwrapped = useRef(target);

  useEffect(() => {
    const delta = ((((target - unwrapped.current) % 360) + 540) % 360) - 180;
    unwrapped.current += delta;
    raw.set(unwrapped.current);
  }, [target, raw]);

  return reduced ? target : spring;
}
