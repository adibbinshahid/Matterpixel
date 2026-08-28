/**
 * Re-captures the phone screenshot beside each case study, at the real
 * 390x844 iPhone viewport (DPR 2 -> 780x1688, the exact size <PhoneFrame>
 * is fed in app/projects/[slug]/page.tsx).
 *
 * The demos carry floating widgets that only make sense to a live visitor —
 * the "Experience the Admin Panel" pill, Scentora's chat launcher and its
 * red "dummy website" banner, the pizza site's WhatsApp button. Baked into
 * a still they read as clutter sitting on top of the work, and on some
 * captures they land straight over a section heading. They are hidden here
 * rather than cropped out, so the layout underneath closes up properly.
 *
 * Run: npx tsx scripts/capture-mobile.ts
 */
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SITES = [
  { slug: "shopsphere", url: "https://shopsphere.matterpixel.com" },
  { slug: "mindwell", url: "https://mindwell.matterpixel.com" },
  { slug: "lcinco-pizza", url: "https://pizza.matterpixel.com" },
  { slug: "scentora", url: "https://scentora.matterpixel.com" },
];

/** Demo-only chrome: live-visitor affordances that are noise in a still. */
const HIDE_SELECTORS = [
  ".floating-cta-stack",
  ".admin-btn",
  ".whatsapp-btn",
  ".cart-overlay",
  ".cart-sidebar",
  ".lightbox-overlay",
  ".lightbox-close",
  ".lightbox-arrow",
  "[class*='z-[9990]']",
  "[class*='z-[9985]']",
];

/** Matched against innerText for widgets that carry no stable class. */
const HIDE_TEXT = ["EXPERIENCE THE", "Chat with Assistant", "DUMMY WEBSITE"];

(async () => {
  const browser = await chromium.launch();
  const scratch = mkdtempSync(join(tmpdir(), "mp-shots-"));

  for (const { slug, url } of SITES) {
    const ctx = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    // "load", not "networkidle": two of the demos keep a connection open
    // (analytics, a chat widget) and never go idle.
    await page.goto(url, { waitUntil: "load", timeout: 90_000 });

    await page.addStyleTag({
      content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}`,
    });

    // The floating widgets mount after hydration, so let them appear before
    // going looking for them.
    await page.waitForTimeout(4000);

    // Passed as source text, not a function: tsx compiles this file with
    // esbuild's keepNames on, which rewrites nested functions to reference a
    // `__name` helper that does not exist inside the page.
    await page.evaluate(`
      (() => {
        const selectors = ${JSON.stringify(HIDE_SELECTORS)};
        const texts = ${JSON.stringify(HIDE_TEXT)}.map((t) => t.toUpperCase());
        for (const s of selectors) {
          for (const el of document.querySelectorAll(s)) el.style.display = "none";
        }
        for (const el of document.querySelectorAll("body *")) {
          if (getComputedStyle(el).position !== "fixed") continue;
          const t = (el.innerText || "").replace(/\\s+/g, " ").trim().toUpperCase();
          if (texts.some((needle) => t.includes(needle))) el.style.display = "none";
        }
      })()
    `);

    // Settle the reflow left behind by hiding them.
    await page.waitForTimeout(1000);

    // The pizza demo overflows its own viewport horizontally on a phone. Left
    // alone, Chromium zooms the page out to fit and the 390px clip below then
    // lands on a fraction of a wider layout — which is how the previous
    // captures ended up with a half-cut nav and a sliced feature strip. The
    // guard is applied only when the document actually overflows, because
    // `overflow-x: hidden` on the root turns off `position: sticky` for the
    // other three demos' navs.
    const overflows = await page.evaluate(
      `document.documentElement.scrollWidth > document.documentElement.clientWidth`,
    );
    if (overflows) {
      await page.addStyleTag({
        content: `html,body{overflow-x:hidden!important;max-width:100%!important}`,
      });
      await page.waitForTimeout(800);
    }

    const png = join(scratch, `${slug}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 390, height: 844 } });
    await ctx.close();

    const out = `public/projects/${slug}/mobile.webp`;
    execFileSync("cwebp", ["-q", "88", "-quiet", png, "-o", out]);
    console.log(`✓ ${out}`);
  }

  rmSync(scratch, { recursive: true, force: true });
  await browser.close();
})();
