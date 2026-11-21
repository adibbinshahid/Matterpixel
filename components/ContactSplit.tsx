"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";
import { usePathname, useRouter } from "next/navigation";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { cleanSrc, trackEvent } from "@/lib/analytics";
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
import type { InquiryPrefill } from "@/content/packages";
import { ctas, footer, siteGreeting, whatsappHref } from "@/content/siteConfig";
import { cn, EASE, DURATIONS } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { clearDraft, isDraftEmpty, readDraft, saveDraft } from "@/lib/formDraft";

/** localStorage keys for the two persisted contact forms. The inquiry key
 * moved when the wizard went from eleven questions to five; drafts under
 * the old key are migrated once, then deleted (see loadInquiryDraft). */
const INQUIRY_DRAFT_KEY = "contact-inquiry-v2";
const LEGACY_INQUIRY_DRAFT_KEY = "contact-inquiry";
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
    label: "Get a fixed quote",
    blurb: "Best for new projects",
    icon: Send,
  },
  {
    id: "booking",
    label: "Book a free audit call",
    blurb: "30 min · free, no obligation",
    icon: Calendar,
  },
  {
    id: "chat",
    label: "Quick Question",
    blurb: "WhatsApp or email · 12h reply",
    icon: MessageCircle,
  },
] as const;

const TRUST_POINTS = [
  { label: "We reply within 12 hours", icon: Clock },
  { label: "NDA-friendly", icon: FileCheck },
  { label: "Your details stay private", icon: ShieldCheck, href: "/privacy" },
] as const satisfies readonly { label: string; icon: unknown; href?: string }[];

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
/**
 * `prefill` seeds the inquiry's project details — built on the server from
 * `?package=`, `?stack=` or `?details=` (see buildInquiryPrefill). Links
 * that don't name a real tab fall through to the default inquiry tab.
 * (`?tab=partner` never gets here: next.config redirects it to the
 * homepage's white-label strip.)
 */
