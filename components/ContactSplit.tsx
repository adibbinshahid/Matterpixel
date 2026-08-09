"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  FileCheck,
  Mail,
  MessageCircle,
  Pencil,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  inquirySchema,
  inquiryFieldSchemas,
  normalizeWebsite,
  bookingSchema,
  bookingFieldSchemas,
  AUDIT_FOCUS_OPTIONS,
  CHALLENGE_OPTIONS,
  ROLE_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  PROJECT_GOAL_OPTIONS,
  type InquiryValues,
  type BookingValues,
} from "@/lib/schema";
import { SchedulePicker } from "@/components/BookingScheduler";
import {
  AVAILABILITY,
  detectTimeZone,
  formatDateKeyLong,
  formatTimeKey,
  zonedDateKey,
  zonedTimeKey,
  zoneOffsetLabel,
} from "@/lib/availability";
import { services } from "@/content/services";
import { footer } from "@/content/siteConfig";
import { cn, EASE, DURATIONS } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { clearDraft, isDraftEmpty, readDraft, saveDraft } from "@/lib/formDraft";

/** localStorage keys for the two persisted contact forms. */
const INQUIRY_DRAFT_KEY = "contact-inquiry";
const BOOKING_DRAFT_KEY = "contact-booking";

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return {
    x: Math.cos(angle) * (60 + Math.random() * 40),
    y: Math.sin(angle) * (60 + Math.random() * 40),
    color: i % 2 === 0 ? "var(--blue)" : "var(--magenta)",
  };
});

const TABS = [
  {
    id: "inquiry",
    label: "Start a Project",
    blurb: "Best for new projects",
    icon: Send,
  },
  {
    id: "booking",
    label: "Book A Free Audit Call",
    blurb: "30-min strategy discussion",
    icon: Calendar,
  },
  {
    id: "chat",
    label: "Quick Question",
    blurb: "WhatsApp or email · 24/7",
    icon: MessageCircle,
  },
] as const;

const TRUST_POINTS = [
  { label: "Reply within 24h", icon: Clock },
  { label: "NDA-friendly", icon: FileCheck },
  { label: "Your data is 100% secure", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_IDS = TABS.map((t) => t.id);
const DEFAULT_TAB: TabId = "inquiry";

/** Validates an arbitrary string (e.g. a URL search param) against the
 * known tab ids — every option here is driven off `TABS`, so a future
 * fourth entry (say `id: "referral"`) automatically gets a working
 * `/contact?tab=referral` deep link with zero other changes needed. */
function isTabId(value: string | undefined): value is TabId {
  return !!value && (TAB_IDS as string[]).includes(value);
}

const panelVariants: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: DURATIONS.quick, ease: EASE } },
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: DURATIONS.quick * 0.7, ease: EASE } },
};

/** Same blur/y stagger recipe as Hero's `container`/`item` — this is the
 * site's one entrance-animation language, so the contact page's opening
 * shouldn't invent its own (was sliding in on x, which read as an
 * off-brand wobble next to every other page's mount). */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: DURATIONS.standard, ease: EASE } },
};
/** Animates nothing — occupies a stagger slot for a child that runs its
 * own entrance. */
const slot: Variants = { hidden: {}, visible: {} };

/** The tab rail's own entrance timing. The cards are glass, so the
 * blur-in can't sit on a wrapper: *any* ancestor with a filter other
 * than `none` becomes a backdrop root, which clips descendant
 * `backdrop-filter` sampling to that ancestor's own content — the cards
 * render flat for the whole entrance and then snap into glass the
 * instant the filter settles. Putting the same blur/y recipe on each
 * card itself avoids that entirely (an element's own filter doesn't
 * isolate its own backdrop, same as the right-hand panel), and lets the
 * three cards stagger in rather than arriving as one block.
 *
 * `TAB_STAGGER_BASE` lines the first card up with where the rail would
 * have landed as the container's second `item` child. */
const TAB_STAGGER_BASE = 0.1;
const TAB_STAGGER_STEP = 0.08;

/**
 * /contact — premium split-screen: a vertical tab rail on the left picks
 * between three contact modes, the right pane fade+slides between them.
 * Sized to fit a single laptop viewport (no internal-flow scroll needed
 * on ~1440x900+; the right pane falls back to its own scroll on shorter
 * screens rather than growing the page).
 *
 * Each mode is independently linkable via `?tab=<id>` (e.g.
 * `/contact?tab=booking`) — `initialTab` comes from the server (the page
 * reads `searchParams` so the right panel is already correct on first
 * paint, no client-side flash), and picking a tab updates the URL via
 * `router.replace` so the link stays shareable/bookmarkable after
 * interacting too, not just on load.
 */
