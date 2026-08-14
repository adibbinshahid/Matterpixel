function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EmailDetailRow = [label: string, value: string | null | undefined];

/** "jane VAN doe" -> "Jane Van Doe" — for names dropped into a subject line,
 * where inconsistent visitor casing (all-caps, all-lower) reads as unpolished. */
export function toTitleCase(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Renders a client-facing confirmation as a clean, table-based HTML email
 * (inline styles only — most mail clients strip <style> blocks) alongside a
 * plain-text fallback, so the visitor gets a professional-looking copy of
 * exactly what they submitted. */
export function renderConfirmationEmail(options: {
  heading: string;
  intro: string;
  rows: EmailDetailRow[];
  closing: string;
}): { html: string; text: string } {
  const { heading, intro, rows, closing } = options;
  const visibleRows = rows.filter(([, value]) => !!value?.trim());

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
  <div style="padding: 32px 0 24px;">
    <span style="font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a21caf;">Matterpixel</span>
  </div>
  <h1 style="font-size: 22px; margin: 0 0 16px; color: #111;">${escapeHtml(heading)}</h1>
  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #333;">${escapeHtml(intro)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
    <tbody>
      ${visibleRows
        .map(
          ([label, value], i) => `
      <tr style="background: ${i % 2 === 0 ? "#fafafa" : "#ffffff"};">
        <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; color: #888; white-space: nowrap; vertical-align: top; border-bottom: 1px solid #eee;">${escapeHtml(label)}</td>
        <td style="padding: 10px 14px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #eee; white-space: pre-wrap;">${escapeHtml(value ?? "")}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0; color: #333;">${escapeHtml(closing)}</p>
  <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0; color: #333;">Talk soon,<br />The Matterpixel team</p>
</div>`.trim();

  const text = [
    heading,
    "",
    intro,
    "",
    ...visibleRows.map(([label, value]) => `${label}: ${value}`),
    "",
    closing,
    "",
    "Talk soon,",
    "The Matterpixel team",
  ].join("\n");

  return { html, text };
}