export function ContactSplit({
  initialTab,
  prefill,
  src,
}: {
  initialTab?: string;
  prefill?: InquiryPrefill;
  /** `?src=` from the CTA that linked here, already cleaned. */
  src?: string;
}) {
  const [active, setActive] = useState<TabId>(isTabId(initialTab) ? initialTab : DEFAULT_TAB);
  // Held from the first render: switching tabs rewrites the URL to a bare
  // `?tab=`, and the page's fresh props would otherwise drop what the
  // original link carried.
  const [linkPrefill] = useState(prefill);
  const [linkSrc] = useState(src);
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
        poster="/videos/globe-loop-poster.webp"
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
            {TRUST_POINTS.map((point) => {
              const { icon: Icon, label } = point;
              const href = "href" in point ? point.href : undefined;
              return (
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
                {href ? (
                  <Link href={href} className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </li>
              );
            })}
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
          data-lenis-prevent
          className="panel-dark relative h-full overflow-y-auto rounded-[2.25rem] border p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_-1px_12px_0_rgba(255,255,255,0.05),0_45px_100px_-25px_rgba(0,0,0,0.7),0_15px_40px_-15px_rgba(0,0,0,0.5)] sm:p-7 lg:p-8 lg:h-[46rem]"
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
                    <InquiryPanel prefill={linkPrefill} src={linkSrc} />
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
                    <BookingPanel src={linkSrc} />
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
  label,
  compact,
}: {
  registration: UseFormRegisterReturn;
  type: string;
  placeholder: string;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Accessible name — screens with more than one field can't lean on the
   * headline alone to say what each box is for. */
  label?: string;
  /** Tighter box for screens that stack two or three fields. */
  compact?: boolean;
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
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${registration.name}-wiz-error` : undefined}
          className={cn(
            // `focus-no-outline` (globals.css) + no focus shadow: nothing
            // is painted outside this element's own box. Both were being
            // sliced into flat blue bars by the wizard column's
            // overflow-hidden, since the field is exactly as wide as it.
            // Focus reads off the blue border + caret instead.
            "focus-no-outline peer w-full rounded-2xl border bg-white/10 px-6 font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-md backdrop-saturate-150 transition-all duration-300 placeholder:font-normal placeholder:text-ink-soft/40",
            compact ? "py-4 text-lg" : "py-6 text-xl",
            error ? "border-magenta" : "border-white/15 focus:border-blue",
          )}
        />
      </div>
      {error && (
        <span id={`${registration.name}-wiz-error`} role="alert" className="mt-1.5 block text-xs font-semibold text-magenta">
          {error}
        </span>
      )}
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
          aria-label={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${registration.name}-wiz-error` : undefined}
          className={cn(
            // Same as FloatingInput — nothing drawn outside the box.
            "focus-no-outline w-full resize-none rounded-2xl border bg-white/10 px-6 py-5 text-lg font-medium leading-relaxed text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] outline-none backdrop-blur-md backdrop-saturate-150 transition-all duration-300 placeholder:font-normal placeholder:text-ink-soft/40",
            error ? "border-magenta" : "border-white/15 focus:border-blue",
          )}
        />
      </div>
      {error && (
        <span id={`${registration.name}-wiz-error`} role="alert" className="mt-1.5 block text-xs font-semibold text-magenta">
          {error}
        </span>
      )}
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
        // The portal lands on <body>, outside the form card's `.panel-dark`
        // scope, so the dialog declares its own — that keeps it on the
        // homepage's dark ground and lets it use the site's two buttons.
        className="panel-dark w-full max-w-sm rounded-2xl border border-white/10 p-5 text-center shadow-2xl"
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
            className="btn-outline btn-sm flex-1"
          >
            Keep my answers
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-brand btn-sm flex-1"
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
  errorMsg,
  onStartOver,
}: {
  isSubmitting: boolean;
  status: "idle" | "success" | "error";
  label: string;
  successMsg: string;
  /** The server's own reason (slot taken, bot check), when it gave one. */
  errorMsg?: string | null;
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
            {errorMsg ?? "Something went wrong — try again."}
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

type InquiryFieldId =
  | "fullName"
  | "workEmail"
  | "whatsapp"
  | "company"
  | "website"
  | "projectTypes"
  | "budget"
  | "projectDetails";

interface InquiryField {
  id: InquiryFieldId;
  kind: "text" | "email" | "tel" | "textarea" | "choice" | "multi";
  /** Short label for the review grid and the accessible name on screens
   * that carry more than one field. */
  label: string;
  placeholder?: string;
  /** Autofill token for this field. Every text field opts in — defaults to
   * a plain "on" so the browser still offers suggestions for fields with
   * no standard token. */
  autoComplete?: string;
  optional?: boolean;
  options?: readonly string[];
}

const INQUIRY_FIELDS: Record<InquiryFieldId, InquiryField> = {
  fullName: { id: "fullName", kind: "text", label: "Name", placeholder: "Your name", autoComplete: "name" },
  workEmail: {
    id: "workEmail",
    kind: "email",
    label: "Work email",
    placeholder: "you@company.com",
    autoComplete: "email",
  },
  projectTypes: { id: "projectTypes", kind: "multi", label: "Project type", options: PROJECT_TYPE_OPTIONS },
  budget: { id: "budget", kind: "choice", label: "Budget", options: BUDGET_OPTIONS },
  projectDetails: {
    id: "projectDetails",
    kind: "textarea",
    label: "Project details",
    placeholder: "We're building...",
  },
  whatsapp: {
    id: "whatsapp",
    kind: "tel",
    label: "WhatsApp",
    placeholder: "WhatsApp number",
    autoComplete: "tel",
    optional: true,
  },
  company: {
    id: "company",
    kind: "text",
    label: "Company",
    placeholder: "Company or brand",
    autoComplete: "organization",
    optional: true,
  },
  website: {
    id: "website",
    kind: "text",
    label: "Website",
    placeholder: "Website, e.g. acme.com",
    autoComplete: "url",
    optional: true,
  },
};

/** Review-grid order: the four required answers first, the optional
 * extras after. */
const REVIEW_FIELDS: InquiryFieldId[] = [
  "fullName",
  "workEmail",
  "projectTypes",
  "budget",
  "projectDetails",
  "whatsapp",
  "company",
  "website",
];

type InquiryStepId = "contact" | "projectTypes" | "budget" | "projectDetails" | "extras";

interface WizardStep {
  id: InquiryStepId;
  fields: InquiryFieldId[];
  title: string;
  /** Used instead of `title` once we know the visitor's first name, so
   * the run of questions reads like a conversation rather than a form.
   * Deliberately not on every step — a name in *every* headline reads
   * like a mail-merge, so only a few steps opt in. Falls back to
   * `title` whenever the name is blank or unusable. */
  titleWithName?: (name: string) => string;
  desc: string;
  /** The whole screen can be skipped. */
  optional?: boolean;
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

/** Name prefixes skipped when picking the name to greet someone by —
 * "Md. Adib Bin Shahid" is greeted as "Adib", never "Md". */
const NAME_PREFIXES = new Set([
  "md", "mohammad", "mohammed", "muhammad", "mohd", "muhammed", "mr", "mrs", "ms", "miss",
  "dr", "prof", "sir", "sheikh", "shaikh", "syed", "sayed", "engr", "eng",
]);

/** The visitor's first name, title-cased for use inside a headline —
 * "md. adib bin shahid" → "Adib". Returns null (→ neutral copy) for
 * anything that would read badly: empty, an email pasted into the name
 * field, digits, or nothing left after the prefixes. */
function displayNameOf(fullName: string | undefined): string | null {
  const raw = (fullName ?? "").trim();
  if (!raw || /[@\d]/.test(raw)) return null;
  const words = raw
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{M}'’-]/gu, ""))
    .filter(Boolean);
  const first = words.find((w) => !NAME_PREFIXES.has(w.toLowerCase()));
  if (!first) return null;
  const clean = capitalizeNameToken(first);
  if (clean.length < 2 || clean.length > 20) return null;
  return clean;
}

/** Four required screens, then one optional extras screen, then review. A
 * link from a package or a stack skips the screens it already answers. */
const WIZARD_STEPS: WizardStep[] = [
  {
    id: "contact",
    fields: ["fullName", "workEmail"],
    title: "Let's start with you.",
    desc: "Your name, and where your proposal should land.",
  },
  {
    id: "projectTypes",
    fields: ["projectTypes"],
    title: "What do you need?",
    titleWithName: (n) => `So ${n}, what are we building?`,
    desc: "Select all that apply.",
  },
  {
    id: "budget",
    fields: ["budget"],
    title: "What's your budget range?",
    titleWithName: (n) => `${n}, what budget are you working with?`,
    desc: "Ballpark is fine — this helps us scope things right.",
  },
  {
    id: "projectDetails",
    fields: ["projectDetails"],
    title: "Tell us about the project.",
    titleWithName: (n) => `${n}, tell us about the project.`,
    desc: "The more detail, the better we can scope it.",
  },
  {
    id: "extras",
    fields: ["whatsapp", "company", "website"],
    title: "Anything else that helps?",
    desc: "Optional — WhatsApp for faster back-and-forth, plus your company and site.",
    optional: true,
  },
];

/** Single-choice answers advance on their own after this long — long enough
 * to see the pick land, short enough not to feel like waiting. */
const AUTO_ADVANCE_MS = 250;

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.35, ease: EASE } }),
};

function isFieldEmpty(id: InquiryFieldId, values: InquiryValues): boolean {
  const v = values[id];
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().length === 0;
  return v == null;
}

/**
 * The one validation authority for a single answer: runs that field's own
 * slice of `inquirySchema`, so nothing can reach the review screen that the
 * final submit would then reject. Returns the message to show, or null if
 * the answer is acceptable.
 */
function fieldIssue(id: InquiryFieldId, values: InquiryValues): string | null {
  // Optional and untouched is a valid state — that's what Skip means.
  if (INQUIRY_FIELDS[id].optional && isFieldEmpty(id, values)) return null;
  const result = inquiryFieldSchemas[id].safeParse(values[id]);
  return result.success ? null : (result.error.issues[0]?.message ?? "Check this answer.");
}

function stepIssue(step: WizardStep, values: InquiryValues): string | null {
  for (const id of step.fields) {
    const issue = fieldIssue(id, values);
    if (issue) return issue;
  }
  return null;
}

function displayValue(id: InquiryFieldId, values: InquiryValues): string {
  const v = values[id];
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "string") return v.trim() ? v : "—";
  return "—";
}

/** The old eleven-question wizard's answers, mapped onto the merged
 * project-type question. "Multiple Services" says nothing on its own. */
const LEGACY_PROJECT_TYPES: Record<string, string> = {
  "New Website": "New website",
  "Website Redesign": "Website redesign",
  "AI Automation": "AI automation",
  "Brand Identity": "Branding & identity",
  "Content Creation": "AI visuals & video",
  "Growth Marketing": "SEO & marketing",
  "Web & App Development": "Web app",
  "Business Software": "Business software",
  "Web app or software": "Web app",
  "Branding & Identity": "Branding & identity",
  "AI Product Visuals & Video": "AI visuals & video",
  "SEO & Digital Marketing": "SEO & marketing",
};

