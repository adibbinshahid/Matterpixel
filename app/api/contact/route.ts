import { NextResponse } from "next/server";
import { Resend } from "resend";
import { inquirySchema, normalizeWebsite } from "@/lib/schema";
import { logger } from "@/lib/logger";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "no-reply@matterpixel.com";
const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "hello@matterpixel.com";
const CONFIRMATION_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Matterpixel <${FROM_ADDRESS}>`;

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
    const notification = await resend.emails.send({
      from: `${data.fullName} via Matterpixel <${FROM_ADDRESS}>`,
      to: TO_EMAIL,
      replyTo: data.workEmail,
      subject: `New project inquiry from ${data.fullName}`,
      text: [
        `Name: ${data.fullName}`,
        `Email: ${data.workEmail}`,
        data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null,
        data.company ? `Company: ${data.company}` : null,
        data.website ? `Website: ${normalizeWebsite(data.website)}` : null,
        `Budget: ${data.budget}`,
        `Timeline: ${data.timeline}`,
        `Project Type: ${data.projectType}`,
        `Services: ${data.serviceTypes.join(", ")}`,
        `Goals: ${data.projectGoals.join(", ")}`,
        data.otherGoalDetails ? `Other goal details: ${data.otherGoalDetails}` : null,
        "",
        "Project details:",
        data.projectDetails,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (notification.error) {
      logger.error("contact.send_failed", { ip, error: notification.error.message });
      return NextResponse.json(
        { ok: false, error: "Something went wrong. Please try again shortly." },
        { status: 502 },
      );
    }

    logger.info("contact.received", { ip, email: data.workEmail, messageId: notification.data?.id });

    const confirmation = await resend.emails.send({
      from: CONFIRMATION_FROM_EMAIL,
      to: data.workEmail,
      subject: "We've got your message — Matterpixel",
      text: [
        `Hi ${data.fullName},`,
        "",
        "Thanks for reaching out to Matterpixel. We've received your project details and will reply within 24 hours.",
        "",
        "Here's a copy of what you sent us:",
        `Budget: ${data.budget}`,
        `Timeline: ${data.timeline}`,
        `Project Type: ${data.projectType}`,
        `Services: ${data.serviceTypes.join(", ")}`,
        `Goals: ${data.projectGoals.join(", ")}`,
        data.projectDetails,
        "",
        "Talk soon,",
        "The Matterpixel team",
      ].join("\n"),
    });

    if (confirmation.error) {
      // Visitor's inquiry is already in — a failed courtesy email shouldn't
      // surface as a submission failure.
      logger.warn("contact.confirmation_failed", { ip, error: confirmation.error.message });
    }

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
