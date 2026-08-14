import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingSchema } from "@/lib/schema";
import { renderConfirmationEmail, toTitleCase } from "@/lib/email";
import {
  AVAILABILITY,
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
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "hello@matterpixel.com";
const CONFIRMATION_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Matterpixel <${FROM_ADDRESS}>`;
const CONFIRMATION_CC_EMAIL = process.env.CONTACT_CC_EMAIL || "adib@matterpixel.com";

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    logger.warn("book.rate_limited", { ip });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
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

  if (!process.env.RESEND_API_KEY) {
    logger.error("book.missing_api_key", { ip });
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 500 },
    );
  }

  try {
    const resend = getResendClient();

    const { html, text } = renderConfirmationEmail({
      heading: "We've got your call request.",
      intro:
        "Thanks for reaching us — your query is very important to us. We'll be reverting to you in a very short time.",
      rows: [
        ["Name", data.fullName],
        ["Email", data.email],
        ["WhatsApp", data.whatsapp],
        ["Company", data.company],
        ["Website", data.website],
        ["Role", data.role],
        ["Audit Focus", data.auditFocus.join(", ")],
        ["Biggest Challenge", data.challenge],
        ["Budget", data.budget],
        ["Timeline", data.timeline],
        ["Preferred Slot", slotLocal],
        ["Slot (UTC)", slotUtcLabel],
        ["Notes", data.notes],
      ],
      closing: `${AVAILABILITY.callsLong} We'll confirm shortly and send over a Google Meet link.`,
    });

    const confirmation = await resend.emails.send({
      from: CONFIRMATION_FROM_EMAIL,
      to: data.email,
      cc: CONFIRMATION_CC_EMAIL,
      replyTo: FROM_ADDRESS,
      subject: `Thank You for Reaching Out, ${toTitleCase(data.fullName)} | Matterpixel`,
      html,
      text,
    });

    if (confirmation.error) {
      logger.error("book.send_failed", { ip, error: confirmation.error.message });
      return NextResponse.json(
        { ok: false, error: "Something went wrong. Please try again shortly." },
        { status: 502 },
      );
    }

    logger.info("book.received", { ip, email: data.email, messageId: confirmation.data?.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("book.unexpected_error", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 500 },
    );
  }
}