/**
 * Turns whatever came out of localStorage into values this form can hold —
 * strings stay strings, choices must still be on offer, everything else is
 * dropped. Drafts from the previous wizard (separate project type and
 * services, timeline, goals) are folded into the new fields here, so a
 * visitor mid-way through the old form keeps their answers rather than
 * crashing the new one.
 */
function sanitizeInquiryDraft(raw: Record<string, unknown>): Partial<InquiryValues> {
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const known = new Set<string>(PROJECT_TYPE_OPTIONS);
  const types = new Set<string>();
  const addType = (v: unknown) => {
    if (typeof v !== "string") return;
    const mapped = known.has(v) ? v : LEGACY_PROJECT_TYPES[v];
    if (mapped) types.add(mapped);
  };
  for (const key of ["projectTypes", "serviceTypes"]) {
    const list = raw[key];
    if (Array.isArray(list)) list.forEach(addType);
  }
  addType(raw.projectType);
  const budget = str(raw.budget);
  return {
    fullName: str(raw.fullName),
    workEmail: str(raw.workEmail),
    whatsapp: str(raw.whatsapp),
    company: str(raw.company),
    website: str(raw.website),
    projectTypes: PROJECT_TYPE_OPTIONS.filter((t) => types.has(t)),
    budget: budget && (BUDGET_OPTIONS as readonly string[]).includes(budget) ? budget : undefined,
    projectDetails: str(raw.projectDetails),
    selection: str(raw.selection),
    src: cleanSrc(str(raw.src)),
  };
}

/** Reads the current draft, or migrates one left by the old wizard (and
 * deletes it, so it's read once). Returns null when there's nothing usable. */
function loadInquiryDraft(): { values: Partial<InquiryValues>; step?: number } | null {
  const current = readDraft<Record<string, unknown>>(INQUIRY_DRAFT_KEY);
  const legacy = readDraft<Record<string, unknown>>(LEGACY_INQUIRY_DRAFT_KEY);
  if (legacy) clearDraft(LEGACY_INQUIRY_DRAFT_KEY);
  const draft = current ?? legacy;
  if (!draft) return null;
  const values = sanitizeInquiryDraft(draft.values as Record<string, unknown>);
  if (isDraftEmpty({ ...values, src: undefined } as Record<string, unknown>)) return null;
  // A legacy step index pointed into a different list of questions.
  return { values, step: current ? draft.step : undefined };
}

/** "Your selection" — what the visitor picked before landing here (a
 * package, a stack, a brief), kept in view from the first question so a
 * skipped step never feels like a missing one. */
