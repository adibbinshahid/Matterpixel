import { NextResponse } from "next/server";
import { Resend } from "resend";
import { inquirySchema, normalizeWebsite } from "@/lib/schema";
import { renderConfirmationEmail, toTitleCase } from "@/lib/email";
import { logger } from "@/lib/logger";
import { guardFormRequest, isEmailRateLimited } from "@/lib/apiGuard";
import { tokenFrom, verifyTurnstile } from "@/lib/turnstile";

const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "hello@matterpixel.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || `Matterpixel <${FROM_ADDRESS}>`;
/** Where new leads land. CONTACT_CC_EMAIL is the older name for the same
 * inbox, still honoured so existing deployments keep working. */
const NOTIFY_EMAIL =
  process.env.CONTACT_NOTIFY_EMAIL || process.env.CONTACT_CC_EMAIL || "adib@matterpixel.com";

// Constructed lazily (only once we know the key exists) — the Resend
// constructor throws synchronously on a missing key, which would otherwise
// crash the route at module load instead of returning a clean 500.
let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const GENERIC_ERROR = "Something went wrong. Please try again shortly.";

export async function POST(request: Request) {
  const guard = await guardFormRequest(request, "contact");
  if (!guard.ok) return guard.response;
  const { ip, body } = guard;

  if (!(await verifyTurnstile(tokenFrom(body), ip))) {
    logger.warn("contact.bot_check_failed", { ip });
    return NextResponse.json(
      { ok: false, error: "We couldn't confirm you're not a bot. Please refresh the page and try again." },
      { status: 403 },
    );
  }

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

  if (isEmailRateLimited("contact", data.workEmail)) {
    logger.warn("contact.email_rate_limited", { ip });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    logger.error("contact.missing_api_key", { ip });
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }

  try {
    const resend = getResendClient();

    // 1. The lead, to Adib. Sent first and on its own, so a visitor's
    //    mistyped or bouncing address can never cost us the inquiry.
    //    Reply-to is the visitor: hitting reply answers them directly.
    const lead = renderConfirmationEmail({
      heading: `New project inquiry from ${toTitleCase(data.fullName)}`,
      intro: "Submitted through the project form on matterpixel.com.",
      rows: [
        ["Name", data.fullName],
        ["Work Email", data.workEmail],
        ["WhatsApp", data.whatsapp],
        ["Company", data.company],
        ["Website", data.website ? normalizeWebsite(data.website) : undefined],
        ["Selection", data.selection],
        ["Project Type", data.projectTypes.join(", ")],
        ["Budget", data.budget],
        ["Project Details", data.projectDetails],
        ["Source", data.src],
      ],
      closing: "Reply to this email to answer the visitor directly.",
      signoff: false,
    });

    const notification = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.workEmail,
      subject: `New inquiry: ${toTitleCase(data.fullName).slice(0, 60)}`,
      html: lead.html,
      text: lead.text,
    });

    if (notification.error) {
      logger.error("contact.notify_failed", { ip, error: notification.error.message });
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
    }

    // 2. A receipt to the visitor. Deliberately carries nothing the visitor
    //    typed — a form that echoes free text to any address it is given is
    //    a spam relay on our domain. A failure here is logged, not surfaced:
    //    the lead is already safe.
    const receipt = renderConfirmationEmail({
      heading: "Thanks, we've got your project brief.",
      intro:
        "Adib reads every brief personally and will reply within 12 hours with next steps, usually a short call or a fixed quote.",
      rows: [],
      closing:
        "If you think of anything to add (links, files, deadlines), just reply to this email.",
    });

    const confirmation = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.workEmail,
      replyTo: FROM_ADDRESS,
      subject: "We've got your project brief | Matterpixel",
      html: receipt.html,
      text: receipt.text,
    });

    if (confirmation.error) {
      logger.warn("contact.receipt_failed", { ip, error: confirmation.error.message });
    }

    logger.info("contact.received", { ip, src: data.src, messageId: notification.data?.id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("contact.unexpected_error", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }
}
