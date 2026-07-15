"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { contactSchema, type ContactValues } from "@/lib/schema";
import { services } from "@/content/services";
import { cn, EASE } from "@/lib/utils";

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return {
    x: Math.cos(angle) * (60 + Math.random() * 40),
    y: Math.sin(angle) * (60 + Math.random() * 40),
    color: i % 2 === 0 ? "var(--blue)" : "var(--magenta)",
  };
});

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactValues) => {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Full Name"
          error={errors.fullName?.message}
          input={
            <input
              {...register("fullName")}
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={fieldClass(!!errors.fullName)}
            />
          }
          errorId="fullName-error"
        />
        <Field
          label="Email"
          error={errors.email?.message}
          input={
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={fieldClass(!!errors.email)}
            />
          }
          errorId="email-error"
        />
      </div>

      <Field
        label="WhatsApp Number"
        error={errors.whatsapp?.message}
        input={
          <input
            {...register("whatsapp")}
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.whatsapp}
            aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
            className={fieldClass(!!errors.whatsapp)}
          />
        }
        errorId="whatsapp-error"
      />

      <div className="flex flex-col gap-1.5 text-sm font-bold text-ink">
        Service Types
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {services.map((s) => (
            <label
              key={s.slug}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-soft/30 bg-paper px-3 py-2 text-sm font-normal text-ink-soft transition-colors has-[:checked]:border-blue has-[:checked]:text-ink"
            >
              <input
                {...register("serviceTypes")}
                type="checkbox"
                value={s.title}
                className="h-4 w-4 shrink-0 accent-blue"
              />
              {s.title}
            </label>
          ))}
        </div>
        {errors.serviceTypes && (
          <span className="text-xs font-semibold text-magenta">{errors.serviceTypes.message}</span>
        )}
      </div>

      <Field
        label="Project Details"
        error={errors.projectDetails?.message}
        input={
          <textarea
            {...register("projectDetails")}
            rows={2}
            aria-invalid={!!errors.projectDetails}
            aria-describedby={errors.projectDetails ? "projectDetails-error" : undefined}
            className={fieldClass(!!errors.projectDetails)}
          />
        }
        errorId="projectDetails-error"
      />

      <div className="relative mt-1 flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-avenir group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm text-paper transition-all duration-300 hover:scale-[1.02] hover:bg-blue disabled:opacity-60 disabled:hover:scale-100"
        >
          {isSubmitting ? "Sending…" : "Send it over"}
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
              className="flex items-center gap-1.5 text-sm font-semibold text-blue"
              role="status"
            >
              <Check className="h-4 w-4" /> Message sent — we&rsquo;ll reply soon.
            </motion.span>
          )}
          {status === "error" && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-semibold text-magenta"
              role="alert"
            >
              Something went wrong — try again.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

function fieldClass(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-paper px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-soft/50",
    hasError ? "border-magenta" : "border-ink-soft/30 focus:border-blue",
  );
}

function Field({
  label,
  input,
  error,
  errorId,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
  errorId: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
      {label}
      {input}
      {error && (
        <span id={errorId} className="text-xs font-semibold text-magenta">
          {error}
        </span>
      )}
    </label>
  );
}