function SelectionCard({
  selection,
  details,
  onChange,
}: {
  selection?: string;
  details?: string;
  onChange: () => void;
}) {
  const [heading, ...lines] = (selection ?? "").split("\n").filter(Boolean);
  return (
    <div className="relative z-10 mb-3 flex shrink-0 items-start justify-between gap-3 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">Your selection</p>
        {heading && <p className="truncate text-[0.9rem] font-extrabold tracking-tight text-ink">{heading}</p>}
        {lines.map((line) => (
          <p key={line} className="truncate text-[0.72rem] font-semibold text-ink-soft">
            {line}
          </p>
        ))}
        {details && (
          <p className="line-clamp-2 text-[0.72rem] font-medium text-ink-soft">
            <span className="font-semibold text-ink">Brief:</span> {details}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue/25 px-3 py-1.5 text-[0.7rem] font-bold text-ink transition-colors hover:bg-blue/40"
      >
        <Pencil className="h-3 w-3" />
        Change
      </button>
    </div>
  );
}

/** Ambient decoration only — two slow-drifting blurred blobs, so the
 * panel never reads as empty behind the wizard copy. Frozen (no animate loop) under reduced
 * motion since it's purely cosmetic. */
function WizardAmbience() {
  const reduced = useReducedMotion();

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
    </div>
  );
}

function InquiryPanel({ prefill, src }: { prefill?: InquiryPrefill; src?: string }) {
  const botToken = useRef<string | null>(null);
  const [botReset, setBotReset] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [stepId, setStepId] = useState<InquiryStepId | "review">("contact");
  const [direction, setDirection] = useState(1);
  /** Steps a package/stack link already answered. Hidden from the run of
   * questions until the visitor asks to change the selection. */
  const [skipped, setSkipped] = useState<InquiryStepId[]>(() => [
    ...(prefill?.projectTypes?.length ? (["projectTypes"] as const) : []),
    ...(prefill?.budget ? (["budget"] as const) : []),
  ]);
  /** Off on mount (and on a restored draft) so the browser never auto-scrolls
   * the page to the field on load — flips on once the visitor actually
   * advances a step, so focus-follows-step still works while stepping
   * through the wizard. */
  const [autoFocusStep, setAutoFocusStep] = useState(false);
  /** Drafts are read in an effect, not during render — localStorage doesn't
   * exist on the server, and prefilling during render would hydrate-mismatch. */
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  /** Which answer is being edited in place on the review screen, if any. */
  const [editingId, setEditingId] = useState<InquiryFieldId | null>(null);
  /** The value that field held when its editor opened — Escape's undo. */
  const revertRef = useRef<{ id: InquiryFieldId; value: unknown } | null>(null);
  /** Pending single-choice auto-advance. */
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** What the link set — applied on top of defaults, and on top of a
   * restored draft too: an explicit choice from the link beats an older
   * half-typed answer. */
  const linkValues: Partial<InquiryValues> = {
    ...(prefill?.projectTypes?.length ? { projectTypes: prefill.projectTypes } : {}),
    ...(prefill?.budget ? { budget: prefill.budget } : {}),
    ...(prefill?.details ? { projectDetails: prefill.details } : {}),
    ...(prefill?.selection ? { selection: prefill.selection } : {}),
    ...(src ? { src } : {}),
  };
  const linkValuesRef = useRef(linkValues);
  /** The skip set as it stood on mount — what the draft restore resumes
   * against. */
  const initialSkippedRef = useRef(skipped);

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
    defaultValues: { projectTypes: [], ...linkValues },
  });
  const values = watch();

  const visibleSteps = WIZARD_STEPS.filter((s) => !skipped.includes(s.id));
  const isReview = stepId === "review";
  const stepIndex = isReview ? visibleSteps.length : visibleSteps.findIndex((s) => s.id === stepId);
  const current = WIZARD_STEPS.find((s) => s.id === stepId) ?? WIZARD_STEPS[0];

  // Restore a half-finished inquiry on mount: answers *and* the step the
  // visitor was on — but never past the first screen that still needs an
  // answer, so a draft from an older build can't land on review with holes.
  useEffect(() => {
    const draft = loadInquiryDraft();
    if (draft) {
      const restoredValues = {
        projectTypes: [],
        ...draft.values,
        ...linkValuesRef.current,
        // Never restore the honeypot — a stored value would look like a bot.
        hp: "",
      } as InquiryValues;
      reset(restoredValues);
      const steps = WIZARD_STEPS.filter((s) => !initialSkippedRef.current.includes(s.id));
      const firstOpen = steps.findIndex((s) => stepIssue(s, restoredValues));
      // The saved index is into the full step list; count the visible steps
      // before it, so a step that's skipped now resumes on the one after. A
      // migrated draft has no usable index and resumes at its first gap.
      const savedStep = draft.step ?? WIZARD_STEPS.length;
      const savedIndex = steps.filter((s) => WIZARD_STEPS.indexOf(s) < savedStep).length;
      const target = firstOpen < 0 ? savedIndex : Math.min(savedIndex, firstOpen);
      setStepId(steps[target]?.id ?? "review");
      setRestored(true);
    }
    setDraftLoaded(true);
  }, [reset]);

  // Persist on every change, debounced so a burst of keystrokes is one write.
  // Runs only after the restore pass, otherwise the empty initial form would
  // overwrite the draft we're about to read. The step is saved as its index
  // in the full step list, review being one past the end.
  useEffect(() => {
    if (!draftLoaded || status === "success") return;
    // hp is dropped, never persisted — a stored honeypot value would come
    // back looking like a bot filled the form.
    const persisted: Partial<InquiryValues> = { ...values, hp: undefined };
    // src arrives with the link, not from the visitor — on its own it isn't a draft.
    if (isDraftEmpty({ ...persisted, src: undefined } as Record<string, unknown>)) return;
    const index = stepId === "review" ? WIZARD_STEPS.length : WIZARD_STEPS.findIndex((s) => s.id === stepId);
    const timer = setTimeout(() => saveDraft(INQUIRY_DRAFT_KEY, persisted, index), 400);
    return () => clearTimeout(timer);
  }, [values, stepId, draftLoaded, status]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // One event per screen shown, review included.
  useEffect(() => {
    if (status === "success") return;
    trackEvent("contact_step", { tab: "inquiry", step: stepIndex + 1, stepName: stepId });
  }, [stepId, stepIndex, status]);

  const goTo = (target: InquiryStepId | "review", dir: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDirection(dir);
    setAutoFocusStep(true);
    setStepId(target);
  };

  const startOver = () => {
    clearDraft(INQUIRY_DRAFT_KEY);
    reset({ projectTypes: [], ...linkValuesRef.current });
    setRestored(false);
    setEditingId(null);
    goTo("contact", -1);
  };

  /** Live schema verdict for the visible question. No step advances while
   * this is non-null, so the review screen only ever shows sendable data. */
  const currentIssue = isReview ? null : stepIssue(current, values);
  const canContinue = !currentIssue;

  const displayName = displayNameOf(values.fullName);
  const title = displayName ? (current.titleWithName?.(displayName) ?? current.title) : current.title;

  /** An optional screen that's still empty — the primary action is "move
   * on", not "submit an answer", so the button says Skip and drops the
   * gradient. Typing anything flips it back to Continue. */
  const isSkip = !!current.optional && current.fields.every((id) => isFieldEmpty(id, values));

  /** Only nag once there's something to nag about: an empty required field
   * already reads as unfinished via the disabled Continue, but a filled-in
   * value that won't validate has to say why, right where it was typed. */
  const visibleIssue = (id: InquiryFieldId) =>
    (!isFieldEmpty(id, values) ? fieldIssue(id, values) : null) ??
    (errors[id]?.message as string | undefined);

  /** Rewrites the answer to the form it will actually be sent in, so the
   * review screen shows what we got rather than what was typed. Only the
   * website needs it today (bare domain → https://bare-domain). */
  const normalizeAnswer = (id: InquiryFieldId) => {
    if (id !== "website") return;
    const typed = getValues("website");
    if (!typed) return;
    const normalized = normalizeWebsite(typed);
    if (normalized !== typed) setValue("website", normalized, { shouldValidate: false });
  };

  const nextAfter = (id: InquiryStepId): InquiryStepId | "review" => {
    const i = visibleSteps.findIndex((s) => s.id === id);
    return visibleSteps[i + 1]?.id ?? "review";
  };

  const goNext = () => {
    if (isReview || !canContinue) return;
    current.fields.forEach(normalizeAnswer);
    goTo(nextAfter(current.id), 1);
  };
  const goBack = () => {
    if (stepIndex <= 0) return;
    goTo(visibleSteps[stepIndex - 1].id, -1);
  };

  /** A single-choice pick is the whole answer, so the step moves on by
   * itself — after a beat, so the selection visibly lands first. Clicks
   * and keyboard (Enter/Space on the pill) take the same path. */
  const pickChoice = (id: InquiryFieldId, option: string) => {
    setValue(id, option as never, { shouldValidate: true });
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    const from = current.id;
    const to = nextAfter(from);
    advanceTimer.current = setTimeout(() => {
      setDirection(1);
      setAutoFocusStep(true);
      setStepId((s) => (s === from ? to : s));
    }, AUTO_ADVANCE_MS);
  };

  /** "Change" on the selection card: the skipped steps rejoin the run and
   * the visitor goes straight to the first of them. Name and email aren't
   * lost if they were still blank — Previous leads back to them, and the
   * review screen flags them before Send. */
  const changeSelection = () => {
    const reopened = WIZARD_STEPS.find((s) => skipped.includes(s.id))?.id ?? "projectTypes";
    setSkipped([]);
    goTo(reopened, stepId === "contact" ? 1 : -1);
  };

  /** Opens the inline editor on the review screen. The previous answer is
   * stashed so Escape can put it back — a mis-click into a field shouldn't
   * be able to wipe an answer with no way out. */
  const openEditor = (id: InquiryFieldId) => {
    revertRef.current = { id, value: getValues(id) };
    setEditingId(id);
  };
  const closeEditor = (commit: boolean) => {
    const revert = revertRef.current;
    if (commit && revert) {
      // Same gate as the wizard: an invalid answer can't be accepted here
      // either, so the editor stays open with its message rather than
      // returning a summary that Send would reject.
      if (fieldIssue(revert.id, getValues())) {
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
  /** Enter moves to the screen's next field, and from its last field on to
   * the next screen. */
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const fields = current.fields;
    const next = fields[fields.indexOf(e.currentTarget.name as InquiryFieldId) + 1];
    if (next) document.getElementById(`${next}-wiz`)?.focus();
    else goNext();
  };
  const toggleMulti = (option: string) => {
    const list = getValues("projectTypes") ?? [];
    const next = list.includes(option) ? list.filter((x) => x !== option) : [...list, option];
    setValue("projectTypes", next, { shouldValidate: true });
  };

  const onSubmit = async (values: InquiryValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: botToken.current }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "");
      }
      setStatus("success");
      trackEvent("contact_submit", { tab: "inquiry", src: values.src ?? null });
      // Sent — the draft has served its purpose, and leaving it behind would
      // resurrect the whole inquiry on the visitor's next visit.
      clearDraft(INQUIRY_DRAFT_KEY);
      setRestored(false);
      setEditingId(null);
      reset();
    } catch (error) {
      setErrorMsg(error instanceof Error && error.message ? error.message : null);
      setStatus("error");
    } finally {
      // Turnstile tokens are single-use: fetch a fresh one for a retry.
      setBotReset((n) => n + 1);
    }
  };

  /** Submit is only reachable from the review screen, so a validation
   * failure opens that answer's inline editor instead of throwing the
   * visitor back into the wizard — the offending cell is already on screen,
   * flagged in magenta. */
  const onInvalid = (formErrors: FieldErrors<InquiryValues>) => {
    const firstKey = Object.keys(formErrors)[0] as InquiryFieldId;
    setStepId("review");
    if (firstKey in INQUIRY_FIELDS) openEditor(firstKey);
  };

  const showSelection = !!(values.selection || prefill?.details);
  const multiField = current.fields.length > 1;

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
      {/* Which CTA brought the visitor here — rides along to the email. */}
      <input {...register("src")} type="hidden" />
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
            We reply within 12 hours with next steps and a proposal.
          </p>
        </div>
      ) : !isReview ? (
        <>
          {showSelection && (
            <SelectionCard
              selection={values.selection}
              details={prefill?.details ? values.projectDetails : undefined}
              onChange={changeSelection}
            />
          )}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
              Step {stepIndex + 1} of {visibleSteps.length + 1}
              {current.optional && " · optional"}
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

          {/* overflow-x-hidden is load-bearing: the step entrance slides in
             from x:+28, and `overflow-y: auto` alone would compute x to auto
             and flash a horizontal scrollbar. */}
          <div data-lenis-prevent className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={stepId}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex min-h-full flex-col justify-center gap-6 py-6 sm:gap-8 sm:py-8"
              >
                <div>
                  <h2 className="text-[1.9rem] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-[2.35rem]">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">{current.desc}</p>
                </div>

                <div className={cn("flex flex-col", multiField ? "gap-3" : "gap-0")}>
                  {current.fields.map((id, i) => {
                    const field = INQUIRY_FIELDS[id];
                    if (field.kind === "text" || field.kind === "email" || field.kind === "tel") {
                      return (
                        <FloatingInput
                          key={id}
                          registration={register(id)}
                          type={field.kind}
                          label={field.label}
                          placeholder={field.placeholder ?? ""}
                          error={visibleIssue(id)}
                          autoFocus={autoFocusStep && i === 0}
                          autoComplete={field.autoComplete}
                          onKeyDown={handleEnter}
                          compact={multiField}
                        />
                      );
                    }
                    if (field.kind === "textarea") {
                      return (
                        <FloatingTextarea
                          key={id}
                          registration={register(id)}
                          placeholder={field.placeholder ?? ""}
                          error={visibleIssue(id)}
                          autoFocus={autoFocusStep}
                        />
                      );
                    }
                    return (
                      <div key={id} role="group" aria-label={field.label} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {field.options?.map((opt) => (
                          <OptionPill
                            key={opt}
                            label={opt}
                            selected={field.kind === "multi" ? values.projectTypes?.includes(opt) ?? false : values[id] === opt}
                            onClick={() => (field.kind === "multi" ? toggleMulti(opt) : pickChoice(id, opt))}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Previous + Continue sit together as one control pair, right
             aligned — the step counter above is the only progress cue. */}
          <div className="relative z-10 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              // Same min-w and the same hover-lift/press cue as Continue
              // so the pair feels like one control; the difference is
              // purely tonal — outline + faint fill instead of gradient,
              // muted label — so Previous stays secondary without
              // behaving differently under the cursor.
              className={cn("btn-outline group min-w-[10.5rem]", stepIndex === 0 && "invisible")}
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
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
              Step {visibleSteps.length + 1} of {visibleSteps.length + 1}
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]">
              Everything looks good.
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">Double-check your answers, then send it our way.</p>
          </div>

          {values.selection && (
            <p className="mt-3 truncate rounded-xl border border-blue/30 bg-blue/10 px-3 py-2 text-[0.75rem] font-semibold text-ink">
              <span className="mr-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">Selection</span>
              {values.selection.split("\n").join(" · ")}
            </p>
          )}

          {/* Two/three-column grid of short labels, not a stack of full
             question sentences — every answer has to be checkable in one
             look. Scroll stays as a fallback for very short viewports only. */}
          <div data-lenis-prevent className="my-4 max-h-full min-h-0 overflow-y-auto rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-md backdrop-saturate-150">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {REVIEW_FIELDS.map((id) => {
                const f = INQUIRY_FIELDS[id];
                const isEditing = editingId === id;
                // Live schema verdict, not just post-submit resolver errors —
                // a restored draft could hold a value the rules now reject,
                // and it should flag before Send.
                const fieldError = fieldIssue(id, values) ?? (errors[id]?.message as string | undefined);

                // Editing happens right here in the summary — sending someone
                // back through the wizard to change one answer means they have
                // to walk forward through every later step again.
                if (isEditing) {
                  return (
                    <div
                      key={id}
                      // Editors always take the full row: choice/multi pills
                      // need the width, and a text field in a third of the
                      // row is uncomfortably narrow to correct a typo in.
                      className="col-span-full rounded-xl border border-blue/40 bg-white/[0.09] px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">
                          {f.label}
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
                        {(f.kind === "text" || f.kind === "email" || f.kind === "tel") && (
                          <input
                            {...register(id)}
                            type={f.kind}
                            autoFocus
                            aria-label={f.label}
                            autoComplete={f.autoComplete ?? "on"}
                            placeholder={f.placeholder}
                            onKeyDown={handleEditorKeyDown}
                            className="focus-no-outline w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/40 focus:border-blue"
                          />
                        )}

                        {f.kind === "textarea" && (
                          <textarea
                            {...register(id)}
                            rows={3}
                            autoFocus
                            aria-label={f.label}
                            placeholder={f.placeholder}
                            className="focus-no-outline w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium leading-relaxed text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/40 focus:border-blue"
                          />
                        )}

                        {f.kind === "choice" && (
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                            {f.options?.map((opt) => (
                              <ReviewPill
                                key={opt}
                                label={opt}
                                selected={values[id] === opt}
                                onClick={() => {
                                  setValue(id, opt as never, { shouldValidate: true });
                                  // Single-answer question — picking *is* the
                                  // whole edit, so no separate confirm step.
                                  closeEditor(true);
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {f.kind === "multi" && (
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                            {f.options?.map((opt) => (
                              <ReviewPill
                                key={opt}
                                label={opt}
                                selected={values.projectTypes?.includes(opt) ?? false}
                                onClick={() => toggleMulti(opt)}
                              />
                            ))}
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
                    key={id}
                    type="button"
                    onClick={() => openEditor(id)}
                    // The whole cell is the edit affordance, so the row needs
                    // no persistent "Edit" link eating horizontal space — the
                    // pencil fades in on hover/focus instead.
                    className={cn(
                      "group/cell relative flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07]",
                      // Free-text answer is the long one — give it the full row.
                      f.kind === "textarea" && "sm:col-span-2 lg:col-span-3",
                      fieldError && "ring-1 ring-inset ring-magenta/60",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                      {f.label}
                      <Pencil className="h-2.5 w-2.5 shrink-0 text-blue opacity-0 transition-opacity group-hover/cell:opacity-100 group-focus-visible/cell:opacity-100" />
                    </span>
                    <span
                      className={cn(
                        "text-[0.82rem] font-semibold leading-snug",
                        fieldError ? "text-magenta" : "text-ink",
                        // Multi-selects and the details textarea can run long;
                        // two clamped lines keep every cell the same height.
                        f.kind === "textarea" || f.kind === "multi" ? "line-clamp-2" : "truncate",
                      )}
                    >
                      {fieldError ?? displayValue(id, values)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0">
            <Turnstile onToken={(t) => (botToken.current = t)} resetSignal={botReset} />
            <SubmitRow
              isSubmitting={isSubmitting}
              status={status}
              label="Send Inquiry"
              successMsg="Inquiry sent — we reply within 12 hours."
              errorMsg={errorMsg}
              onStartOver={startOver}
            />
            <button
              type="button"
              onClick={() => goTo(visibleSteps[visibleSteps.length - 1].id, -1)}
              className="focus-no-outline mx-auto mt-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

type BookingStepId = "schedule" | "contact" | "prepare";

interface BookingStep {
  id: BookingStepId;
  /** The schema fields this screen owns. */
  fields: (keyof BookingValues)[];
  title: string;
  titleWithName?: (name: string) => string;
  desc: string;
}

/** Calendar first: the slot is the thing a visitor came here for, so it's
 * the opening screen, and a call books on slot + name + email alone. The
 * qualifying questions follow as one optional screen the visitor can skip. */
const BOOKING_STEPS: BookingStep[] = [
  {
    id: "schedule",
    fields: ["slotUtc", "preferredDate", "preferredTime", "timeZone"],
    title: "Pick a time for your free audit call.",
    // Kept to one line at the card's width — the zone picker sits inside the
    // scheduler, so this line doesn't have to explain it.
    desc: `30 min · ${AVAILABILITY.callsCompact}`,
  },
  {
    id: "contact",
    fields: ["fullName", "email"],
    title: "Who are we meeting?",
    desc: "Your invite and audit notes land in this inbox.",
  },
  {
    id: "prepare",
    fields: ["website", "role", "auditFocus", "challenge", "budget", "timeline"],
    title: "Help us prepare.",
    titleWithName: (n) => `Help us prepare, ${n}.`,
    desc: "All optional. Answer what's useful, or skip straight to booking.",
  },
];

/** The "Help us prepare" questions, rendered as compact pill rows so all of
 * them fit on one screen. Single-answer rows toggle off on a second click —
 * nothing here is required, so an answer has to be retractable. */
const PREPARE_QUESTIONS: {
  field: "role" | "auditFocus" | "challenge" | "budget" | "timeline";
  label: string;
  options: readonly string[];
  multi?: boolean;
}[] = [
  { field: "role", label: "Your role", options: ROLE_OPTIONS },
  { field: "auditFocus", label: "What should we look at?", options: AUDIT_FOCUS_OPTIONS, multi: true },
  { field: "challenge", label: "Biggest challenge", options: CHALLENGE_OPTIONS },
  { field: "budget", label: "Budget", options: BUDGET_OPTIONS },
  { field: "timeline", label: "When could you start?", options: TIMELINE_OPTIONS },
];

/** Same contract as `stepIssue` for the inquiry wizard: the first message to
 * show for this screen, or null when it can move on. Optional fields pass
 * when empty because their schemas allow it. */
function bookingStepIssue(step: BookingStep, values: BookingValues): string | null {
  for (const field of step.fields) {
    const schema = bookingFieldSchemas[field as keyof typeof bookingFieldSchemas];
    if (!schema) continue;
    const result = schema.safeParse(values[field]);
    if (!result.success) return result.error.issues[0]?.message ?? "Check this answer.";
  }
  return null;
}

function bookingFieldIssue(field: keyof BookingValues, values: BookingValues): string | null {
  const v = values[field];
  if (typeof v !== "string" || !v.trim()) return null;
  const result = bookingFieldSchemas[field].safeParse(v);
  return result.success ? null : (result.error.issues[0]?.message ?? "Check this answer.");
}

/** The first screen that still needs an answer — where a restored draft
 * resumes, so a reload never lands past a slot that has since expired. */
function firstOpenBookingStep(values: BookingValues): number {
  const index = BOOKING_STEPS.findIndex((s) => bookingStepIssue(s, values));
  return index < 0 ? BOOKING_STEPS.length - 1 : index;
}

function BookingPanel({ src }: { src?: string }) {
  const botToken = useRef<string | null>(null);
  const [botReset, setBotReset] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  /** Off on mount (and on a restored draft) so the browser never auto-scrolls
   * the page to the field on load — flips on once the visitor actually
   * advances a step. */
  const [autoFocusStep, setAutoFocusStep] = useState(false);
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
    defaultValues: { auditFocus: [], src },
  });
  const values = watch();

  // Same draft behaviour as the inquiry wizard — a half-filled call request
  // survives a reload. Drafts from the older twelve-question flow carry the
  // same field names, so they restore as-is; only the step index changed
  // meaning, which is why it's clamped to the first unanswered screen.
  useEffect(() => {
    const draft = readDraft<BookingValues>(BOOKING_DRAFT_KEY);
    if (draft && !isDraftEmpty(draft.values as Record<string, unknown>)) {
      const restoredValues = { ...draft.values, hp: "" } as BookingValues;
      // The link the visitor just followed outranks the one in the draft.
      restoredValues.src = src ?? cleanSrc(restoredValues.src);
      if (!Array.isArray(restoredValues.auditFocus)) restoredValues.auditFocus = [];
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
      const savedStep = typeof draft.step === "number" ? draft.step : 0;
      setStep(Math.max(0, Math.min(savedStep, firstOpenBookingStep(restoredValues))));
      setRestored(true);
    }
    setDraftLoaded(true);
  }, [reset, src]);

  useEffect(() => {
    if (!draftLoaded || status === "success") return;
    const persisted: Partial<BookingValues> = { ...values, hp: undefined };
    // timeZone is auto-detected and src comes with the link — neither is
    // something the visitor typed, so on their own they aren't a draft.
    const typed = { ...persisted, timeZone: undefined, src: undefined };
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

  const current = BOOKING_STEPS[step];

  useEffect(() => {
    if (status === "success") return;
    trackEvent("contact_step", { tab: "booking", step: step + 1, stepName: BOOKING_STEPS[step].id });
  }, [step, status]);
  const currentIssue = bookingStepIssue(current, values);
  const canContinue = !currentIssue;
  const isLast = step === BOOKING_STEPS.length - 1;

  const displayName = displayNameOf(values.fullName);
  const title = displayName ? (current.titleWithName?.(displayName) ?? current.title) : current.title;

  const startOver = () => {
    clearDraft(BOOKING_DRAFT_KEY);
    reset({ auditFocus: [], src: getValues("src") });
    setRestored(false);
    setDirection(-1);
    setStep(0);
  };

  const normalizeSite = () => {
    const typed = getValues("website");
    if (!typed) return;
    const normalized = normalizeWebsite(typed);
    if (normalized !== typed) setValue("website", normalized, { shouldValidate: false });
  };

  const goTo = (index: number) => {
    setDirection(index > step ? 1 : -1);
    setAutoFocusStep(true);
    setStep(index);
  };
  const goNext = () => {
    if (!canContinue || isLast) return;
    goTo(step + 1);
  };
  const goBack = () => {
    if (step > 0) goTo(step - 1);
  };
  /** Enter on name jumps to email; Enter on the last field of a screen
   * moves on. The prepare screen never submits on Enter — booking is an
   * explicit click. */
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (current.id === "contact" && e.currentTarget.name === "fullName") {
      document.getElementById("email-wiz")?.focus();
      return;
    }
    if (current.id === "prepare") normalizeSite();
    else goNext();
  };
  const pick = (field: (typeof PREPARE_QUESTIONS)[number]["field"], option: string, multi?: boolean) => {
    if (multi) {
      const list = (getValues("auditFocus") as string[] | undefined) ?? [];
      setValue("auditFocus", list.includes(option) ? list.filter((x) => x !== option) : [...list, option], {
        shouldValidate: true,
      });
      return;
    }
    setValue(field as "role", getValues(field as "role") === option ? "" : option, { shouldValidate: true });
  };

  const onSubmit = async (values: BookingValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: values.website ? normalizeWebsite(values.website) : "",
          turnstileToken: botToken.current,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "");
      }
      setStatus("success");
      trackEvent("contact_submit", { tab: "booking", src: values.src ?? null });
      clearDraft(BOOKING_DRAFT_KEY);
      setRestored(false);
      reset({ auditFocus: [] });
    } catch (error) {
      setErrorMsg(error instanceof Error && error.message ? error.message : null);
      setStatus("error");
    } finally {
      // Turnstile tokens are single-use: fetch a fresh one for a retry.
      setBotReset((n) => n + 1);
    }
  };

  /** A rejected field reopens the screen it lives on rather than failing
   * silently on the last one. */
  const onInvalid = (formErrors: FieldErrors<BookingValues>) => {
    const firstKey = Object.keys(formErrors)[0];
    const failing = BOOKING_STEPS.findIndex((s) => (s.fields as string[]).includes(firstKey));
    if (failing >= 0 && failing !== step) goTo(failing);
  };

  /** Skip means skip: whatever was half-picked on the prepare screen is
   * cleared before booking, so the email never carries answers the visitor
   * chose not to give. */
  const skipAndBook = () => {
    setValue("website", "");
    setValue("role", "");
    setValue("auditFocus", []);
    setValue("challenge", "");
    setValue("budget", "");
    setValue("timeline", "");
    void handleSubmit(onSubmit, onInvalid)();
  };

  const slotLabel =
    values.preferredDate && values.preferredTime
      ? `${formatDateKeyLong(values.preferredDate)} · ${formatTimeKey(values.preferredTime)}`
      : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="relative flex h-full min-h-[26rem] flex-col"
    >
      <WizardAmbience />
      {/* Which CTA brought the visitor here — rides along to the email. */}
      <input {...register("src")} type="hidden" />
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
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Free audit call (30 min) requested.</h2>
          <p className="max-w-xs text-sm text-ink-soft">
            We reply within 12 hours to confirm your slot and send a Google Meet link.
          </p>
        </div>
      ) : (
        <>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">
              Step {step + 1} of {BOOKING_STEPS.length}
              {isLast && " · optional"}
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

          {/* The slot rides along once it's picked: it's the one thing the
             visitor is really confirming, so it stays in view (and
             changeable) on every later screen instead of on a review page. */}
          {step > 0 && slotLabel && (
            <div className="relative z-10 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-blue">
                  Free audit call (30 min)
                </p>
                <p className="truncate text-[0.9rem] font-extrabold tracking-tight text-ink">{slotLabel}</p>
                {values.timeZone && (
                  <p className="truncate text-[0.7rem] font-semibold text-ink-soft">
                    {values.timeZone.replace(/_/g, " ")} ({zoneOffsetLabel(values.timeZone)})
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => goTo(0)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue/25 px-3 py-1.5 text-[0.7rem] font-bold text-ink transition-colors hover:bg-blue/40"
              >
                <Pencil className="h-3 w-3" />
                Change
              </button>
            </div>
          )}

          {/* overflow-x-hidden is load-bearing, not decoration: `overflow-y:
             auto` alone makes the x axis compute to `auto` as well, and the
             step entrance slides in from x:+28 — so a horizontal scrollbar
             flashed across the panel on every question change (and on first
             paint, which is where it was most visible). */}
          <div data-lenis-prevent className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
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
                  // The schedule and prepare screens carry several controls
                  // at once: they keep a tighter rhythm and grow downward
                  // from the top (centering a screen taller than the pane
                  // pushes its headline up under the step counter) while the
                  // parent scrolls them.
                  current.id === "contact" ? "h-full justify-center sm:gap-10 sm:py-10" : "justify-start",
                )}
              >
                <div>
                  <h2
                    className={cn(
                      "font-extrabold leading-[1.12] tracking-tight text-ink",
                      current.id === "contact" ? "text-[1.9rem] sm:text-[2.35rem]" : "text-[1.5rem] sm:text-[1.8rem]",
                    )}
                  >
                    {title}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">{current.desc}</p>
                </div>

                {current.id === "schedule" && (
                  <SchedulePicker
                    timeZone={values.timeZone || detectTimeZone()}
                    onTimeZoneChange={(tz) => {
                      setValue("timeZone", tz, { shouldValidate: true });
                      // Same instant, new zone — so what the visitor "sees"
                      // has to be restated, or later screens would quote the
                      // slot's old wall-clock reading against the new zone.
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
                    // summary and the emails can quote what they saw.
                    onSelect={({ slotUtc, dateKey, timeKey }) => {
                      setValue("slotUtc", slotUtc, { shouldValidate: true });
                      setValue("preferredDate", dateKey, { shouldValidate: true });
                      setValue("preferredTime", timeKey, { shouldValidate: true });
                    }}
                  />
                )}

                {current.id === "contact" && (
                  <div className="flex flex-col gap-3">
                    <FloatingInput
                      registration={register("fullName")}
                      type="text"
                      label="Your name"
                      placeholder="Your name"
                      error={bookingFieldIssue("fullName", values) ?? errors.fullName?.message}
                      autoFocus={autoFocusStep}
                      autoComplete="name"
                      onKeyDown={handleEnter}
                      compact
                    />
                    <FloatingInput
                      registration={register("email")}
                      type="email"
                      label="Work email"
                      placeholder="you@company.com"
                      error={bookingFieldIssue("email", values) ?? errors.email?.message}
                      autoComplete="email"
                      onKeyDown={handleEnter}
                      compact
                    />
                  </div>
                )}

                {current.id === "prepare" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                        Site to audit
                      </p>
                      <FloatingInput
                        registration={register("website", { onBlur: normalizeSite })}
                        type="text"
                        label="Site to audit"
                        placeholder="acme.com"
                        error={bookingFieldIssue("website", values) ?? errors.website?.message}
                        autoComplete="url"
                        onKeyDown={handleEnter}
                        compact
                      />
                    </div>
                    {PREPARE_QUESTIONS.map((q) => (
                      <div key={q.field} role="group" aria-label={q.label}>
                        <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                          {q.label}
                          {q.multi && <span className="ml-1 normal-case tracking-normal">· pick any</span>}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map((opt) => {
                            const v = values[q.field];
                            const selected = Array.isArray(v) ? v.includes(opt) : v === opt;
                            return (
                              <ReviewPill
                                key={opt}
                                label={opt}
                                selected={selected}
                                onClick={() => pick(q.field, opt, q.multi)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {isLast ? (
            <div className="relative z-10 flex shrink-0 flex-col gap-1 pt-2">
              <Turnstile onToken={(t) => (botToken.current = t)} resetSignal={botReset} />
              <SubmitRow
                isSubmitting={isSubmitting}
                status={status}
                label="Book call"
                successMsg="Request sent — we'll confirm your slot shortly."
                errorMsg={errorMsg}
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="focus-no-outline inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:text-ink"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={skipAndBook}
                  disabled={isSubmitting}
                  className="focus-no-outline rounded-full px-2 py-1.5 text-xs font-semibold text-ink underline decoration-ink-soft/40 underline-offset-4 transition-colors hover:decoration-ink focus-visible:decoration-ink disabled:opacity-50"
                >
                  Skip &amp; book
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className={cn("btn-outline group min-w-[10.5rem]", step === 0 && "invisible")}
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  // Exclusive, never stacked — .btn-outline's `background`
                  // shorthand would wipe .btn-brand's gradient.
                  !canContinue ? "btn-outline" : "btn-brand",
                  "group min-w-[10.5rem]",
                  !canContinue && "cursor-not-allowed",
                )}
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </>
      )}
    </form>
  );
}

function QuickChatPanel({ onBookCall }: { onBookCall: () => void }) {
  /** Which channel's value was last copied — cleared on a timer so both cards
   * share one "Copied" state without fighting each other. */
  const [copied, setCopied] = useState<"whatsapp" | "email" | null>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const waRaw = formatPhone(footer.contact.whatsapp);
  const email = footer.contact.email;

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
          href={whatsappHref(siteGreeting(pathname))}
          onOpen={() => trackEvent("quick_question_click", { channel: "whatsapp" })}
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
          onOpen={() => trackEvent("quick_question_click", { channel: "email" })}
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
            <span className="text-xs font-semibold text-ink-soft">We reply</span>
            <span className="font-avenir text-lg font-extrabold leading-tight text-blue">within 12 hours</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 sm:pl-4">
          <span className="text-xs font-semibold text-ink-soft">Replies come</span>
          <span className="font-avenir text-2xl font-extrabold leading-tight text-ink">7 days a week</span>
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
          onClick={() => {
            trackEvent("cta_click", { cta: "book", src: "contact-quick-question" });
            onBookCall();
          }}
          className="btn-brand btn-sm group shrink-0"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          {ctas.book.label}
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
  onOpen,
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
  onOpen: () => void;
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
        onClick={onOpen}
        className="relative mt-auto flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-white/[0.14]"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </motion.div>
  );
}
