import { NextResponse } from "next/server";
import { HORIZON_DAYS } from "@/lib/availability";
import { calendarConfigIssues, getBusy, isCalendarConnected } from "@/lib/googleCalendar";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * Busy times on Adib's calendar for the booking scheduler, from now to the
 * booking horizon. Returns only start/end pairs — never titles or details.
 * Cached at the edge for a minute so a busy contact page costs Google at
 * most one call a minute.
 */
export async function GET() {
  if (!isCalendarConnected()) {
    const issues = calendarConfigIssues();
    // All three unset means the feature is simply off; a partial setup is
    // a mistake worth surfacing in the logs.
    if (issues.length < 3) logger.warn("availability.calendar_not_configured", { issues });
    return NextResponse.json({ connected: false, busy: [] });
  }
  const from = new Date();
  const to = new Date(from.getTime() + (HORIZON_DAYS + 1) * 24 * 60 * 60_000);
  try {
    const busy = await getBusy(from, to);
    return NextResponse.json(
      { connected: true, busy },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120" } },
    );
  } catch (error) {
    logger.error("availability.calendar_failed", { error: error instanceof Error ? error.message : String(error) });
    // Fail open: the booking route re-checks the slot before accepting it.
    return NextResponse.json({ connected: false, busy: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
