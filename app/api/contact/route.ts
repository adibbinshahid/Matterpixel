import { NextResponse } from "next/server";
import { Resend } from "resend";
import { inquirySchema, normalizeWebsite } from "@/lib/schema";
import { renderConfirmationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "hello@matterpixel.com";
const CONFIRMATION_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Matterpixel <${FROM_ADDRESS}>`;
const CONFIRMATION_CC_EMAIL = process.env.CONTACT_CC_EMAIL || "adib@matterpixel.com";

// Constructed lazily (only once we know the key exists) — the Resend
// constructor throws synchronously on a missing key, which would otherwise
// crash the route at module load instead of returning a clean 500.
let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    logger.warn("contact.rate_limited", { ip });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    logger.warn("contact.validation_failed", { ip });
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { hp, ...data } = parsed.data;

  // Honeypot tripped — pretend success so the bot doesn't learn to adapt,
  // but never send mail or count this as a real inquiry.
  if (hp) {
    logger.warn("contact.honeypot_triggered", { ip });
    return NextResponse.json({ ok: true });
  }

  if (!process.env.RESEND_API_KEY) {
    logger.error("contact.missing_api_key", { ip });
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 500 },
    );
  }

  try {
    const resend = getResendClient();

    const { html, text } = renderConfirmationEmail({
      heading: "We've got your message.",
      intro:
        "Thanks for reaching us — your query is very important to us. We'll be reverting to you in a very short time.",
      rows: [
        ["Name", data.fullName],
        ["Work Email", data.workEmail],
        ["WhatsApp", data.whatsapp],
        ["Company", data.company],
        ["Website", data.website ? normalizeWebsite(data.website) : undefined],
        ["Budget", data.budget],
        ["Timeline", data.timeline],
        ["Project Type", data.projectType],
        ["Services", data.serviceTypes.join(", ")],
        ["Goals", data.projectGoals.join(", ")],
        ["Other Goal Details", data.otherGoalDetails],
        ["Project Details", data.projectDetails],
      ],
      closing: "We'll review your requirements and get back to you within 24 hours.",
    });

    const confirmation = await resend.emails.send({
      from: CONFIRMATION_FROM_EMAIL,
      to: data.workEmail,
      cc: CONFIRMATION_CC_EMAIL,
      replyTo: FROM_ADDRESS,
      subject: "We've got your message — Matterpixel",
      html,
      text,
    });

    if (confirmation.error) {
      logger.error("contact.send_failed", { ip, error: confirmation.error.message });
      return NextResponse.json(
        { ok: false, error: "Something went wrong. Please try again shortly." },
        { status: 502 },
      );
    }

    logger.info("contact.received", { ip, email: data.workEmail, messageId: confirmation.data?.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("contact.unexpected_error", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 500 },
    );
  }
}
