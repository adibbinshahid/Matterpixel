"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { ArrowRight, Calendar, Check, Copy, Mail, MessageCircle, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import {
  inquirySchema,
  bookingSchema,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  type InquiryValues,
  type BookingValues,
} from "@/lib/schema";
import { services } from "@/content/services";
import { footer } from "@/content/siteConfig";
import { cn, EASE, DURATIONS } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

const TIMEZONES = [
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
    label: "Send a Detailed Inquiry",
    blurb: "Full project brief",
    icon: Send,
  },
  {
    id: "booking",
    label: "Book a Discovery Call",
    blurb: "15-min intro, on the calendar",
    icon: Calendar,
  },
  {
    id: "chat",
    label: "Quick Chat",
    blurb: "WhatsApp or email",
    icon: MessageCircle,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const panelVariants: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: DURATIONS.quick, ease: EASE } },
  exit: { opacity: 0, x: -16, transition: { duration: DURATIONS.quick * 0.7, ease: EASE } },
};

/**
 * /contact — premium split-screen: a vertical tab rail on the left picks
 * between three contact modes, the right pane fade+slides between them.
 * Sized to fit a single laptop viewport (no internal-flow scroll needed
 * on ~1440x900+; the right pane falls back to its own scroll on shorter
 * screens rather than growing the page).
 */
export function ContactSplit() {
  const [active, setActive] = useState<TabId>("inquiry");
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  return (
    <section
      data-nav-scrim="light"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-paper px-6 pb-10 pt-32 sm:px-8 lg:px-12"
    >
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

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <div className="mb-6 lg:mb-8">
          <p
            className="label-eyebrow mb-3 opacity-90"
            style={{ color: "var(--paper)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            Contact
          </p>
          <h1
            id="email"
            className="scroll-mt-32 whitespace-nowrap text-[clamp(1.05rem,3.6vw,2.75rem)] font-extrabold leading-[1.05] tracking-tight text-paper"
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.5)" }}
          >
            Got something that <span className="text-magenta">matters?</span> Let&rsquo;s{" "}
            <span className="text-blue">build</span> it.
          </h1>
        </div>

        <div
          className="rounded-[2.25rem] bg-white/20 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_0_0_1px_rgba(255,255,255,0.25),0_45px_100px_-25px_rgba(0,0,0,0.6),0_15px_40px_-15px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 lg:h-[calc(100svh-19rem)] lg:max-h-[37rem] lg:min-h-[27rem]"
        >
          <div className="grid h-full grid-cols-1 overflow-hidden rounded-[1.875rem] border border-line bg-paper-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] lg:grid-cols-[300px_1fr]">
            <TabNav active={active} onSelect={setActive} />

            <div className="relative overflow-y-auto bg-paper p-6 sm:p-7 lg:p-8">
              <AnimatePresence mode="wait">
                {active === "inquiry" && (
                  <motion.div key="inquiry" variants={panelVariants} initial="initial" animate="animate" exit="exit">
                    <InquiryPanel />
                  </motion.div>
                )}
                {active === "booking" && (
                  <motion.div key="booking" variants={panelVariants} initial="initial" animate="animate" exit="exit">
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
                    className="flex h-full min-h-[20rem] items-center"
                  >
                    <QuickChatPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabNav({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  return (
    <nav className="flex flex-col gap-1.5 border-b border-line px-3 py-5 lg:border-b-0 lg:border-r lg:px-4 lg:pb-8 lg:pt-10">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-current={isActive}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors duration-300",
              isActive ? "text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="contact-tab-active"
                className="absolute inset-0 rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--line),0_10px_24px_-14px_rgba(0,0,0,0.3)]"
                transition={{ duration: DURATIONS.quick, ease: EASE }}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                isActive ? "bg-blue text-paper" : "bg-ink/5 text-ink-soft group-hover:bg-ink/10",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="relative z-10 flex min-w-0 flex-col">
              <span className="text-sm font-bold leading-tight">{tab.label}</span>
              <span className="text-xs text-ink-soft">{tab.blurb}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    "w-full rounded-lg border bg-paper-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:ring-2 focus:ring-blue/15",
    hasError ? "border-magenta" : "border-line focus:border-blue",
  );
}

function CField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
      {error && <span className="text-[0.7rem] font-semibold text-magenta">{error}</span>}
    </label>
  );
}

function SubmitRow({
  isSubmitting,
  status,
  label,
  successMsg,
}: {
  isSubmitting: boolean;
  status: "idle" | "success" | "error";
  label: string;
  successMsg: string;
}) {
  return (
    <div className="relative mt-1 flex flex-col items-center gap-2">
      <button
        type="submit"
        disabled={isSubmitting}
        className="hover-lift font-avenir group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-3 text-sm text-paper hover:bg-blue disabled:opacity-60"
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
    </div>
  );
}

function InquiryPanel() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({ resolver: zodResolver(inquirySchema) });

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
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2.5">
      {/* Honeypot — hidden from sighted and AT users, real visitors never fill it. */}
      <input
        {...register("hp")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        <CField label="Name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className={fieldClass(!!errors.fullName)}
          />
        </CField>
        <CField label="Work Email" error={errors.workEmail?.message}>
          <input
            {...register("workEmail")}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.workEmail}
            className={fieldClass(!!errors.workEmail)}
          />
        </CField>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <CField label="Company (optional)">
          <input {...register("company")} type="text" autoComplete="organization" className={fieldClass(false)} />
        </CField>
        <CField label="Website (optional)" error={errors.website?.message}>
          <input
            {...register("website")}
            type="text"
            placeholder="https://"
            aria-invalid={!!errors.website}
            className={fieldClass(!!errors.website)}
          />
        </CField>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <CField label="Budget" error={errors.budget?.message}>
          <select
            {...register("budget")}
            defaultValue=""
            aria-invalid={!!errors.budget}
            className={fieldClass(!!errors.budget)}
          >
            <option value="" disabled>
              Select a range
            </option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </CField>
        <CField label="Timeline" error={errors.timeline?.message}>
          <select
            {...register("timeline")}
            defaultValue=""
            aria-invalid={!!errors.timeline}
            className={fieldClass(!!errors.timeline)}
          >
            <option value="" disabled>
              Select a timeline
            </option>
            {TIMELINE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </CField>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">Services Needed</span>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {services.map((s) => (
            <label
              key={s.slug}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-paper-2 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors has-[:checked]:border-blue has-[:checked]:text-ink"
            >
              <input
                {...register("serviceTypes")}
                type="checkbox"
                value={s.title}
                className="h-3.5 w-3.5 shrink-0 accent-blue"
              />
              {s.title}
            </label>
          ))}
        </div>
        {errors.serviceTypes && (
          <span className="text-[0.7rem] font-semibold text-magenta">{errors.serviceTypes.message}</span>
        )}
      </div>

      <CField label="Project Details" error={errors.projectDetails?.message}>
        <textarea
          {...register("projectDetails")}
          rows={2}
          aria-invalid={!!errors.projectDetails}
          className={fieldClass(!!errors.projectDetails)}
        />
      </CField>

      <SubmitRow
        isSubmitting={isSubmitting}
        status={status}
        label="Send Inquiry"
        successMsg="Inquiry sent — we'll reply within 24 hours."
      />
    </form>
  );
}

