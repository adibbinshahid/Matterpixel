import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingSchema } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@matterpixel.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Matterpixel <hello@matterpixel.com>";

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
    const notification = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: data.email,
      subject: `Discovery call request from ${data.fullName}`,
      text: [
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Preferred date: ${data.preferredDate}`,
        `Preferred time: ${data.preferredTime}`,
        `Time zone: ${data.timeZone}`,
      ].join("\n"),
    });

    if (notification.error) {
      logger.error("book.send_failed", { ip, error: notification.error.message });
      return NextResponse.json(
        { ok: false, error: "Something went wrong. Please try again shortly." },
        { status: 502 },
      );
    }

    logger.info("book.received", { ip, email: data.email, messageId: notification.data?.id });

    const confirmation = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "We've got your call request — Matterpixel",
      text: [
        `Hi ${data.fullName},`,
        "",
        "Thanks for requesting a discovery call. We've noted your preferred slot:",
        `${data.preferredDate} at ${data.preferredTime} (${data.timeZone})`,
        "",
        "We'll confirm shortly and send over a Google Meet link.",
        "",
        "Talk soon,",
        "The Matterpixel team",
      ].join("\n"),
    });

    if (confirmation.error) {
      logger.warn("book.confirmation_failed", { ip, error: confirmation.error.message });
    }

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