export function ContactSplit({ initialTab }: { initialTab?: string }) {
  const [active, setActive] = useState<TabId>(isTabId(initialTab) ? initialTab : DEFAULT_TAB);
  const router = useRouter();
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  const selectTab = (id: TabId) => {
    setActive(id);
    router.replace(`/contact?tab=${id}`, { scroll: false });
  };

  return (
    <section
      data-nav-scrim="light"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#0b0b0d] px-6 pb-10 pt-32 sm:px-8 lg:px-12"
    >
      {/* bg-[#0b0b0d] on the section (not just bg-paper) — the headline
         and nav are styled white assuming a dark backdrop; a device that
         fails to autoplay/load the video (weak connection, data-saver,
         autoplay blocked) needs that same dark fallback or the text goes
         white-on-light and the whole section reads as broken. */}
      <video
        ref={videoRef}
        className="absolute inset-x-0 top-0 h-[100svh] w-full object-cover"
        src="/videos/globe-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/25" aria-hidden="true" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center lg:gap-10"
      >
        {/* Left: copy + standalone action cards — mirrors the reference
           layout's plain (non-glass) left column sitting directly on the
           video backdrop, distinct from the glass form card on the right. */}
        <div className="flex flex-col gap-7">
          <motion.div variants={item}>
            <p
              className="label-eyebrow mb-3 opacity-90"
              style={{ color: "var(--paper)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              Contact
            </p>
            <h1
              id="email"
              className="scroll-mt-32 text-[clamp(2.1rem,4.6vw,3.25rem)] font-extrabold leading-[1.05] tracking-tight text-paper"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.5)" }}
            >
              Let&rsquo;s build something that <span className="text-magenta">matters</span>.
            </h1>
            <p
              className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-paper/80"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              Share your ideas. We&rsquo;ll turn them into high-performing digital experiences.
            </p>
          </motion.div>

          {/* `slot`, not `item` — the cards animate themselves so their
             glass survives the entrance (see TAB_STAGGER_BASE); this
             wrapper only holds the rail's place in the container's
             stagger so the trust row and form card keep their timing. */}
          <motion.div variants={slot}>
            <TabNav active={active} onSelect={selectTab} />
          </motion.div>

          <motion.ul variants={item} className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-sm font-semibold text-paper/90"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.8)" }}
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-magenta"
                  strokeWidth={2.25}
                  aria-hidden="true"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" }}
                />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: glass form card — pure backdrop-blur, same filter recipe
           as the nav bar's scrolled dark-glass state, no fill color and no
           border ring. `.panel-dark` reassigns --ink/--paper/--paper-2/
           --line so every text-ink / bg-paper-2 / border-line utility
           inside the wizard renders light-on-dark automatically — the
           tabbed wizard/booking/chat content itself is unchanged. */}
        <motion.div
          variants={item}
          className="panel-dark relative h-full overflow-y-auto rounded-[2.25rem] border p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_-1px_12px_0_rgba(255,255,255,0.05),0_45px_100px_-25px_rgba(0,0,0,0.7),0_15px_40px_-15px_rgba(0,0,0,0.5)] sm:p-7 lg:p-8 lg:h-[calc(100svh-13rem)] lg:max-h-[40rem] lg:min-h-[30rem]"
          style={{
            borderColor: "rgba(255,255,255,0.22)",
            background: "rgba(10,10,14,0.03)",
            backdropFilter: "blur(38px) saturate(190%)",
          }}
        >
          {/* h-full all the way down to the form: without it the wizard
             was only as tall as its content while the card kept its
             viewport-derived height, leaving a large dead band under the
             Continue row. */}
          <div className="relative z-10 h-full">
              <AnimatePresence mode="wait">
                {active === "inquiry" && (
                  <motion.div
                    key="inquiry"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="h-full"
                  >
                    <InquiryPanel />
                  </motion.div>
                )}
                {active === "booking" && (
                  <motion.div
                    key="booking"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="h-full"
                  >
                    <BookingPanel />
                  </motion.div>
                )}
                {active === "chat" && (
                  <motion.div
                    key="chat"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="h-full"
                  >
                    <QuickChatPanel onBookCall={() => selectTab("booking")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

const MotionLink = motion.create(Link);

const cardSpring = { type: "spring", stiffness: 320, damping: 32, mass: 0.9 } as const;

function TabNav({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  /** The entrance delays live in the same `transition` that later drives
   * the active-card padding/hover springs, so they're dropped once the
   * rail has mounted — otherwise every tab switch would sit idle for up
   * to a quarter second before responding. */
  const [entered, setEntered] = useState(false);

  return (
    <nav className="flex flex-col gap-3">
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        const entranceDelay = TAB_STAGGER_BASE + i * TAB_STAGGER_STEP;
        return (
          <MotionLink
            key={tab.id}
            href={`/contact?tab=${tab.id}`}
            scroll={false}
            onClick={(e) => {
              // Same route, search-param-only change — handle it
              // ourselves (instant, no router round-trip) rather than
              // Link's own navigation, which still exists so the href is
              // right-click-copyable/open-in-new-tab-able and works with
              // JS disabled.
              e.preventDefault();
              onSelect(tab.id);
            }}
            aria-current={isActive}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              paddingTop: isActive ? 18 : 12,
              paddingBottom: isActive ? 18 : 12,
            }}
            // Last card only — it settles last, so nothing is still
            // mid-entrance when the delays are dropped.
            onAnimationComplete={i === TABS.length - 1 ? () => setEntered(true) : undefined}
            whileHover={{ y: -4, scale: 1.02, transition: cardSpring }}
            whileTap={{ y: -1, scale: 0.99, transition: cardSpring }}
            transition={
              entered
                ? cardSpring
                : {
                    ...cardSpring,
                    y: { ...cardSpring, delay: entranceDelay },
                    opacity: { duration: DURATIONS.standard, ease: EASE, delay: entranceDelay },
                    filter: { duration: DURATIONS.standard, ease: EASE, delay: entranceDelay },
                  }
            }
            className={cn(
              "group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border px-4 text-left transition-colors duration-300",
              isActive ? "border-blue/50" : "hover:border-white/40",
            )}
            // Padding is also declared here, not only in `animate`:
            // Motion renders `initial` into the SSR markup but never
            // `animate`, and there's no py-* class to fall back on — so
            // server HTML painted these cards with zero vertical padding
            // and they snapped to full height at hydration. Same numbers
            // in both places means first paint is already correct and the
            // spring has nothing to catch up on. Ditto the icon circle's
            // width/height and both label font sizes below.
            style={{
              paddingTop: isActive ? 18 : 12,
              paddingBottom: isActive ? 18 : 12,
              background: isActive ? "var(--blue)" : "rgba(10,10,14,0.03)",
              borderColor: isActive ? undefined : "rgba(255,255,255,0.22)",
              backdropFilter: "blur(38px) saturate(190%)",
              boxShadow: isActive
                ? "inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(37,99,235,0.15), 0 20px 45px -20px rgba(37,99,235,0.45)"
                : "inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -1px 12px 0 rgba(255,255,255,0.05)",
            }}
          >
            <motion.span
              animate={{ width: isActive ? 44 : 38, height: isActive ? 44 : 38 }}
              style={{ width: isActive ? 44 : 38, height: isActive ? 44 : 38 }}
              transition={cardSpring}
              className={cn(
                "relative z-10 flex shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                isActive ? "bg-white text-blue" : "bg-white/15 text-paper",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </motion.span>
            <span className="relative z-10 flex min-w-0 flex-col">
              <motion.span
                animate={{ fontSize: isActive ? "1.05rem" : "0.85rem" }}
                style={{ fontSize: isActive ? "1.05rem" : "0.85rem" }}
                transition={cardSpring}
                className="font-bold leading-tight text-paper"
              >
                {tab.label}
              </motion.span>
              <motion.span
                animate={{ fontSize: isActive ? "0.8rem" : "0.7rem", opacity: isActive ? 1 : 0.7 }}
                style={{ fontSize: isActive ? "0.8rem" : "0.7rem", opacity: isActive ? 1 : 0.7 }}
                transition={cardSpring}
                className="text-paper"
              >
                {tab.blurb}
              </motion.span>
            </span>
            <ArrowRight
              className={cn(
                "relative z-10 ml-auto h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5",
                isActive ? "text-white" : "text-paper/60",
              )}
            />
          </MotionLink>
        );
      })}
    </nav>
  );
}

function FloatingInput({
  registration,
  type,
  placeholder,
  error,
  autoFocus,
  autoComplete = "on",
  onKeyDown,
}: {
  registration: UseFormRegisterReturn;
  type: string;
  placeholder: string;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="relative">
        <input
          {...registration}
          id={`${registration.name}-wiz`}
          type={type}
          placeholder={placeholder}
          autoFocus={autoFocus}
          // Autofill deliberately left on for every wizard question —
          // browser/password-manager suggestions are faster than typing.
          autoComplete={autoComplete}
          onKeyDown={onKeyDown}
          aria-invalid={!!error}
          className={cn(
            // `focus-no-outline` (globals.css) + no focus shadow: nothing
            // is painted outside this element's own box. Both were being
            // sliced into flat blue bars by the wizard column's
            // overflow-hidden, since the field is exactly as wide as it.
            // Focus reads off the blue border + caret instead.
            "focus-no-outline peer w-full rounded-2xl border bg-white/10 px-6 py-6 text-xl font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-md backdrop-saturate-150 transition-all duration-300 placeholder:font-normal placeholder:text-ink-soft/40",
            error ? "border-magenta" : "border-white/15 focus:border-blue",
          )}
        />
      </div>
      {error && <span className="mt-1.5 block text-xs font-semibold text-magenta">{error}</span>}
    </div>
  );
}

function FloatingTextarea({
  registration,
  placeholder,
  error,
  autoFocus,
  autoComplete = "on",
}: {
  registration: UseFormRegisterReturn;
  placeholder: string;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <div className="relative">
        <textarea
          {...registration}
          id={`${registration.name}-wiz`}
          rows={4}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={cn(
            // Same as FloatingInput — nothing drawn outside the box.
            "focus-no-outline w-full resize-none rounded-2xl border bg-white/10 px-6 py-5 text-lg font-medium leading-relaxed text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-md backdrop-saturate-150 transition-all duration-300 placeholder:font-normal placeholder:text-ink-soft/40",
            error ? "border-magenta" : "border-white/15 focus:border-blue",
          )}
        />
      </div>
      {error && <span className="mt-1.5 block text-xs font-semibold text-magenta">{error}</span>}
    </div>
  );
}

function OptionPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm font-semibold backdrop-blur-md backdrop-saturate-150 transition-all duration-200",
        selected
          ? "border-blue bg-blue/10 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_0_0_3px_rgba(37,99,235,0.1)]"
          : "border-white/15 bg-white/10 text-ink-soft shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] hover:border-blue/40 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-blue bg-blue" : "border-line",
        )}
      >
        {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

/** OptionPill's compact cousin, for the review screen's inline editors —
 * same states, but sized so a full option set fits inside one summary row
 * without pushing the Send button off screen. */
function ReviewPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "truncate rounded-lg border px-2.5 py-1.5 text-left text-[0.75rem] font-semibold transition-colors duration-200",
        selected
          ? "border-blue bg-blue/20 text-ink"
          : "border-white/15 bg-white/[0.06] text-ink-soft hover:border-blue/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

/** Blocking confirm for the review screen's Start over — wiping a wizard the
 * visitor spent ten questions on is not something a stray click should do.
 * Portalled to <body>: the wizard's step slides and ambience layers are
 * transformed ancestors, and a `fixed` overlay inside one of those would
 * anchor to the card instead of the viewport. Escape or backdrop dismisses. */
function StartOverConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Focus lands on the destructive button's *neighbour* — Cancel is the safe
    // default, so Enter on an unread dialog does nothing irreversible.
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="start-over-title"
        aria-describedby="start-over-desc"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        // Light panel on purpose: the portal lands on <body>, outside the
        // form card's `.panel-dark` scope, so ink/paper resolve to their
        // light-theme values here. A dark panel would need its own token
        // override to stay legible.
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-paper p-5 text-center shadow-2xl"
      >
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-magenta/10 text-magenta">
          <RotateCcw className="h-5 w-5" />
        </span>
        <h3 id="start-over-title" className="mt-3 text-lg font-extrabold tracking-tight text-ink">
          Start over?
        </h3>
        <p id="start-over-desc" className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Every answer you&rsquo;ve filled in will be deleted and you&rsquo;ll go back to the first question.
          This can&rsquo;t be undone.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            ref={confirmRef}
            type="button"
            onClick={onCancel}
            className="focus-no-outline flex-1 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/45 hover:bg-ink/[0.05] focus-visible:border-blue"
          >
            Keep my answers
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="focus-no-outline flex-1 rounded-full bg-magenta px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-magenta/50 focus-visible:ring-offset-2"
          >
            Yes, delete &amp; restart
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function SubmitRow({
  isSubmitting,
  status,
  label,
  successMsg,
  onStartOver,
}: {
  isSubmitting: boolean;
  status: "idle" | "success" | "error";
  label: string;
  successMsg: string;
  /** When given, a Start over escape hatch sits under Send, behind a confirm. */
  onStartOver?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative mt-1 flex flex-col items-center gap-2">
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-brand btn-block group"
      >
        {isSubmitting ? "Sending…" : label}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

        <AnimatePresence>
          {status === "success" && (
            <span className="pointer-events-none absolute left-1/2 top-1/2">
              {BURST.map((b, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-1.5"
                  style={{ background: b.color }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: b.x, y: b.y, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.7, ease: EASE }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {status === "success" && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue"
            role="status"
          >
            <Check className="h-3.5 w-3.5" /> {successMsg}
          </motion.span>
        )}
        {status === "error" && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-semibold text-magenta"
            role="alert"
          >
            Something went wrong — try again.
          </motion.span>
        )}
      </AnimatePresence>

      {/* Hidden once sent — there is nothing left to start over from, and the
         success state should not offer a destructive-looking action. */}
      {onStartOver && status !== "success" && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={isSubmitting}
          className="focus-no-outline mt-0.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:text-ink disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      )}

      <AnimatePresence>
        {confirming && (
          <StartOverConfirm
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false);
              onStartOver?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type WizardStepId =
  | "fullName"
  | "workEmail"
  | "whatsapp"
  | "company"
  | "website"
  | "projectType"
  | "serviceTypes"
  | "budget"
  | "timeline"
  | "projectGoals"
  | "projectDetails";

interface WizardStep {
  id: WizardStepId;
  kind: "text" | "email" | "tel" | "textarea" | "choice" | "multi";
  title: string;
  /** Used instead of `title` once we know the visitor's first name, so
   * the run of questions reads like a conversation rather than a form.
   * Deliberately not on every step — a name in *every* headline reads
   * like a mail-merge, so only a few steps opt in. Falls back to
   * `title` whenever step 1 was left blank or the name is unusable. */
  titleWithName?: (name: string) => string;
  desc: string;
  /** Shown instead of `desc` when the name is known — same reasoning. */
  descWithName?: (name: string) => string;
  placeholder?: string;
  /** Short label for the review grid — the full question sentence is far
   * too long to fit eleven answers in one unscrolled view. */
  reviewLabel: string;
  /** Autofill token for this question's field. Every text step opts in —
   * defaults to a plain "on" so the browser still offers suggestions for
   * steps with no standard token. */
  autoComplete?: string;
  optional?: boolean;
  options?: readonly string[];
}

/** Capitalizes one name token: "adib" → "Adib", "ADIB" → "Adib",
 * "o'brien" → "O'Brien". Deliberately leaves intentional internal caps
 * ("McDonald", "DeLuca") alone rather than flattening them. */
function capitalizeNameToken(word: string): string {
  const hasInternalCaps = /[A-Z\p{Lu}]/u.test(word.slice(1));
  const isAllCaps = word === word.toUpperCase();
  const base = hasInternalCaps && !isAllCaps ? word : word.toLowerCase();
  // Capitalize after each sub-token boundary so hyphenated and apostrophe
  // names ("anne-marie", "o'brien") read correctly too.
  return base.replace(/(^|[-'’])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** The visitor's *full* name as entered, title-cased for use inside a
 * headline — "adib bin shahid" → "Adib Bin Shahid". Returns null
 * (→ neutral copy) for anything that would read badly: empty, an email
 * pasted into the name field, digits, or a name so long it would wrap
 * the headline on its own. */
function displayNameOf(fullName: string | undefined): string | null {
  const raw = (fullName ?? "").trim();
  if (!raw || /[@\d]/.test(raw)) return null;
  const clean = raw
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{M}'’-]/gu, ""))
    .filter(Boolean)
    .map(capitalizeNameToken)
    .join(" ");
  if (clean.length < 2 || clean.length > 32) return null;
  return clean;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "fullName",
    kind: "text",
    reviewLabel: "Name",
    title: "Let's start with your name.",
    desc: "We'll use this to personalize your proposal.",
    placeholder: "John Smith",
    autoComplete: "name",
  },
  {
    id: "workEmail",
    kind: "email",
    reviewLabel: "Work email",
    title: "What's your work email?",
    titleWithName: (n) => `Nice to meet you, ${n}. What's your work email?`,
    desc: "We'll send your proposal here.",
    placeholder: "john@company.com",
    autoComplete: "email",
  },
  {
    id: "whatsapp",
    kind: "tel",
    reviewLabel: "WhatsApp",
    title: "What's your WhatsApp number?",
    desc: "Optional — for faster back-and-forth.",
    placeholder: "+1 555 000 1234",
    autoComplete: "tel",
    optional: true,
  },
  {
    id: "company",
    kind: "text",
    reviewLabel: "Company",
    title: "What's your company called?",
    titleWithName: (n) => `Who do you build for, ${n}?`,
    desc: "Optional.",
    descWithName: () => "Optional — your company or brand name.",
    placeholder: "Acme Inc.",
    autoComplete: "organization",
    optional: true,
  },
  {
    id: "website",
    kind: "text",
    reviewLabel: "Website",
    title: "Got a website?",
    desc: "Optional — link your current site.",
    placeholder: "acme.com",
    autoComplete: "url",
    optional: true,
  },
  {
    id: "projectType",
    kind: "choice",
    reviewLabel: "Project type",
    title: "What type of project is this?",
    titleWithName: (n) => `So ${n}, what are we building?`,
    desc: "Pick the closest match.",
    options: PROJECT_TYPE_OPTIONS,
  },
  {
    id: "serviceTypes",
    kind: "multi",
    reviewLabel: "Services",
    title: "Which services do you need?",
    desc: "Select all that apply.",
    options: services.map((s) => s.title),
  },
  {
    id: "budget",
    kind: "choice",
    reviewLabel: "Budget",
    title: "What's your budget range?",
    titleWithName: (n) => `${n}, what budget are you working with?`,
    desc: "Ballpark is fine — this helps us scope things right.",
    options: BUDGET_OPTIONS,
  },
  {
    id: "timeline",
    kind: "choice",
    reviewLabel: "Timeline",
    title: "What's your timeline?",
    desc: "When would you like to get started?",
    options: TIMELINE_OPTIONS,
  },
  {
    id: "projectGoals",
    kind: "multi",
    reviewLabel: "Main goal",
    title: "What's the main goal?",
    desc: "Select all that apply.",
    options: PROJECT_GOAL_OPTIONS,
  },
  {
    id: "projectDetails",
    kind: "textarea",
    reviewLabel: "Project details",
    title: "Tell us about the project.",
    titleWithName: (n) => `Last one, ${n} — tell us about the project.`,
    desc: "The more detail, the better we can scope it.",
    placeholder: "We're building...",
  },
];

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.35, ease: EASE } }),
};

/**
 * The one validation authority for a single answer: runs that field's own
 * slice of `inquirySchema`, so nothing can reach the review screen that the
 * final submit would then reject (a one-letter website used to sail through
 * and only blow up on Send). Returns the message to show, or null if the
 * answer is acceptable.
 */
function stepIssue(step: WizardStep, values: InquiryValues): string | null {
  // Optional and untouched is a valid state — that's what Skip means.
  if (step.optional && isStepEmpty(step, values)) return null;

  const result = inquiryFieldSchemas[step.id].safeParse(values[step.id]);
  if (!result.success) return result.error.issues[0]?.message ?? "Check this answer.";

  // Cross-field rule, so it can't live on the field schema itself.
  if (
    step.id === "projectGoals" &&
    Array.isArray(values.projectGoals) &&
    values.projectGoals.includes("Other") &&
    !values.otherGoalDetails?.trim()
  ) {
    return "Tell us a bit more about your goal.";
  }
  return null;
}

/** Whether this step's field has been left blank — drives the
 * Continue → Skip swap on optional steps. */
function isStepEmpty(step: WizardStep, values: InquiryValues): boolean {
  const v = values[step.id];
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().length === 0;
  return v == null;
}

function displayValue(step: WizardStep, values: InquiryValues): string {
  const v = values[step.id];
  if (Array.isArray(v)) {
    if (!v.length) return "—";
    if (step.id === "projectGoals" && v.includes("Other") && values.otherGoalDetails) {
      return [...v.filter((g) => g !== "Other"), `Other: ${values.otherGoalDetails}`].join(", ");
    }
    return v.join(", ");
  }
  if (typeof v === "string") return v.trim() ? v : "—";
  return "—";
}

/** Ambient decoration only — two slow-drifting blurred blobs plus a
 * handful of near-invisible floating dots, so the panel never reads as
 * empty behind the wizard copy. Frozen (no animate loop) under reduced
 * motion since it's purely cosmetic. */
function WizardAmbience() {
  const reduced = useReducedMotion();
  const particles = Array.from({ length: 8 }, (_, i) => ({
    left: `${8 + ((i * 37) % 90)}%`,
    top: `${10 + ((i * 53) % 80)}%`,
    delay: i * 0.6,
    duration: 10 + (i % 4) * 3,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute right-0 top-0 h-72 w-72 -translate-y-1/3 translate-x-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, rgba(37,99,235,0) 55%)" }}
        animate={reduced ? undefined : { x: ["33%", "38%", "33%"], y: ["-33%", "-28%", "-33%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(219,39,119,0.06) 0%, rgba(219,39,119,0) 55%)" }}
        animate={reduced ? undefined : { x: ["-33%", "-38%", "-33%"], y: ["33%", "28%", "33%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {!reduced &&
        particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-ink/40"
            style={{ left: p.left, top: p.top, opacity: 0.05 }}
            animate={{ y: [0, -14, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
    </div>
  );
}

function InquiryPanel() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  /** Drafts are read in an effect, not during render — localStorage doesn't
   * exist on the server, and prefilling during render would hydrate-mismatch. */
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  /** Which answer is being edited in place on the review screen, if any. */
  const [editingId, setEditingId] = useState<WizardStepId | null>(null);
  /** The value that field held when its editor opened — Escape's undo. */
  const revertRef = useRef<{ id: WizardStepId; value: unknown } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { serviceTypes: [], projectGoals: [] },
  });
  const values = watch();

  // Restore a half-finished inquiry on mount: answers *and* the step the
  // visitor was on, so a reload lands them back on the same question.
  useEffect(() => {
    const draft = readDraft<InquiryValues>(INQUIRY_DRAFT_KEY);
    if (draft && !isDraftEmpty(draft.values as Record<string, unknown>)) {
      reset({
        serviceTypes: [],
        projectGoals: [],
        ...draft.values,
        // Never restore the honeypot — a stored value would look like a bot.
        hp: "",
      } as InquiryValues);
      if (typeof draft.step === "number") {
        setStep(Math.min(Math.max(draft.step, 0), WIZARD_STEPS.length));
      }
      setRestored(true);
    }
    setDraftLoaded(true);
  }, [reset]);

  // Persist on every change, debounced so a burst of keystrokes is one write.
  // Runs only after the restore pass, otherwise the empty initial form would
  // overwrite the draft we're about to read.
  useEffect(() => {
    if (!draftLoaded || status === "success") return;
    // hp is dropped, never persisted — a stored honeypot value would come
    // back looking like a bot filled the form.
    const persisted: Partial<InquiryValues> = { ...values, hp: undefined };
    if (isDraftEmpty(persisted as Record<string, unknown>)) return;
    const timer = setTimeout(() => saveDraft(INQUIRY_DRAFT_KEY, persisted, step), 400);
    return () => clearTimeout(timer);
  }, [values, step, draftLoaded, status]);

  const startOver = () => {
    clearDraft(INQUIRY_DRAFT_KEY);
    reset({ serviceTypes: [], projectGoals: [] });
    setRestored(false);
    setEditingId(null);
    setDirection(-1);
    setStep(0);
  };

  const isReview = step === WIZARD_STEPS.length;
  const current = WIZARD_STEPS[Math.min(step, WIZARD_STEPS.length - 1)];
  /** Live schema verdict for the visible question. No step advances while
   * this is non-null, so the review screen only ever shows sendable data. */
  const currentIssue = stepIssue(current, values);
  const canContinue = !currentIssue;

  const displayName = displayNameOf(values.fullName);
  const title = displayName ? (current.titleWithName?.(displayName) ?? current.title) : current.title;
  const desc = displayName ? (current.descWithName?.(displayName) ?? current.desc) : current.desc;

  /** An optional step that's still empty — the primary action is "move
   * on", not "submit an answer", so the button says Skip and drops the
   * gradient. Typing anything flips it back to Continue. */
  const isSkip = !!current.optional && isStepEmpty(current, values);

  /** Only nag once there's something to nag about: an empty required field
   * already reads as unfinished via the disabled Continue, but a filled-in
   * value that won't validate has to say why, right where it was typed. */
  const visibleIssue = currentIssue && !isStepEmpty(current, values) ? currentIssue : undefined;

  /** Rewrites the answer to the form it will actually be sent in, so the
   * review screen shows what we got rather than what was typed. Only the
   * website needs it today (bare domain → https://bare-domain). */
  const normalizeAnswer = (id: WizardStepId) => {
    if (id !== "website") return;
    const typed = getValues("website");
    if (!typed) return;
    const normalized = normalizeWebsite(typed);
    if (normalized !== typed) setValue("website", normalized, { shouldValidate: false });
  };

  const goNext = () => {
    if (!canContinue) return;
    normalizeAnswer(current.id);
    setDirection(1);
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };
  /** Opens the inline editor on the review screen. The previous answer is
   * stashed so Escape can put it back — a mis-click into a field shouldn't
   * be able to wipe an answer with no way out. */
  const openEditor = (id: WizardStepId) => {
    revertRef.current = { id, value: getValues(id) };
    setEditingId(id);
  };
  const closeEditor = (commit: boolean) => {
    const revert = revertRef.current;
    if (commit && revert) {
      const editedStep = WIZARD_STEPS.find((s) => s.id === revert.id);
      // Same gate as the wizard: an invalid answer can't be accepted here
      // either, so the editor stays open with its message rather than
      // returning a summary that Send would reject.
      if (editedStep && stepIssue(editedStep, getValues())) {
        void trigger(revert.id);
        return;
      }
    }
    if (!commit && revert) {
      setValue(revert.id, revert.value as never, { shouldValidate: false });
    }
    if (commit && revert) normalizeAnswer(revert.id);
    revertRef.current = null;
    setEditingId(null);
    if (commit && revert) void trigger(revert.id);
  };
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      closeEditor(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeEditor(false);
    }
  };
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };
  const toggleMulti = (id: "serviceTypes" | "projectGoals", option: string) => {
    const list = (getValues(id) as string[] | undefined) ?? [];
    const next = list.includes(option) ? list.filter((x) => x !== option) : [...list, option];
    setValue(id, next, { shouldValidate: true });
  };

  const onSubmit = async (values: InquiryValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      // Sent — the draft has served its purpose, and leaving it behind would
      // resurrect the whole inquiry on the visitor's next visit.
      clearDraft(INQUIRY_DRAFT_KEY);
      setRestored(false);
      setEditingId(null);
      reset();
    } catch {
      setStatus("error");
    }
  };

  /** Submit is only reachable from the review screen, so a validation
   * failure opens that answer's inline editor instead of throwing the
   * visitor back into the wizard — the offending cell is already on screen,
   * flagged in magenta. */
  const onInvalid = (formErrors: FieldErrors<InquiryValues>) => {
    const firstKey = Object.keys(formErrors)[0];
    const failing = WIZARD_STEPS.find(
      (s) => s.id === firstKey || (firstKey === "otherGoalDetails" && s.id === "projectGoals"),
    );
    setStep(WIZARD_STEPS.length);
    if (failing) openEditor(failing.id);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      // No overflow-hidden here: the nav buttons sit flush with this
      // box's edges and hover-lift scales them past it, so clipping at
      // this level sliced their outline mid-hover. Nothing needs the
      // form to clip — WizardAmbience already clips its own blobs, and
      // the step slide animation is clipped by the flex-1 wrapper.
      className="relative flex h-full min-h-[26rem] flex-col"
    >
      <WizardAmbience />
      {/* Honeypot — hidden from sighted and AT users, real visitors never fill it. */}
      <input
        {...register("hp")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />

      {status === "success" ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Inquiry sent.</h2>
          <p className="max-w-xs text-sm text-ink-soft">
            We&rsquo;ll reply within 24 hours with next steps and a proposal.
          </p>
        </div>
      ) : !isReview ? (
        <>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
              Step {step + 1} of {WIZARD_STEPS.length}
            </span>
            {/* Restoring silently would read as a bug ("why is my name
               already here?"), so say it happened and offer the escape hatch. */}
            {restored && (
              <span className="flex items-center gap-2 text-[0.7rem] font-semibold text-ink-soft">
                <span className="text-blue">Draft restored</span>
                <button
                  type="button"
                  onClick={startOver}
                  className="underline decoration-ink-soft/40 underline-offset-2 transition-colors hover:text-ink"
                >
                  Start over
                </button>
              </span>
            )}
          </div>

          <div className="relative z-10 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex h-full flex-col justify-center gap-8 py-8 sm:gap-10 sm:py-10"
              >
                <div>
                  <h2 className="text-[1.9rem] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-[2.35rem]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">{desc}</p>
                </div>

                {(current.kind === "text" || current.kind === "email" || current.kind === "tel") && (
                  <FloatingInput
                    registration={register(current.id)}
                    type={current.kind}
                    placeholder={current.placeholder ?? ""}
                    error={visibleIssue ?? (errors[current.id]?.message as string | undefined)}
                    autoFocus
                    autoComplete={current.autoComplete}
                    onKeyDown={handleEnter}
                  />
                )}

                {current.kind === "textarea" && (
                  <FloatingTextarea
                    registration={register(current.id)}
                    placeholder={current.placeholder ?? ""}
                    error={visibleIssue ?? (errors[current.id]?.message as string | undefined)}
                    autoFocus
                  />
                )}

                {current.kind === "choice" && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {current.options?.map((opt) => (
                      <OptionPill
                        key={opt}
                        label={opt}
                        selected={values[current.id] === opt}
                        onClick={() => setValue(current.id, opt, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                )}

                {current.kind === "multi" && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {current.options?.map((opt) => (
                        <OptionPill
                          key={opt}
                          label={opt}
                          selected={
                            Array.isArray(values[current.id]) && (values[current.id] as string[]).includes(opt)
                          }
                          onClick={() => toggleMulti(current.id as "serviceTypes" | "projectGoals", opt)}
                        />
                      ))}
                    </div>
                    {current.id === "projectGoals" &&
                      Array.isArray(values.projectGoals) &&
                      values.projectGoals.includes("Other") && (
                        <FloatingInput
                          registration={register("otherGoalDetails")}
                          type="text"
                          placeholder="Tell us more about your goal"
                          error={errors.otherGoalDetails?.message}
                          onKeyDown={handleEnter}
                        />
                      )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Previous + Continue sit together as one control pair, right
             aligned — the pagination dots are gone, so the step counter
             above is the only progress cue. */}
          <div className="relative z-10 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              // Same min-w and the same hover-lift/press cue as Continue
              // so the pair feels like one control; the difference is
              // purely tonal — outline + faint fill instead of gradient,
              // muted label — so Previous stays secondary without
              // behaving differently under the cursor.
              className={cn(
                "btn-outline group min-w-[10.5rem]",
                step === 0 && "invisible",
              )}
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className={cn(
                // min-w + justify-center: "Skip" is a much shorter word
                // than "Continue", so without a floor the button would
                // visibly shrink/grow as an optional field is typed into
                // and cleared. Floor is sized to the wider label.
                // Skip is the quiet exit, so it takes the secondary pill;
                // Continue is the step's real action and takes the same
                // primary pill every conversion action on the site uses.
                // Exclusive, never stacked — .btn-outline's `background`
                // shorthand would wipe .btn-brand's gradient.
                isSkip || !canContinue ? "btn-outline" : "btn-brand",
                "group min-w-[10.5rem]",
                !canContinue && "cursor-not-allowed",
              )}
            >
              {isSkip ? "Skip" : "Continue"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
          <div className="shrink-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]">
              Everything looks good.
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">Double-check your answers, then send it our way.</p>
          </div>

          {/* Two/three-column grid of short labels, not a stack of full
             question sentences — all eleven answers have to be checkable in
             one look. Scroll stays as a fallback for very short viewports
             only; on a normal screen nothing is hidden below the fold. */}
          <div className="my-4 max-h-full min-h-0 overflow-y-auto rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {WIZARD_STEPS.map((s) => {
                const isEditing = editingId === s.id;
                // Live schema verdict, not just post-submit resolver errors —
                // a restored draft from an older build could hold a value the
                // rules now reject, and it should flag before Send.
                const fieldError = stepIssue(s, values) ?? (errors[s.id]?.message as string | undefined);

                // Editing happens right here in the summary — sending someone
                // back through the wizard to change one answer means they have
                // to walk forward through every later step again.
                if (isEditing) {
                  return (
                    <div
                      key={s.id}
                      // Editors always take the full row: choice/multi pills
                      // need the width, and a text field in a third of the
                      // row is uncomfortably narrow to correct a typo in.
                      className="col-span-full rounded-xl border border-blue/40 bg-white/[0.09] px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">
                          {s.reviewLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => closeEditor(true)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue/20 px-2.5 py-1 text-[0.65rem] font-bold text-ink transition-colors hover:bg-blue/35"
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                          Done
                        </button>
                      </div>

                      <div className="mt-2">
                        {(s.kind === "text" || s.kind === "email" || s.kind === "tel") && (
                          <input
                            {...register(s.id)}
                            type={s.kind}
                            autoFocus
                            autoComplete={s.autoComplete ?? "on"}
                            placeholder={s.placeholder}
                            onKeyDown={handleEditorKeyDown}
                            className="focus-no-outline w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/40 focus:border-blue"
                          />
                        )}

                        {s.kind === "textarea" && (
                          <textarea
                            {...register(s.id)}
                            rows={3}
                            autoFocus
                            placeholder={s.placeholder}
                            className="focus-no-outline w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium leading-relaxed text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/40 focus:border-blue"
                          />
                        )}

                        {s.kind === "choice" && (
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                            {s.options?.map((opt) => (
                              <ReviewPill
                                key={opt}
                                label={opt}
                                selected={values[s.id] === opt}
                                onClick={() => {
                                  setValue(s.id, opt, { shouldValidate: true });
                                  // Single-answer question — picking *is* the
                                  // whole edit, so no separate confirm step.
                                  closeEditor(true);
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {s.kind === "multi" && (
                          <div className="flex flex-col gap-1.5">
                            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                              {s.options?.map((opt) => (
                                <ReviewPill
                                  key={opt}
                                  label={opt}
                                  selected={
                                    Array.isArray(values[s.id]) && (values[s.id] as string[]).includes(opt)
                                  }
                                  onClick={() => toggleMulti(s.id as "serviceTypes" | "projectGoals", opt)}
                                />
                              ))}
                            </div>
                            {s.id === "projectGoals" &&
                              Array.isArray(values.projectGoals) &&
                              values.projectGoals.includes("Other") && (
                                <input
                                  {...register("otherGoalDetails")}
                                  type="text"
                                  placeholder="Tell us more about your goal"
                                  className="focus-no-outline w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/40 focus:border-blue"
                                />
                              )}
                          </div>
                        )}
                      </div>

                      {fieldError && (
                        <span className="mt-1.5 block text-[0.7rem] font-semibold text-magenta">{fieldError}</span>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openEditor(s.id)}
                    // The whole cell is the edit affordance, so the row needs
                    // no persistent "Edit" link eating horizontal space — the
                    // pencil fades in on hover/focus instead.
                    className={cn(
                      "group/cell relative flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07]",
                      // Free-text answer is the long one — give it the full row.
                      s.kind === "textarea" && "sm:col-span-2 lg:col-span-3",
                      fieldError && "ring-1 ring-inset ring-magenta/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                      {s.reviewLabel}
                      <Pencil className="h-2.5 w-2.5 shrink-0 text-blue opacity-0 transition-opacity group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100" />
                    </span>
                    <span
                      className={cn(
                        "text-[0.82rem] font-semibold leading-snug",
                        fieldError ? "text-magenta" : "text-ink",
                        // Multi-selects and the details textarea can run long;
                        // two clamped lines keep every cell the same height.
                        s.kind === "textarea" || s.kind === "multi" ? "line-clamp-2" : "truncate",
                      )}
                    >
                      {fieldError ?? displayValue(s, values)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0">
            <SubmitRow
              isSubmitting={isSubmitting}
              status={status}
              label="Send Inquiry"
              successMsg="Inquiry sent — we'll reply within 24 hours."
              onStartOver={startOver}
            />
          </div>
        </div>
      )}
    </form>
  );
}

type BookingStepId =
  | "fullName"
  | "email"
  | "whatsapp"
  | "company"
  | "website"
  | "role"
  | "auditFocus"
  | "challenge"
  | "budget"
  | "timeline"
  | "schedule"
  | "notes";

interface BookingStep {
  id: BookingStepId;
  kind: "text" | "email" | "tel" | "textarea" | "choice" | "multi" | "schedule";
  /** The schema fields this question owns. Everything is one field except
   * the schedule step, which collects date + time + zone in one screen. */
  fields: (keyof BookingValues)[];
  title: string;
  titleWithName?: (name: string) => string;
  desc: string;
  placeholder?: string;
  reviewLabel: string;
  autoComplete?: string;
  optional?: boolean;
  options?: readonly string[];
}

/** The audit call asks the same qualifying questions as the project wizard
 * before it ever gets to a calendar — a slot is worth booking only once we
 * know who's on the other end and what we'd be auditing. */
const BOOKING_STEPS: BookingStep[] = [
  {
    id: "fullName",
    kind: "text",
    fields: ["fullName"],
    reviewLabel: "Name",
    title: "Let's start with your name.",
    desc: "So we know who we're meeting.",
    placeholder: "John Smith",
    autoComplete: "name",
  },
  {
    id: "email",
    kind: "email",
    fields: ["email"],
    reviewLabel: "Email",
    title: "What's your work email?",
    titleWithName: (n) => `Nice to meet you, ${n}. What's your work email?`,
    desc: "Your invite and audit notes land here.",
    placeholder: "john@company.com",
    autoComplete: "email",
  },
  {
    id: "whatsapp",
    kind: "tel",
    fields: ["whatsapp"],
    reviewLabel: "WhatsApp",
    title: "What's your WhatsApp number?",
    desc: "Optional — handy if the call link ever bounces.",
    placeholder: "+1 555 000 1234",
    autoComplete: "tel",
    optional: true,
  },
  {
    id: "company",
    kind: "text",
    fields: ["company"],
    reviewLabel: "Company",
    title: "What's your company called?",
    titleWithName: (n) => `Who do you build for, ${n}?`,
    desc: "Optional — your company or brand name.",
    placeholder: "Acme Inc.",
    autoComplete: "organization",
    optional: true,
  },
  {
    id: "website",
    kind: "text",
    fields: ["website"],
    reviewLabel: "Website",
    title: "Which site should we audit?",
    desc: "Optional — but it's what we review before the call.",
    placeholder: "acme.com",
    autoComplete: "url",
    optional: true,
  },
  {
    id: "role",
    kind: "choice",
    fields: ["role"],
    reviewLabel: "Your role",
    title: "What's your role?",
    desc: "Helps us pitch the call at the right level.",
    options: ROLE_OPTIONS,
  },
  {
    id: "auditFocus",
    kind: "multi",
    fields: ["auditFocus"],
    reviewLabel: "Audit focus",
    title: "What should we look at?",
    titleWithName: (n) => `So ${n}, what should we look at?`,
    desc: "Select all that apply.",
    options: AUDIT_FOCUS_OPTIONS,
  },
  {
    id: "challenge",
    kind: "choice",
    fields: ["challenge"],
    reviewLabel: "Biggest challenge",
    title: "What's holding growth back right now?",
    desc: "Pick the closest match.",
    options: CHALLENGE_OPTIONS,
  },
  {
    id: "budget",
    kind: "choice",
    fields: ["budget"],
    reviewLabel: "Budget",
    title: "What budget are you working with?",
    titleWithName: (n) => `${n}, what budget are you working with?`,
    desc: "Ballpark is fine — the audit itself stays free.",
    options: BUDGET_OPTIONS,
  },
  {
    id: "timeline",
    kind: "choice",
    fields: ["timeline"],
    reviewLabel: "Timeline",
    title: "When would you want to start?",
    desc: "If we find something on the call, how soon could you act?",
    options: TIMELINE_OPTIONS,
  },
  {
    id: "schedule",
    kind: "schedule",
    fields: ["slotUtc", "preferredDate", "preferredTime", "timeZone"],
    reviewLabel: "Your slot",
    title: "Pick your slot.",
    titleWithName: (n) => `Nearly there, ${n} — pick your slot.`,
    // Kept to one line at the card's width — the zone picker sits inside the
    // scheduler now, so this line no longer has to explain it.
    desc: `30-min call · ${AVAILABILITY.callsCompact}`,
  },
  {
    id: "notes",
    kind: "textarea",
    fields: ["notes"],
    reviewLabel: "Notes",
    title: "Anything we should know first?",
    desc: "Optional — context, links, or a specific question.",
    placeholder: "We just relaunched and traffic dropped…",
    optional: true,
  },
];

/** Same contract as `stepIssue` for the inquiry wizard: the message to show
 * for the visible booking question, or null when it's answerable. */
function bookingStepIssue(step: BookingStep, values: BookingValues): string | null {
  if (step.optional && isBookingStepEmpty(step, values)) return null;
  for (const field of step.fields) {
    const schema = bookingFieldSchemas[field as keyof typeof bookingFieldSchemas];
    if (!schema) continue;
    const result = schema.safeParse(values[field]);
    if (!result.success) return result.error.issues[0]?.message ?? "Check this answer.";
  }
  return null;
}

function isBookingStepEmpty(step: BookingStep, values: BookingValues): boolean {
  return step.fields.every((field) => {
    const v = values[field];
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "string") return v.trim().length === 0;
    return v == null;
  });
}

function bookingDisplayValue(step: BookingStep, values: BookingValues): string {
  if (step.id === "schedule") {
    if (!values.preferredDate || !values.preferredTime) return "—";
    return `${formatDateKeyLong(values.preferredDate)} · ${formatTimeKey(values.preferredTime)}`;
  }
  const v = values[step.fields[0]];
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "string") return v.trim() ? v : "—";
  return "—";
}

function BookingPanel() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  /** Set when a step was opened from the review grid — Continue then goes
   * straight back to the summary instead of walking the rest of the wizard
   * again. */
  const [returnToReview, setReturnToReview] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { auditFocus: [] },
  });
  const values = watch();

  // Same draft behaviour as the inquiry wizard — a half-filled call request
  // survives a reload, question included.
  useEffect(() => {
    const draft = readDraft<BookingValues>(BOOKING_DRAFT_KEY);
    if (draft && !isDraftEmpty(draft.values as Record<string, unknown>)) {
      const restoredValues = { auditFocus: [], ...draft.values, hp: "" } as BookingValues;
      // A slot that has since passed can't be booked. The instant is the one
      // field worth testing — the date/time strings are only its local
      // rendering, so they go with it.
      const saved = restoredValues.slotUtc ? Date.parse(restoredValues.slotUtc) : NaN;
      if (Number.isNaN(saved) || saved < Date.now()) {
        restoredValues.slotUtc = "";
        restoredValues.preferredDate = "";
        restoredValues.preferredTime = "";
      }
      reset(restoredValues);
      if (typeof draft.step === "number") {
        setStep(Math.min(Math.max(draft.step, 0), BOOKING_STEPS.length));
      }
      setRestored(true);
    }
    setDraftLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!draftLoaded || status === "success") return;
    const persisted: Partial<BookingValues> = { ...values, hp: undefined };
    // timeZone is auto-detected, not typed — on its own it isn't a draft.
    const typed = { ...persisted, timeZone: undefined };
    if (isDraftEmpty(typed as Record<string, unknown>)) return;
    const timer = setTimeout(() => saveDraft(BOOKING_DRAFT_KEY, persisted, step), 400);
    return () => clearTimeout(timer);
  }, [values, step, draftLoaded, status]);

  useEffect(() => {
    if (!draftLoaded) return;
    // Only as a default — a restored draft may hold a zone the visitor picked
    // by hand, and auto-detect must not stomp on that.
    if (getValues("timeZone")) return;
    setValue("timeZone", detectTimeZone(), { shouldValidate: false });
  }, [setValue, getValues, draftLoaded]);

  const isReview = step === BOOKING_STEPS.length;
  const current = BOOKING_STEPS[Math.min(step, BOOKING_STEPS.length - 1)];
  const currentIssue = bookingStepIssue(current, values);
  const canContinue = !currentIssue;
  const isSkip = !!current.optional && isBookingStepEmpty(current, values);
  const visibleIssue = currentIssue && !isBookingStepEmpty(current, values) ? currentIssue : undefined;

  const displayName = displayNameOf(values.fullName);
  const title = displayName ? (current.titleWithName?.(displayName) ?? current.title) : current.title;

  const startOver = () => {
    clearDraft(BOOKING_DRAFT_KEY);
    reset({ auditFocus: [] });
    setRestored(false);
    setReturnToReview(false);
    setDirection(-1);
    setStep(0);
  };

  const goNext = () => {
    if (!canContinue) return;
    if (current.id === "website") {
      const typed = getValues("website");
      if (typed) {
        const normalized = normalizeWebsite(typed);
        if (normalized !== typed) setValue("website", normalized, { shouldValidate: false });
      }
    }
    setDirection(1);
    if (returnToReview) {
      setReturnToReview(false);
      setStep(BOOKING_STEPS.length);
      return;
    }
    setStep((s) => Math.min(s + 1, BOOKING_STEPS.length));
  };
  const goBack = () => {
    setDirection(-1);
    if (returnToReview) {
      setReturnToReview(false);
      setStep(BOOKING_STEPS.length);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };
  /** Review-screen edit: reopen that question, then come straight back. */
  const editStep = (id: BookingStepId) => {
    const index = BOOKING_STEPS.findIndex((s) => s.id === id);
    if (index < 0) return;
    setReturnToReview(true);
    setDirection(-1);
    setStep(index);
  };
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };
  const toggleFocus = (option: string) => {
    const list = (getValues("auditFocus") as string[] | undefined) ?? [];
    setValue("auditFocus", list.includes(option) ? list.filter((x) => x !== option) : [...list, option], {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: BookingValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      clearDraft(BOOKING_DRAFT_KEY);
      setRestored(false);
      reset({ auditFocus: [] });
    } catch {
      setStatus("error");
    }
  };

  /** Send is only reachable from the review screen, so a rejected field
   * reopens its question rather than dumping the visitor at step one. */
  const onInvalid = (formErrors: FieldErrors<BookingValues>) => {
    const firstKey = Object.keys(formErrors)[0];
    const failing = BOOKING_STEPS.find((s) => (s.fields as string[]).includes(firstKey));
    if (failing) editStep(failing.id);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="relative flex h-full min-h-[26rem] flex-col"
    >
      <WizardAmbience />
      {/* Honeypot — hidden from sighted and AT users. */}
      <input
        {...register("hp")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />

      {status === "success" ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Call requested.</h2>
          <p className="max-w-xs text-sm text-ink-soft">
            We&rsquo;ll confirm your slot and send a Google Meet link within 24 hours.
          </p>
        </div>
      ) : !isReview ? (
        <>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
              Step {step + 1} of {BOOKING_STEPS.length}
            </span>
            {restored && (
              <span className="flex items-center gap-2 text-[0.7rem] font-semibold text-ink-soft">
                <span className="text-blue">Draft restored</span>
                <button
                  type="button"
                  onClick={startOver}
                  className="underline decoration-ink-soft/40 underline-offset-2 transition-colors hover:text-ink"
                >
                  Start over
                </button>
              </span>
            )}
          </div>

          {/* overflow-x-hidden is load-bearing, not decoration: `overflow-y:
             auto` alone makes the x axis compute to `auto` as well, and the
             step entrance slides in from x:+28 — so a horizontal scrollbar
             flashed across the panel on every question change (and on first
             paint, which is where it was most visible). */}
          <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={cn(
                  "flex flex-col gap-6 py-6",
                  // The schedule screen carries three controls at once: it
                  // keeps a tighter rhythm than the one-field questions, and
                  // grows downward from the top (centering a screen taller
                  // than the pane pushes its headline up under the step
                  // counter) while the parent scrolls it.
                  current.kind === "schedule"
                    ? "justify-start"
                    : "h-full justify-center sm:gap-10 sm:py-10",
                )}
              >
                <div>
                  <h2
                    className={cn(
                      "font-extrabold leading-[1.12] tracking-tight text-ink",
                      current.kind === "schedule"
                        ? "text-[1.5rem] sm:text-[1.8rem]"
                        : "text-[1.9rem] sm:text-[2.35rem]",
                    )}
                  >
                    {title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
                    {current.desc}
                  </p>
                </div>

                {(current.kind === "text" || current.kind === "email" || current.kind === "tel") && (
                  <FloatingInput
                    registration={register(current.fields[0] as "fullName")}
                    type={current.kind}
                    placeholder={current.placeholder ?? ""}
                    error={visibleIssue ?? (errors[current.fields[0]]?.message as string | undefined)}
                    autoFocus
                    autoComplete={current.autoComplete}
                    onKeyDown={handleEnter}
                  />
                )}

                {current.kind === "textarea" && (
                  <FloatingTextarea
                    registration={register(current.fields[0] as "notes")}
                    placeholder={current.placeholder ?? ""}
                    error={visibleIssue ?? (errors[current.fields[0]]?.message as string | undefined)}
                    autoFocus
                  />
                )}

                {current.kind === "choice" && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {current.options?.map((opt) => (
                      <OptionPill
                        key={opt}
                        label={opt}
                        selected={values[current.fields[0]] === opt}
                        onClick={() => setValue(current.fields[0] as "role", opt, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                )}

                {current.kind === "multi" && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {current.options?.map((opt) => (
                      <OptionPill
                        key={opt}
                        label={opt}
                        selected={Array.isArray(values.auditFocus) && values.auditFocus.includes(opt)}
                        onClick={() => toggleFocus(opt)}
                      />
                    ))}
                  </div>
                )}

                {current.kind === "schedule" && (
                  <SchedulePicker
                    timeZone={values.timeZone || detectTimeZone()}
                    onTimeZoneChange={(tz) => {
                      setValue("timeZone", tz, { shouldValidate: true });
                      // Same instant, new zone — so what the visitor "sees"
                      // has to be restated, or the review screen would quote
                      // the slot's old wall-clock reading against the new
                      // zone name.
                      const iso = getValues("slotUtc");
                      if (!iso) return;
                      const instant = new Date(iso);
                      if (Number.isNaN(instant.getTime())) return;
                      setValue("preferredDate", zonedDateKey(instant, tz), { shouldValidate: true });
                      setValue("preferredTime", zonedTimeKey(instant, tz), { shouldValidate: true });
                    }}
                    slotUtc={values.slotUtc ?? ""}
                    // The instant is what's booked; the date/time strings are
                    // the visitor's own reading of it, kept alongside so the
                    // review screen and the emails can quote what they saw.
                    onSelect={({ slotUtc, dateKey, timeKey }) => {
                      setValue("slotUtc", slotUtc, { shouldValidate: true });
                      setValue("preferredDate", dateKey, { shouldValidate: true });
                      setValue("preferredTime", timeKey, { shouldValidate: true });
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 && !returnToReview}
              className={cn(
                "btn-outline group min-w-[10.5rem]",
                step === 0 && !returnToReview && "invisible",
              )}
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              {returnToReview ? "Back to review" : "Previous"}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className={cn(
                // Skip is the quiet exit, so it takes the secondary pill;
                // Continue is the step's real action and takes the same
                // primary pill every conversion action on the site uses.
                // Exclusive, never stacked — .btn-outline's `background`
                // shorthand would wipe .btn-brand's gradient.
                isSkip || !canContinue ? "btn-outline" : "btn-brand",
                "group min-w-[10.5rem]",
                !canContinue && "cursor-not-allowed",
              )}
            >
              {returnToReview ? "Save" : isSkip ? "Skip" : "Continue"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
          <div className="shrink-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]">
              Here&rsquo;s your call.
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Check the details, then send it — we&rsquo;ll confirm the slot by email.
            </p>
          </div>

          {/* The slot gets its own row above the answer grid: it's the one
             thing on this screen the visitor is really confirming. */}
          <div className="mt-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">
                30-min audit call
              </p>
              <p className="truncate text-[0.95rem] font-extrabold tracking-tight text-ink">
                {values.preferredDate ? formatDateKeyLong(values.preferredDate) : "—"}
                <span className="mx-1.5 text-ink-soft">·</span>
                {values.preferredTime ? formatTimeKey(values.preferredTime) : "—"}
              </p>
              <p className="truncate text-[0.7rem] font-semibold text-ink-soft">
                {values.timeZone
                  ? `${values.timeZone.replace(/_/g, " ")} (${zoneOffsetLabel(values.timeZone)})`
                  : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => editStep("schedule")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue/25 px-3 py-1.5 text-[0.7rem] font-bold text-ink transition-colors hover:bg-blue/40"
            >
              <Pencil className="h-3 w-3" />
              Change
            </button>
          </div>

          {/* Answers are edited by reopening their own question (the schedule
             step needs its full screen, and once one cell works that way, all
             of them should) — hence no inline editors here. */}
          <div className="my-3 max-h-full min-h-0 overflow-y-auto rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {BOOKING_STEPS.filter((s) => s.id !== "schedule").map((s) => {
                const fieldError =
                  bookingStepIssue(s, values) ?? (errors[s.fields[0]]?.message as string | undefined);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => editStep(s.id)}
                    className={cn(
                      "group/cell relative flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07]",
                      s.kind === "textarea" && "sm:col-span-2 lg:col-span-3",
                      fieldError && "ring-1 ring-inset ring-magenta/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                      {s.reviewLabel}
                      <Pencil className="h-2.5 w-2.5 shrink-0 text-blue opacity-0 transition-opacity group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100" />
                    </span>
                    <span
                      className={cn(
                        "text-[0.82rem] font-semibold leading-snug",
                        fieldError ? "text-magenta" : "text-ink",
                        s.kind === "textarea" || s.kind === "multi" ? "line-clamp-2" : "truncate",
                      )}
                    >
                      {fieldError ?? bookingDisplayValue(s, values)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0">
            <p className="mb-2 text-center text-[0.7rem] font-semibold text-ink-soft">
              A Google Meet link is emailed once we confirm your slot.
            </p>
            <SubmitRow
              isSubmitting={isSubmitting}
              status={status}
              label="Request Call"
              successMsg="Request sent — we'll confirm your slot shortly."
              onStartOver={startOver}
            />
          </div>
        </div>
      )}
    </form>
  );
}

function QuickChatPanel({ onBookCall }: { onBookCall: () => void }) {
  /** Which channel's value was last copied — cleared on a timer so both cards
   * share one "Copied" state without fighting each other. */
  const [copied, setCopied] = useState<"whatsapp" | "email" | null>(null);
  const reduced = useReducedMotion();
  const waRaw = formatPhone(footer.contact.whatsapp);
  const waNumber = footer.contact.whatsapp.replace(/[^\d]/g, "");
  const email = "info@matterpixel.com";

  const copy = async (key: "whatsapp" | "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      // Clipboard API unavailable — the value is still selectable as text.
    }
  };

  const rise = (i: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATIONS.quick, ease: EASE, delay: i * 0.07 },
  });

  return (
    <div className="flex h-full w-full flex-col gap-5">
      <motion.div {...rise(0)} className="flex flex-col gap-1.5">
        <h3 className="font-avenir text-2xl font-extrabold leading-tight text-ink sm:text-[1.75rem]">
          How would you like to connect?
        </h3>
        <p className="text-sm text-ink-soft">Choose your preferred way. We&rsquo;re here and ready to help.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChannelCard
          index={1}
          accent="#25D366"
          icon={<SiWhatsapp className="h-6 w-6 text-white" aria-hidden="true" />}
          label="WhatsApp"
          blurb="Fastest way to get a reply"
          badge="Fast reply"
          actionLabel="Open WhatsApp"
          href={`https://wa.me/${waNumber}`}
          value={waRaw}
          copied={copied === "whatsapp"}
          onCopy={() => copy("whatsapp", footer.contact.whatsapp)}
          copyAria="Copy WhatsApp number"
        />
        <ChannelCard
          index={2}
          accent="#3B5BFF"
          icon={<Mail className="h-6 w-6 text-white" aria-hidden="true" />}
          label="Email"
          blurb="Best for detailed enquiries"
          badge="Best for details"
          actionLabel="Compose Email"
          href={`mailto:${email}`}
          value={email}
          copied={copied === "email"}
          onCopy={() => copy("email", email)}
          copyAria="Copy email address"
        />
      </div>

      {/* Response-time strip — sets the expectation the channel cards imply. */}
      <motion.div
        {...rise(3)}
        className="grid grid-cols-1 gap-4 rounded-2xl border border-white/12 bg-white/[0.05] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-md sm:grid-cols-2 sm:divide-x sm:divide-white/12"
      >
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 shrink-0 text-blue" strokeWidth={1.75} aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink-soft">We usually reply</span>
            <span className="font-avenir text-lg font-extrabold leading-tight text-blue">within 24 hours</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 sm:pl-4">
          <span className="text-xs font-semibold text-ink-soft">Messaging is open</span>
          <span className="font-avenir text-2xl font-extrabold leading-tight text-ink">24/7</span>
        </div>
      </motion.div>

      {/* Fallback rail — routes the undecided visitor into the booking tab. */}
      <motion.div
        {...rise(4)}
        className="mt-auto flex flex-col items-start gap-3 rounded-2xl border border-white/12 bg-gradient-to-r from-blue/20 via-white/[0.06] to-magenta/20 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-ink-soft">
          Still not sure? <span className="font-semibold text-ink">Book a free audit call</span> and let&rsquo;s
          discuss your goals.
        </p>
        <button
          type="button"
          onClick={onBookCall}
          className="btn-brand btn-sm group shrink-0"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Book Free Audit Call
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}

/** `+8801707555755` → `+880 1707 555 755`, so the number reads as a number
 * instead of a 13-digit run. Unknown shapes pass through untouched. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length !== 13) return raw;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 10)} ${digits.slice(10)}`;
}

function ChannelCard({
  index,
  accent,
  icon,
  label,
  blurb,
  badge,
  actionLabel,
  href,
  value,
  copied,
  onCopy,
  copyAria,
}: {
  index: number;
  accent: string;
  icon: ReactNode;
  label: string;
  blurb: string;
  badge: string;
  actionLabel: string;
  href: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  copyAria: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.quick, ease: EASE, delay: index * 0.07 }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md backdrop-saturate-150 transition-colors duration-300"
      style={{ ["--accent" as string]: accent }}
    >
      {/* Accent wash keyed to the channel, lit on hover only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 90% at 50% 0%, ${accent}26 0%, transparent 70%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${accent}66` }}
      />

      <div className="relative flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          style={{ backgroundColor: accent, boxShadow: `0 16px 34px -18px ${accent}` }}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <span className="font-avenir text-base font-bold leading-tight text-ink">{label}</span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${accent}24`, color: accent }}
            >
              {badge}
            </span>
          </div>
          <span className="text-xs text-ink-soft">{blurb}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopy}
        aria-label={copyAria}
        className="relative flex w-full items-center justify-between gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-white/30 hover:bg-white/[0.12]"
      >
        <span className="truncate">{value}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex shrink-0 items-center"
          >
            {copied ? <Check className="h-4 w-4 text-blue" /> : <Copy className="h-4 w-4 text-ink-soft" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-auto flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-white/[0.14]"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </motion.div>
  );
}