function BookingPanel() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({ resolver: zodResolver(bookingSchema) });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setValue("timeZone", tz);
  }, [setValue]);

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
      reset();
    } catch {
      setStatus("error");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2.5">
      <input
        {...register("hp")}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        <CField label="Name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className={fieldClass(!!errors.fullName)}
          />
        </CField>
        <CField label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={fieldClass(!!errors.email)}
          />
        </CField>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <CField label="Preferred Date" error={errors.preferredDate?.message}>
          <input
            {...register("preferredDate")}
            type="date"
            min={todayStr}
            aria-invalid={!!errors.preferredDate}
            className={fieldClass(!!errors.preferredDate)}
          />
        </CField>
        <CField label="Preferred Time" error={errors.preferredTime?.message}>
          <input
            {...register("preferredTime")}
            type="time"
            aria-invalid={!!errors.preferredTime}
            className={fieldClass(!!errors.preferredTime)}
          />
        </CField>
      </div>

      <CField label="Time Zone" error={errors.timeZone?.message}>
        <select
          {...register("timeZone")}
          defaultValue=""
          aria-invalid={!!errors.timeZone}
          className={fieldClass(!!errors.timeZone)}
        >
          <option value="" disabled>
            Select time zone
          </option>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </CField>

      <p className="rounded-lg bg-paper-2 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
        A Google Meet link will be sent to your email once we confirm your slot.
      </p>

      <SubmitRow
        isSubmitting={isSubmitting}
        status={status}
        label="Request Call"
        successMsg="Request sent — we'll confirm your slot shortly."
      />
    </form>
  );
}

function QuickChatPanel() {
  const [copied, setCopied] = useState(false);
  const waNumber = footer.contact.whatsapp.replace(/[^\d]/g, "");
  const email = "info@matterpixel.com";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — the email is still selectable as text.
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 text-center">
      <a
        href={`https://wa.me/${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-lift font-avenir group inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-[0_20px_45px_-18px_rgba(37,211,102,0.6)]"
      >
        <SiWhatsapp className="h-5 w-5" aria-hidden="true" />
        Chat on WhatsApp
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </a>

      <button
        type="button"
        onClick={copyEmail}
        className="group inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-blue"
      >
        <Mail className="h-4 w-4 text-ink-soft" aria-hidden="true" />
        {email}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-blue" /> : <Copy className="h-3.5 w-3.5 text-ink-soft" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <p className="text-xs font-semibold text-ink-soft">Usually replies within 24 hours</p>
    </div>
  );
}
