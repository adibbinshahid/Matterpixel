import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingSchema } from "@/lib/schema";
import { renderConfirmationEmail, toTitleCase } from "@/lib/email";
import { buildCallInvite } from "@/lib/ics";
import { createBookingEvent, isSlotBusy } from "@/lib/googleCalendar";
import {
  CALL_MINUTES,
  HORIZON_DAYS,
  LEAD_TIME_MINUTES,
  formatSlotDate,
  formatSlotTime,
  isOnSlotGrain,
  isValidTimeZone,
  isWithinCallWindow,
  zoneOffsetLabel,
} from "@/lib/availability";
import { logger } from "@/lib/logger";
import { guardFormRequest, isEmailRateLimited } from "@/lib/apiGuard";
import { tokenFrom, verifyTurnstile } from "@/lib/turnstile";

const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "hello@matterpixel.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Matterpixel <${FROM_ADDRESS}>`;
/** Where new bookings land (CONTACT_CC_EMAIL is the older name). */
const NOTIFY_EMAIL =
  process.env.CONTACT_NOTIFY_EMAIL || process.env.CONTACT_CC_EMAIL || "adib@matterpixel.com";
const GENERIC_ERROR = "Something went wrong. Please try again shortly.";

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function POST(request: Request) {
  const guard = await guardFormRequest(request, "book");
  if (!guard.ok) return guard.response;
  const { ip, body } = guard;

  if (!(await verifyTurnstile(tokenFrom(body), ip))) {
    logger.warn("book.bot_check_failed", { ip });
    return NextResponse.json(
      { ok: false, error: "We couldn't confirm you're not a bot. Please refresh the page and try again." },
      { status: 403 },
    );
  }

  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("book.validation_failed", { ip });
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { hp, ...data } = parsed.data;

  // Everything downstream quotes the slot twice: once as the visitor read it,
  // once in UTC. A booking that only carries a wall clock is a booking nobody
  // can put in a calendar with confidence.
  const slot = new Date(data.slotUtc);

  // The calendar already refuses closed hours, but the calendar is client
  // code — a posted body can name any instant it likes, and a request for
  // 04:00 UTC on a Monday is not a slot we have.
  if (
    !isWithinCallWindow(slot) ||
    // A slot the calendar never offered: the window rule alone would accept
    // 7:07 PM, and every label downstream assumes a clean half hour.
    !isOnSlotGrain(slot) ||
    slot.getTime() < Date.now() + LEAD_TIME_MINUTES * 60_000 ||
    slot.getTime() > Date.now() + HORIZON_DAYS * 24 * 60 * 60_000
  ) {
    logger.warn("book.slot_outside_window", { ip, slot: data.slotUtc });
    return NextResponse.json(
      { ok: false, error: "That time isn't available. Please pick another slot." },
      { status: 400 },
    );
  }

  // Formatting with a zone `Intl` doesn't know throws, so an arbitrary string
  // in the body would otherwise surface as a 500 rather than a 400.
  if (!isValidTimeZone(data.timeZone)) {
    logger.warn("book.invalid_timezone", { ip, timeZone: data.timeZone });
    return NextResponse.json(
      { ok: false, error: "That time zone isn't one we recognise. Please pick another." },
      { status: 400 },
    );
  }

  const slotLocal = `${formatSlotDate(slot, data.timeZone)} at ${formatSlotTime(slot, data.timeZone)} (${data.timeZone}, ${zoneOffsetLabel(data.timeZone, slot)})`;
  const slotUtcLabel = `${formatSlotDate(slot, "UTC")} at ${formatSlotTime(slot, "UTC")} UTC`;

  // Honeypot tripped — pretend success so the bot doesn't learn to adapt,
  // but never send mail or count this as a real request.
  if (hp) {
    logger.warn("book.honeypot_triggered", { ip });
    return NextResponse.json({ ok: true });
  }

  // The calendar may have filled since the visitor loaded the page (or
  // another visitor just took this slot). A calendar outage doesn't block
  // the booking — Adib still confirms every request by hand.
  try {
    if (await isSlotBusy(slot, CALL_MINUTES)) {
      logger.warn("book.slot_taken", { ip, slot: data.slotUtc });
      return NextResponse.json(
        { ok: false, error: "That time was just taken. Please pick another slot." },
        { status: 409 },
      );
    }
  } catch (error) {
    logger.error("book.calendar_check_failed", { ip, error: error instanceof Error ? error.message : String(error) });
  }

  if (isEmailRateLimited("book", data.email)) {
    logger.warn("book.email_rate_limited", { ip });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    logger.error("book.missing_api_key", { ip });
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }

  try {
    const resend = getResendClient();

    // 1. The request, to Adib, with a calendar invite attached so it lands
    //    in the calendar in one click. Sent first and on its own so a
    //    visitor's bouncing address can never cost us the booking.
    const lead = renderConfirmationEmail({
      heading: `Audit call request from ${toTitleCase(data.fullName)}`,
      intro: `Requested slot: ${slotLocal}. Confirm it and send a Google Meet link.`,
      rows: [
        ["Call", `Free audit call (${CALL_MINUTES} min)`],
        ["Name", data.fullName],
        ["Email", data.email],
        ["WhatsApp", data.whatsapp],
        ["Company", data.company],
        ["Website", data.website],
        ["Role", data.role],
        ["Audit Focus", data.auditFocus?.join(", ")],
        ["Biggest Challenge", data.challenge],
        ["Budget", data.budget],
        ["Timeline", data.timeline],
        ["Preferred Slot", slotLocal],
        ["Slot (UTC)", slotUtcLabel],
        ["Notes", data.notes],
        ["Source", data.src],
      ],
      closing: "Reply to this email to answer the visitor directly.",
      signoff: false,
    });

    const notification = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.email,
      subject: `Audit call request: ${toTitleCase(data.fullName).slice(0, 60)}, ${slotUtcLabel}`,
      html: lead.html,
      text: lead.text,
      attachments: [
        {
          filename: "audit-call.ics",
          content: Buffer.from(
            buildCallInvite({
              start: slot,
              minutes: CALL_MINUTES,
              summary: `Matterpixel audit call: ${toTitleCase(data.fullName).slice(0, 60)}`,
              description: `Free audit call requested on matterpixel.com.\nVisitor: ${data.email}`,
            }),
          ).toString("base64"),
        },
      ],
    });

    if (notification.error) {
      logger.error("book.notify_failed", { ip, error: notification.error.message });
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
    }

    // Hold the slot on the calendar so it reads busy for the next visitor.
    await createBookingEvent({
      start: slot,
      minutes: CALL_MINUTES,
      summary: `Audit call (requested): ${toTitleCase(data.fullName).slice(0, 60)}`,
      description: `Requested on matterpixel.com. Confirm and send a Meet link.\nVisitor: ${data.email}`,
    }).catch((error) =>
      logger.error("book.calendar_insert_failed", { ip, error: error instanceof Error ? error.message : String(error) }),
    );

    // 2. A receipt to the visitor. Only server-formatted values (the slot
    //    we validated above) — nothing the visitor typed, so this can't be
    //    used to send arbitrary text from our domain.
    const receipt = renderConfirmationEmail({
      heading: "Your audit call request is in.",
      intro:
        "Adib will confirm the time within 12 hours and send a Google Meet link. If the slot no longer works, he'll suggest the nearest one.",
      rows: [
        ["Call", `Free audit call (${CALL_MINUTES} min)`],
        ["Requested time", slotLocal],
      ],
      closing: "Anything you'd like covered on the call? Just reply to this email.",
    });

    const confirmation = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: FROM_ADDRESS,
      subject: "Your audit call request | Matterpixel",
      html: receipt.html,
      text: receipt.text,
    });

    if (confirmation.error) {
      logger.warn("book.receipt_failed", { ip, error: confirmation.error.message });
    }

    logger.info("book.received", { ip, src: data.src, messageId: notification.data?.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("book.unexpected_error", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }
}
