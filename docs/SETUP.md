# Account setup

The services the site is wired for. Turnstile and Search Console stay off
(with the site working normally) until their keys exist in Vercel. The
quote form needs Supabase or Resend to keep leads. After adding or changing any variable, redeploy:
Vercel → Deployments → latest → ⋯ → Redeploy.

Vercel variables live at: Vercel → project **matterpixel** → Settings →
Environment Variables. Tick **Production** (and **Preview** if you want to
test on preview links).

---

## 1. Bot protection — Cloudflare Turnstile (about 3 minutes)

Stops spam bots on the project form and the booking form. Real visitors
almost never see it; Cloudflare only shows a checkbox when unsure.

1. Log in to Cloudflare → left menu **Turnstile** → **Add widget**.
2. Widget name: `Matterpixel forms`.
3. Hostnames: `matterpixel.com`, `www.matterpixel.com`, and `localhost`
   (for local testing).
4. Widget mode: **Managed**. Pre-clearance: **No**.
5. Create. Cloudflare shows a **Site Key** and a **Secret Key**.
6. In Vercel add:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Site Key
   - `TURNSTILE_SECRET_KEY` = the Secret Key
7. Redeploy.

Check: open the contact page, send a test quote. It should go through as
before. In Cloudflare → Turnstile you'll see the widget's traffic graph.

---

## 2. Quote form — Supabase, backup email, n8n

Every quote is saved to Supabase first, then copied to email, then sent to
n8n. Each step runs on its own, so a quote is kept as long as Supabase or
the email works (app/api/quote/route.ts). Variables are listed in
`.env.example`.

1. Supabase → SQL Editor → paste and run `docs/supabase-inbound.sql`.
2. Supabase → Project Settings → API Keys → copy the project URL and a
   **secret** key (`sb_secret_…`) into `SUPABASE_URL` and
   `SUPABASE_SECRET_KEY`. Never put the secret key in a `NEXT_PUBLIC_`
   variable.
3. Resend: verify the sending domain in `LEAD_BACKUP_FROM`, then set
   `RESEND_API_KEY`, `LEAD_BACKUP_TO` and `LEAD_BACKUP_FROM`.
4. n8n (optional): set `QUOTE_WEBHOOK_URL` and `QUOTE_WEBHOOK_SECRET`. The
   webhook receives `event: "quote.created"` with the secret in the
   `x-pixelscout-secret` header. n8n should reject calls without it.
5. Redeploy.

Check: send a test quote. A row appears in `inbound`, and a
"[Lead backup]" email arrives. A failed step shows up in Vercel logs as
`quote.step1_supabase_failed`, `quote.step2_email_failed` or
`quote.step3_webhook_failed`.

## 3. Free audit call — Cal.com

Every audit CTA opens a Cal.com popup for `NEXT_PUBLIC_CAL_LINK`
(default `matterpixel/audit`). Without JavaScript it links straight to
`https://cal.com/matterpixel/audit`. Create that event type in Cal.com
(30 min, Google Meet), then set the variable if the link is different.

---

## 4. Google Search Console

1. <https://search.google.com/search-console> → **Add property** → choose
   **URL prefix** → `https://www.matterpixel.com/` → Continue.
2. Choose **HTML tag**. Copy only the value inside `content="…"`.
3. In Vercel add `GOOGLE_SITE_VERIFICATION` = that value → Redeploy.
4. Back in Search Console → **Verify**.
5. Left menu → **Sitemaps** → enter `sitemap.xml` → Submit.
6. Optional: **URL inspection** → paste the homepage → **Request indexing**.
   Repeat for the Insights articles.

Results appear over the following days. Check **Pages** and
**Core Web Vitals** in Search Console every few weeks.
