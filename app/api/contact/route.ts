import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // TODO(email): wire up transactional email delivery — e.g. Resend
  // (https://resend.com) or Nodemailer — using parsed.data below.
  // Example with Resend:
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "Matterpixel <hello@matterpixel.com>",
  //     to: "hello@matterpixel.com",
  //     subject: `New project inquiry from ${parsed.data.name}`,
  //     text: parsed.data.message,
  //   });
  console.log("[contact] new inquiry", parsed.data);

  return NextResponse.json({ ok: true });
}
